import { TSFile } from '../../typescript/module/TSFile'
import { ResourceOperation } from './ResourceOperation'
import { TSClassBuilder } from '../../typescript/TSClassBuilder'

/**
 * Creates a resource router (resource definition).
 * @example
 * export class PetsResourceRouter {
 *   async bind(router: SlushyRouter, resource: PetsResource) {
 *      router.get('/pets', resource.getPets)
 *   }
 * }
 */
export class ResourceRouterFactory {
    create(resourceType: string, resourceOperations: Array<ResourceOperation>, tsFile: TSFile): string {
        tsFile.import(resourceType)
        tsFile.import('SlushyRouter', '@slushy/server')

        const statements: string[] = []
        for (const { path, operationObject, method, parameterType, returnType } of resourceOperations) {
            if (!operationObject.operationId) {
                throw new Error('Missing operationId')
            }

            statements.push(
                `router.${method}<${parameterType}, ${returnType}>('${path}', resource.${
                    operationObject.operationId
                }.bind(resource))`
            )
        }

        const resourceRouterName = `${resourceType}Router`
        const routerClassBuilder = new TSClassBuilder(resourceRouterName)
        routerClassBuilder.addMethod({
            name: 'bindRoutes',
            async: true,
            parameters: [{ name: 'router', type: 'SlushyRouter' }, { name: 'resource', type: resourceType }],
            returnType: 'Promise<void>',
            body: statements.join('\n'),
        })
        tsFile.addSourceText(routerClassBuilder.build())
        return resourceRouterName
    }
}
