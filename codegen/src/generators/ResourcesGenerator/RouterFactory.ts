import { TSClassBuilder } from '../../typescript/TSClassBuilder'
import { TSFile } from '../../typescript/TSFile'
import { ResourceOperation } from './ResourceOperation'

/**
 * Creates a resource router (resource definition).
 * @example
 * export class PetsResourceRouter {
 *   async bind(router: SlushyRouter, resource: PetsResource) {
 *      router.get('/pets', resource.getPets)
 *   }
 * }
 */
export class RouterFactory {
    public create(resourceType: string, resourceOperations: ResourceOperation[], tsFile: TSFile): string {
        tsFile.import(resourceType)
        tsFile.import('SlushyRouter', '@slushy/server', true)

        const statements: string[] = []
        for (const { path, operationObject, method, parameterType, bodyType, returnType } of resourceOperations) {
            if (!operationObject.operationId) {
                throw new Error('Missing operationId')
            }

            tsFile.import(parameterType)
            tsFile.import(bodyType)
            tsFile.import(returnType)
            statements.push(
                `router.${method}<${parameterType}, ${bodyType}, ${returnType}>('${path}', resource.${operationObject.operationId}.bind(resource))`,
            )
        }

        const resourceRouterName = `${resourceType}Router`
        const routerClassBuilder = new TSClassBuilder(resourceRouterName, 'TContext')
        routerClassBuilder.addMethod({
            name: 'bindRoutes',
            async: true,
            parameters: [
                { name: 'router', type: 'SlushyRouter<TContext>' },
                { name: 'resource', type: `${resourceType}<TContext>` },
            ],
            returnType: 'Promise<void>',
            body: statements.join('\n'),
        })
        tsFile.addSourceText(routerClassBuilder.build())
        return resourceRouterName
    }
}
