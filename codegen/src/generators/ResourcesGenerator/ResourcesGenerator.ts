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

export class ResourcesGenerator implements Generator {
    dependsOn = [ComponentSchemaTypesGenerator]

    async generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void> {
        // TODO: This replaces ResourceTemplate
        // TODO: Create Responses (done)
        // TODO: Create Parameters ()
        // TODO: Create Resource ()
        // TODO: Create ResourceRouter ()

        // throw new Error("Method not implemented.")
        const resourceRouterNames: string[] = []

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

                    const responseTypeFactory = new ResponseTypeFactory()
                    const responseType = responseTypeFactory.declarePathResponseType(operationObject, tsFile)

                    const parameterTypeFactory = new ParameterTypeFactory()
                    const parameterType = parameterTypeFactory.declareParameterType(operationObject, tsFile)
                    resourceOperations.push({
                        path,
                        responseType,
                        parameterType,
                        pathItemObject,
                        method: pathOperationKey,
                    })
                }
            }

            const resourceRouterFactory = new ResourceRouterFactory()
            const resourceRouterName = resourceRouterFactory.declareResourceRouter(
                resourceName,
                resourceOperations,
                tsFile
            )
            resourceRouterNames.push(resourceRouterName)
        }

        // TODO: Do things with resourceRouterNames -> Generate the ApplicationConfiguration
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
