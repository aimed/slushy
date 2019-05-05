import { OpenAPIV3 } from 'openapi-types'
import { groupBy } from 'lodash'
import { capitalize } from './utils'
import { isReferenceObject } from './isReferenceObject'
import { ResourceTemplatePathType } from './templates/server/ResourceTemplatePathType'
import { ResourceTemplateType } from './templates/server/ResourceTemplateType'
import { CodeGenContext } from './CodeGenContext'
import { TypeFactory } from './TypeFactory'
import { log } from './log'

export interface ResourceFactoryContext {
    resources: {
        path: string
        resource: string
    }[]
    importedTypes: string[]
}

export class ResourceFactory {
    public constructor(private readonly typeFactory = new TypeFactory()) { }

    context: ResourceFactoryContext = {
        resources: [],
        importedTypes: [],
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
                importedTypes: Array.from(new Set(this.context.importedTypes)),
            }
            const resourceFileString = await context.renderTemplate('ResourceTemplate.mustache', resourceDescription)
            await context.writeFile(
                context.joinPath(destDir, `${resourceName}Resource.ts`),
                context.prettifyTS(resourceFileString)
            )
            this.context.resources.push({
                resource: `${resourceName}`,
                path: `./${resourceName}Resource.ts`,
            })
        }

        await this.createResourceConfig(context)
        await this.createIndexFile(context)
    }

    async createIndexFile(context: CodeGenContext) {
        log('Creating exports')
        const fileExports = this.context.resources.map(
            resource => `export * from '${resource.path.replace('.ts', '')}'`
        )
        fileExports.push(`export * from './ResourceConfig'`)
        await context.writeFile(context.joinPath(this.getOutDir(context), 'index.ts'), fileExports.join('\r\n'))
    }

    async createResourceConfig(context: CodeGenContext) {
        log('Creating ResourceConfig')
        const fileContent = await context.renderTemplate('ResourceConfigTemplate.mustache', this.context)
        await context.writeFile(
            context.joinPath(this.getOutDir(context), 'ResourceConfig.ts'),
            context.prettifyTS(fileContent)
        )
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

    async getPathResponseDescription(
        pathItemObject: OpenAPIV3.OperationObject
    ): Promise<ResourceTemplatePathType['response']> {
        if (!pathItemObject.responses) {
            throw new Error('Missing responses')
        }

        if (!pathItemObject.operationId) {
            throw new Error('Missing operationId')
        }

        // FIXME: Handle all positive response codes, like 201 and 204
        const response = pathItemObject.responses['200']
        if (!response) {
            throw new Error('Response for status code 200 is not defined')
        }

        if (isReferenceObject(response)) {
            throw new Error('References for responses are not allowed')
        }

        const { content } = response
        let responseSchema:
            | OpenAPIV3.ReferenceObject
            | OpenAPIV3.ArraySchemaObject
            | OpenAPIV3.NonArraySchemaObject
            | undefined = undefined

        if (content) {
            // TODO: Handle more cases.
            const jsonResponseType = content['application/json']
            if (!jsonResponseType) {
                throw new Error('No content for application/json defined')
            }

            if (!jsonResponseType.schema) {
                throw new Error('No schema is defined')
            }

            responseSchema = jsonResponseType.schema
        }

        const name = `${capitalize(pathItemObject.operationId)}Response`
        const definition = this.typeFactory.createType(responseSchema, name, this.context.importedTypes)
        return { definition, name }
    }

    async getPathParameterDescription(
        pathItemObject: OpenAPIV3.OperationObject
    ): Promise<ResourceTemplatePathType['parameter']> {
        const { parameters = [], operationId, requestBody } = pathItemObject
        const inputTypeSchema = {
            type: 'object' as 'object',
            properties: {} as { [k: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject },
            additionalProperties: false,
            required: [] as string[],
        }

        for (const parameter of parameters) {
            if (isReferenceObject(parameter)) {
                throw new Error('Parameter $ref definitions are not supported, maybe you forgot to bundle.')
            }

            if (!parameter.schema) {
                throw new Error(`No schema defined for parameter ${parameter.name} of operation ${operationId}.`)
            }

            if (parameter.in === 'body') {
                throw new Error(
                    'Parameters with `in: body` are not allowed, please use `requestBody` instead. For more details see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#requestBodyObject.'
                )
            }

            if (parameter.required) {
                inputTypeSchema.required.push(parameter.name)
            }

            inputTypeSchema.properties[parameter.name] = {
                ...parameter.schema,
            }
        }

        if (requestBody) {
            if (isReferenceObject(requestBody)) {
                throw new Error('RequestBody $ref definitions are not supported, maybe you forgot to bundle.')
            }

            const requestBodySchema: OpenAPIV3.SchemaObject & Required<Pick<OpenAPIV3.NonArraySchemaObject, 'anyOf'>> = {
                type: "object",
                anyOf: []
            }

            for (const requestBodyMimeType of Object.keys(requestBody.content)) {
                const mediaObject = requestBody.content[requestBodyMimeType]
                if (!mediaObject.schema) {
                    // TODO: Maybe it is not?
                    throw new Error(`Schema is required for MIME type ${requestBodyMimeType}`)
                }
                requestBodySchema.anyOf.push(mediaObject.schema)
            }

            const requestBodyInputKey = 'requestBody'
            inputTypeSchema.properties[requestBodyInputKey] = requestBodySchema
            if (requestBody.required) {
                inputTypeSchema.required.push(requestBodyInputKey)
            }
        }

        const name = capitalize(`${operationId}Params`)
        const definition = this.typeFactory.createType(inputTypeSchema, name, this.context.importedTypes)
        return { name, definition }
    }
}
