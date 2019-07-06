import { TSFile } from '../../typescript/TSFile'
import { TSInterfaceBuilder } from '../../typescript/TSInterfaceBuilder'
import { ResourceOperation } from './ResourceOperation'

/**
 * Creates a resource description.
 * @example
 * export interface PetsResource {
 *  getPetById(params: GetPetByIdParams): Promise<GetPetByIdResponse>
 * }
 */
export class ResourceFactory {
    /**
     * Creates a resource description.
     * @param resourceName Name of the resource. Example: Pets.
     * @param operations Operations that can be performed on the resource.
     * @returns The resource description name. Example PetsResource.
     */
    public create(resourceName: string, operations: ResourceOperation[], tsFile: TSFile): string {
        const resourceDescriptionName = `${resourceName}Resource`
        const interfaceBuilder = new TSInterfaceBuilder(resourceDescriptionName, 'TContext')
        tsFile.import('SlushyContext', '@slushy/server', true)

        for (const operation of operations) {
            tsFile.import(operation.returnType)
            tsFile.import(operation.parameterType)

            interfaceBuilder.addMethod({
                name: operation.name,
                returnType: `Promise<${operation.returnType}>`,
                parameters: [
                    { name: 'params', type: operation.parameterType },
                    { name: 'context', type: 'SlushyContext<TContext>' },
                ],
            })
        }

        const sourceText = interfaceBuilder.build()
        tsFile.addSourceText(sourceText)

        return resourceDescriptionName
    }
}
