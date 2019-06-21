import { TSFile } from '../../typescript/module/TSFile'
import { TSClassBuilder } from '../../typescript/TSClassBuilder'
import { TSInterfaceBuilder } from '../../typescript/TSInterfaceBuilder'

/**
 * Everything that is required for a working resource.
 */
export interface ApplicationResourceDescription {
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
 * export class ApplicationConfiguration implements SlushyResourceConfiguration {
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
export class ApplicationConfigurationFactory {
    create(
        applicationResourceDescriptions: ApplicationResourceDescription[],
        openApiConstantIdentifier: string,
        tsFile: TSFile
    ) {
        const applicationConfigurationClassBuilder = new TSClassBuilder('ApplicationConfiguration')
        const applicationConfigurationInterfaceBuilder = new TSInterfaceBuilder('Config')

        let bindings: string[] = []
        for (const {
            resourceType: resourceImplementation,
            resourceRouterType: routerImplementation,
        } of applicationResourceDescriptions) {
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
        tsFile.import(openApiConstantIdentifier)
        applicationConfigurationClassBuilder.addMethod({
            name: 'getOpenApiSchema',
            returnType: 'string',
            parameters: [],
            body: `return ${openApiConstantIdentifier}`,
        })

        tsFile.addSourceText(applicationConfigurationClassBuilder.build())
    }
}
