import { OpenAPIV3 } from "openapi-types";
import { JSONSchema4 } from "json-schema";
import { compile as compileJsonSchema } from 'json-schema-to-typescript'
import { fs } from "mz";
import * as path from 'path'
import Mustache from 'mustache'
import { groupBy } from 'lodash'
import { capitalize } from "./utils";
import { isReferenceObject } from "./isReferenceObject";
import { ResourceTemplatePathType } from "./templates/server/ResourceTemplatePathType";
import { ResourceTemplateType } from "./templates/server/ResourceTemplateType";

export interface ResourceFactoryContext {
    resources: {
        path: string
        resource: string
    }[]
}

export class ResourceFactory {
    context: ResourceFactoryContext = {
        resources: []
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

    async createResources(swagger: OpenAPIV3.Document, outDir: string) {
        if (!(await fs.exists(outDir))) {
            await fs.mkdir(outDir)
        }

        const destDir = path.join(outDir, 'resources')
        if (!(await fs.exists(destDir))) {
            await fs.mkdir(destDir)
        }

        const paths = await this.getPathDescriptions(swagger.paths)

        const groupByKey: keyof ResourceTemplatePathType = 'resourceName'
        const pathsByResource = groupBy(paths, groupByKey)

        const templateString = (await fs.readFile(path.join(__dirname, 'templates', 'server', 'ResourceTemplate.mustache'))).toString()

        for (const resourceName of Object.keys(pathsByResource)) {
            const resourceDescription: ResourceTemplateType = { resourceName, paths: pathsByResource[resourceName] }
            const resourceFileString = Mustache.render(templateString, resourceDescription)
            await fs.writeFile(path.join(destDir, `${resourceName}Resource.ts`), resourceFileString)
            this.context.resources.push({
                resource: `${resourceName}`,
                path: `./${resourceName}Resource.ts`,
            })
        }

        await this.createResourceConfig(destDir)
        await this.createIndexFile(destDir)
    }

    async createIndexFile(destDir: string) {
        const fileExports = this.context.resources.map(resource => `export * from '${resource.path.replace('.ts', '')}'`)
        fileExports.push(`export * from './ResourceConfig'`)
        await fs.writeFile(path.join(destDir, 'index.ts'), fileExports.join('\r\n'))
    }

    async createResourceConfig(destDir: string) {
        const templateString = (await fs.readFile(path.join(__dirname, 'templates', 'server', 'ResourceConfigTemplate.mustache'))).toString()
        const fileContent = Mustache.render(templateString, this.context)
        await fs.writeFile(path.join(destDir, 'ResourceConfig.ts'), fileContent)
    }

    async getPathDescriptions(swaggerPaths: OpenAPIV3.Document['paths']): Promise<ResourceTemplatePathType[]> {
        const pathDescriptions: ResourceTemplatePathType[] = []
        const swaggerPathsNames = Object.keys(swaggerPaths)

        for (const path of swaggerPathsNames) {
            const swaggerPathObject = swaggerPaths[path]
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
                    ...await this.getPathParameterDescription(pathItemObject),
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
        const definition = await compileJsonSchema(jsonResponseType.schema, name, { bannerComment: '' })
        return { definition, name }
    }

    async getPathParameterDescription(pathItemObject: OpenAPIV3.OperationObject): Promise<{ parameterTypeName: string, parameterTypeDefinition: string }> {
        const { parameters = [], operationId } = pathItemObject
        const inputTypeSchema = {
            type: 'object' as JSONSchema4['type'],
            properties: {} as { [k: string]: JSONSchema4 },
            additionalProperties: false,
            required: [] as string[],
        }

        for (const parameter of parameters) {
            if (isReferenceObject(parameter)) {
                throw new Error('$ref parameter definitions are not supported.')
            }

            if (parameter.required) {
                inputTypeSchema.required.push(parameter.name)
            }

            inputTypeSchema.properties[parameter.name] = {
                ...parameter.schema
            }
        }

        const parameterTypeName = capitalize(`${operationId}Params`)
        const parameterTypeDefinition = await compileJsonSchema(inputTypeSchema, parameterTypeName, { bannerComment: '' })
        return { parameterTypeName, parameterTypeDefinition }
    }
}
