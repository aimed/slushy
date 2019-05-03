import { OpenAPIV3 } from "openapi-types";
import { groupBy } from 'lodash'
import { capitalize } from "./utils";
import { isReferenceObject } from "./isReferenceObject";
import { ResourceTemplatePathType } from "./templates/server/ResourceTemplatePathType";
import { ResourceTemplateType } from "./templates/server/ResourceTemplateType";
import { CodeGenContext } from "./CodeGenContext";
import { TypeFactory } from "./TypeFactory";
import { log } from "./log";

export interface ResourceFactoryContext {
    resources: {
        path: string
        resource: string
    }[],
    importedTypes: string[],
}

export class ResourceFactory {
    public constructor(private readonly typeFactory = new TypeFactory()) { }

    context: ResourceFactoryContext = {
        resources: [],
        importedTypes: []
    }

    /**
     * For a given path create a resource name.
     * @example
     * /         -> Index
     * /pets     -> Pets
     * /pets/:id -> Pets
     */
    getResourceNameForPath(path: string): string {
        const [, prefix] = path.split('/')
        if (!prefix || prefix.startsWith('{')) {
            return capitalize('index')
        }
        return capitalize(prefix)
    }

    getOutDir(context: CodeGenContext): string {
        return context.joinPath(context.destDir, 'resources')
    }

    async createResources(context: CodeGenContext) {
        const { mkDir } = context

        const destDir = this.getOutDir(context)
        await mkDir(destDir)

        const paths = await this.getPathDescriptions(context)

        const groupByKey: keyof ResourceTemplatePathType = 'resourceName'
        const pathsByResource = groupBy(paths, groupByKey)

        for (const resourceName of Object.keys(pathsByResource)) {
            log('Creating resource', resourceName)
            const resourceDescription: ResourceTemplateType = {
                resourceName,
                paths: pathsByResource[resourceName],
                importedTypes: Array.from(new Set(this.context.importedTypes))
            }
            const resourceFileString = await context.renderTemplate('ResourceTemplate.mustache', resourceDescription)
            await context.writeFile(context.joinPath(destDir, `${resourceName}Resource.ts`), context.prettifyTS(resourceFileString))
            this.context.resources.push({
                resource: `${resourceName}`,
                path: `./${resourceName}Resource.ts`,
            })
        }

        log('Creating ResourceConfig')
        await this.createResourceConfig(context)
        log('Creating exports')
        await this.createIndexFile(context)
    }

    async createIndexFile(context: CodeGenContext) {
        const fileExports = this.context.resources.map(resource => `export * from '${resource.path.replace('.ts', '')}'`)
        fileExports.push(`export * from './ResourceConfig'`)
        await context.writeFile(context.joinPath(this.getOutDir(context), 'index.ts'), fileExports.join('\r\n'))
    }

    async createResourceConfig(context: CodeGenContext) {
        const fileContent = await context.renderTemplate('ResourceConfigTemplate.mustache', this.context)
        await context.writeFile(context.joinPath(this.getOutDir(context), 'ResourceConfig.ts'), context.prettifyTS(fileContent))
    }

    async getPathDescriptions(context: CodeGenContext): Promise<ResourceTemplatePathType[]> {
        const { openApi } = context
        const pathDescriptions: ResourceTemplatePathType[] = []
        const swaggerPathsNames = Object.keys(openApi.paths)

        for (const path of swaggerPathsNames) {
            const swaggerPathObject = openApi.paths[path]
            const resourceName = this.getResourceNameForPath(path)
            const pathVerbs: ResourceTemplatePathType['method'][] = ['get', 'post', 'delete', 'put', 'options', 'head']
            for (const pathVerb of pathVerbs) {
                const pathItemObject = swaggerPathObject[pathVerb]

                if (!pathItemObject) {
                    continue
                }

                if (!pathItemObject.operationId) {
                    throw new Error(`No operationId defined for path ${path}.${pathVerb}.`)
                }

                pathDescriptions.push({
                    path,
                    resourceName,
                    method: pathVerb,
                    operationId: pathItemObject.operationId,
                    response: await this.getPathResponseDescription(pathItemObject),
                    parameter: await this.getPathParameterDescription(pathItemObject),
                })
            }
        }

        return pathDescriptions
    }

    async getPathResponseDescription(pathItemObject: OpenAPIV3.OperationObject): Promise<ResourceTemplatePathType['response']> {
        if (!pathItemObject.responses) {
            throw new Error('Missing responses')
        }

        if (!pathItemObject.operationId) {
            throw new Error('Missing operationId')
        }

        // FIXME: Handle all positive response codes
        const response = pathItemObject.responses['200']
        if (!response) {
            throw new Error('Response for status code 200 is not defined')
        }

        if (isReferenceObject(response)) {
            throw new Error('References for responses are not allowed')
        }

        const { content = {} } = response
        const jsonResponseType = content['application/json']
        if (!jsonResponseType) {
            throw new Error('No content for application/json defined')
        }

        if (!jsonResponseType.schema) {
            throw new Error('No schema is defined')
        }

        const name = `${capitalize(pathItemObject.operationId)}Response`
        const definition = this.typeFactory.createType(jsonResponseType.schema, name, this.context.importedTypes)
        return { definition, name }
    }

    async getPathParameterDescription(pathItemObject: OpenAPIV3.OperationObject): Promise<ResourceTemplatePathType['parameter']> {
        const { parameters = [], operationId } = pathItemObject
        const inputTypeSchema = {
            type: 'object' as 'object',
            properties: {} as { [k: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject },
            additionalProperties: false,
            required: [] as string[],
        }

        for (const parameter of parameters) {
            if (isReferenceObject(parameter)) {
                // TODO: Can probably just be set
                throw new Error('$ref parameter definitions are not supported')
            }

            if (!parameter.schema) {
                throw new Error(`No schema defined for parameter ${parameter.name} of operation ${operationId}`)
            }

            if (parameter.required) {
                inputTypeSchema.required.push(parameter.name)
            }

            inputTypeSchema.properties[parameter.name] = {
                ...parameter.schema
            }
        }

        const name = capitalize(`${operationId}Params`)
        const definition = this.typeFactory.createType(inputTypeSchema, name, this.context.importedTypes)
        return { name, definition }
    }
}
