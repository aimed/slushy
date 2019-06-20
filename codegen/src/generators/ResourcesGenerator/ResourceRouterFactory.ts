import { TSFile } from '../../typescript/module/TSFile'
import { ResourceOperation } from './ResourceOperation'

/**
 * Creates a resource router (resource definition).
 * @example
 * export class PetsResourceRouter {
 *   bind(router: SlushyRouter, resource: PetsResource) {
 *      router.get('/pets', resource.getPets)
 *   }
 * }
 */
export class ResourceRouterFactory {
    create(_resourceName: string, _resourceOperations: Array<ResourceOperation>, _tsFile: TSFile): string {
        throw new Error('Method not implemented.')
        // TODO: return the resource router class name
    }
}
