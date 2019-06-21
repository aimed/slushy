import { Generator } from '../Generator'
import { TSModule } from '../../typescript/module/TSModule'
import { OpenAPIV3 } from 'openapi-types'
import { ComponentSchemaTypesGenerator } from '../ComponentSchemaTypesGenerator'
import { capitalize } from '../../typescript/module/utils'
import { groupBy } from 'lodash'
import * as path from 'path'
import { ParameterTypeFactory } from './ParameterTypeFactory'
import { ResponseTypeFactory } from './ResponseTypeFactory'
import { ResourceRouterFactory } from './ResourceRouterFactory'
import { ResourceOperation } from './ResourceOperation'
import { httpVerbPathOperations } from './httpVerbPathOperations'
import { ResourceDefinitionFactory } from './ResourceDefinitionFactory'
import { ApplicationConfigurationFactory, ApplicationResourceDescription } from './ApplicationConfigurationFactory'
import { OpenApiConstantFactory } from './OpenApiConstantFactory'

export class ResourcesGenerator implements Generator {
    dependsOn = [ComponentSchemaTypesGenerator]

    async generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void> {
        const applicationResourceDescriptions: ApplicationResourceDescription[] = []

        const pathsWithResourceName = Object.entries(document.paths).map(([path, pathItemObject]) => ({
            path,
            pathItemObject,
            resourceName: this.getResourceNameForPath(path),
        }))
        const groupedPathsWithResourceName = groupBy(pathsWithResourceName, item => item.resourceName)

        // For every resource, e.g. /pet create the response type, the parameter type and the resource router.
        for (const [resourceName, resourcePathDescriptions] of Object.entries(groupedPathsWithResourceName)) {
            const tsFile = tsModule.file(path.join('resources', `${capitalize(resourceName)}.ts`))
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
                    }
                    resourceOperations.push(resourceOperation)
                }
            }

            const resourceFactory = new ResourceDefinitionFactory()
            const resourceType = resourceFactory.create(resourceName, resourceOperations, tsFile)

            const resourceRouterFile = tsModule.file(path.join('resources', `${capitalize(resourceName)}Router.ts`))
            const resourceRouterFactory = new ResourceRouterFactory()
            const resourceRouterType = resourceRouterFactory.create(
                resourceType,
                resourceOperations,
                resourceRouterFile
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

        const applicationConfigurationFile = tsModule.file('ApplicationConfiguration.ts')
        const applicationConfigurationFactory = new ApplicationConfigurationFactory()
        applicationConfigurationFactory.create(
            applicationResourceDescriptions,
            openApiConstantIdentifier,
            'openApi.ts',
            applicationConfigurationFile
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
