import { groupBy } from 'lodash'
import { OpenAPIV3 } from 'openapi-types'
import * as fsPath from 'path'
import { TSModule } from '../../typescript/TSModule'
import { capitalize } from '../../typescript/utils'
import { ComponentSchemaResponsesGenerator } from '../ComponentSchemaResponsesGenerator'
import { ComponentSchemaTypesGenerator } from '../ComponentSchemaTypesGenerator'
import { Generator } from '../Generator'
import { httpVerbPathOperations } from './httpVerbPathOperations'
import { OpenApiConstantFactory } from './OpenApiConstantFactory'
import { ParameterTypeFactory } from './ParameterTypeFactory'
import { ResourceFactory } from './ResourceFactory'
import { ResourceOperation } from './ResourceOperation'
import { ResourcesConfigurationDescription, ResourcesConfigurationFactory } from './ResourcesConfigurationFactory'
import { ResponseTypeFactory } from './ResponseTypeFactory'
import { RouterFactory } from './RouterFactory'

export class ResourcesGenerator implements Generator {
    public dependsOn = [ComponentSchemaTypesGenerator, ComponentSchemaResponsesGenerator]

    public async generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void> {
        const applicationResourceDescriptions: ResourcesConfigurationDescription[] = []

        const pathsWithResourceName = Object.entries(document.paths).map(([path, pathItemObject]) => ({
            path,
            pathItemObject,
            resourceName: this.getResourceNameForPath(path),
        }))
        const groupedPathsWithResourceName = groupBy(pathsWithResourceName, item => item.resourceName)

        // For every resource, e.g. /pet create the response type, the parameter type and the resource router.
        for (const [resourceName, resourcePathDescriptions] of Object.entries(groupedPathsWithResourceName)) {
            const tsFile = tsModule.file(fsPath.join('resources', `${capitalize(resourceName)}Resource.ts`))
            const resourceOperations: ResourceOperation[] = []

            // For every path on a resource
            for (const resourcePathDescription of resourcePathDescriptions) {
                const { path, pathItemObject } = resourcePathDescription

                // For every operation on a resource, e.g. getPet (GET /pets)
                for (const pathOperationKey of httpVerbPathOperations) {
                    const operationObject = pathItemObject[pathOperationKey]
                    if (!operationObject) {
                        continue
                    }

                    if (!operationObject.operationId) {
                        throw new Error('Missing operationId')
                    }

                    const responseTypeFactory = new ResponseTypeFactory()
                    const responseType = responseTypeFactory.declarePathResponseType(operationObject, tsFile)

                    const parameterTypeFactory = new ParameterTypeFactory()
                    const parameterType = parameterTypeFactory.declareParameterType(operationObject, tsFile)

                    const resourceOperation: ResourceOperation = {
                        name: operationObject.operationId,
                        path,
                        returnType: responseType,
                        parameterType,
                        pathItemObject,
                        method: pathOperationKey,
                        operationObject,
                    }
                    resourceOperations.push(resourceOperation)
                }
            }

            const resourceFactory = new ResourceFactory()
            const resourceType = resourceFactory.create(resourceName, resourceOperations, tsFile)

            const resourceRouterFile = tsModule.file(fsPath.join('resources', `${capitalize(resourceName)}Router.ts`))
            const resourceRouterFactory = new RouterFactory()
            const resourceRouterType = resourceRouterFactory.create(
                resourceType,
                resourceOperations,
                resourceRouterFile,
            )
            applicationResourceDescriptions.push({
                resourceRouterType,
                resourceName,
                resourceType,
            })
        }
        const openApiConstantFile = tsModule.file('openApi.ts')
        const openApiConstantFactory = new OpenApiConstantFactory()
        const openApiConstantIdentifier = await openApiConstantFactory.create(document, openApiConstantFile)

        const applicationConfigurationFile = tsModule.file('ResourcesConfiguration.ts')
        const applicationConfigurationFactory = new ResourcesConfigurationFactory()
        applicationConfigurationFactory.create(
            applicationResourceDescriptions,
            openApiConstantIdentifier,
            'openApi.ts',
            applicationConfigurationFile,
        )
    }

    /**
     * For a given path create a resource name.
     * @example
     * /         -> Index
     * /pets     -> Pets
     * /pets/:id -> Pets
     */
    private getResourceNameForPath(path: string): string {
        const [, prefix] = path.split('/')
        if (!prefix || prefix.startsWith('{')) {
            return capitalize('index')
        }
        return capitalize(prefix)
    }
}
