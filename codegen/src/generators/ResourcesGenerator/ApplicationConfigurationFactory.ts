import { TSFile } from '../../typescript/module/TSFile'
import { TSClassBuilder } from '../../typescript/TSClassBuilder'
import { TSInterfaceBuilder } from '../../typescript/TSInterfaceBuilder'

/**
 * Everything that is required for a working resource.
 */
export interface ResourceDefinition {
    /**
     * @example Pets
     */
    resourceName: string
    /**
     * @example PetsRouter
     */
    routerImplementation: string
    /**
     * @example PetsResource
     */
    resourceImplementation: string
}

/**
 * Creates the global application configuration that will be passed to slushy server.
 * @example
 * export class ApplicationConfiguration implements SlushyResourceConfiguration {
 *  constructor(private readonly config: {
 *      PetsResource: PetsResource,
 *  }) {}
 *
 *  configure(router: SlushyRouter) {
 *      return Promise.all([new PetsResourceRouter().bindRoutes(router, this.config.PetsResource)])
 *  }
 *
 *  getOpenApi() {
 *      return openApiSchemaJson
 *  }
 * }
 */
export class ApplicationConfigurationFactory {
    create(
        resourceDefinitions: ResourceDefinition[],
        openApiSchema: { identifier: string; path: string },
        tsFile: TSFile
    ) {
        const applicationConfigurationClassBuilder = new TSClassBuilder('ApplicationConfiguration')
        const applicationConfigurationInterfaceBuilder = new TSInterfaceBuilder('Config')

        let bindings: string[] = []
        for (const { resourceImplementation, routerImplementation } of resourceDefinitions) {
            tsFile.import(resourceImplementation)
            tsFile.import(routerImplementation)
            bindings.push(
                `await new ${routerImplementation}().bindRoutes(router, this.config.${resourceImplementation})`
            )

            applicationConfigurationInterfaceBuilder.addProperty({
                name: resourceImplementation,
                type: resourceImplementation,
            })
        }
        applicationConfigurationClassBuilder.addConstructorParameter({ name: 'config', type: 'Config' })
        applicationConfigurationClassBuilder.addMethod({
            name: 'configure',
            parameters: [{ name: 'router', type: 'SlushyRouter' }],
            returnType: 'Promise<void>',
        })
        tsFile.import('SlushyRouter', '@slushy/server')

        // openApiSchema
        tsFile.import(openApiSchema.identifier, openApiSchema.path)
        applicationConfigurationClassBuilder.addMethod({
            name: 'getOpenApiSchema',
            returnType: 'string',
            parameters: [],
            body: `return ${openApiSchema.identifier}`,
        })

        tsFile.addSourceText(applicationConfigurationClassBuilder.build())
    }
}
