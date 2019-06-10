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

}
