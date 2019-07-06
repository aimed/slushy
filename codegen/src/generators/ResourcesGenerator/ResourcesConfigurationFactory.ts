import { TSClassBuilder } from '../../typescript/TSClassBuilder'
import { TSFile } from '../../typescript/TSFile'
import { TSInterfaceBuilder } from '../../typescript/TSInterfaceBuilder'

/**
 * Everything that is required for a working resource.
 */
export interface ResourcesConfigurationDescription {
    /**
     * @example Pets
     */
    resourceName: string
    /**
     * @example PetsRouter
     */
    resourceRouterType: string
    /**
     * @example PetsResource
     */
    resourceType: string
}

/**
 * Creates the global application configuration that will be passed to slushy server.
 * @example
 * export class ResourcesConfiguration implements SlushyResourceConfiguration {
 *  constructor(private readonly config: {
 *      PetsResource: PetsResource,
 *  }) {}
 *
 *  configure(router: SlushyRouter) {
 *      return Promise.all([await new PetsResourceRouter().bindRoutes(router, this.config.PetsResource)])
 *  }
 *
 *  getOpenApi() {
 *      return openApiSchemaJson
 *  }
 * }
 */
export class ResourcesConfigurationFactory {
    public create(
        applicationResourceDescriptions: ResourcesConfigurationDescription[],
        openApiConstantIdentifier: string,
        openApiConstantSourceFile: string,
        tsFile: TSFile,
    ) {
        const resourcesConfigurationClassBuilder = new TSClassBuilder('ResourcesConfiguration', 'TContext')
        const resourcesConfigurationInterfaceBuilder = new TSInterfaceBuilder('Config', 'TContext')

        const bindings: string[] = []
        for (const { resourceType, resourceRouterType } of applicationResourceDescriptions) {
            tsFile.import(resourceType)
            tsFile.import(resourceRouterType)
            bindings.push(`await new ${resourceRouterType}<TContext>().bindRoutes(router, this.config.${resourceType})`)

            resourcesConfigurationInterfaceBuilder.addProperty({
                name: resourceType,
                type: `${resourceType}<TContext>`,
            })
        }
        tsFile.addSourceText(resourcesConfigurationInterfaceBuilder.build())

        resourcesConfigurationClassBuilder.addConstructorParameter({ name: 'config', type: 'Config<TContext>' })
        resourcesConfigurationClassBuilder.addMethod({
            name: 'configure',
            async: true,
            parameters: [{ name: 'router', type: 'SlushyRouter<TContext>' }],
            returnType: 'Promise<void>',
            body: bindings.join('\n'),
        })
        tsFile.import('SlushyRouter', '@slushy/server', true)

        // openApiSchema
        tsFile.import(openApiConstantIdentifier, openApiConstantSourceFile)
        resourcesConfigurationClassBuilder.addMethod({
            name: 'getOpenApiSchema',
            returnType: 'string',
            parameters: [],
            body: `return ${openApiConstantIdentifier}`,
        })

        tsFile.addSourceText(resourcesConfigurationClassBuilder.build())
    }
}
