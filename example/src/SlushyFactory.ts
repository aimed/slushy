import { Slushy, SlushyConfig, SlushyPlugins, BadRequestError } from '@slushy/server'
import { PetsResourceImpl } from './PetsResourceImpl'
import { ResourcesConfiguration } from './generated/ResourcesConfiguration'
import { Context } from './Context'
import { FeaturesResourceImpl } from './FeaturesResourceImpl'
import { RequestValidationError } from '@slushy/server/dist/middleware/RequestValidatorMiddlewareFactory'
import { HttpResourceImpl } from './HttpResourceImpl'
import { ValidationResourceImpl } from './ValidationResourceImpl'

export class SlushyFactory {
    public static async create(
        config: Partial<SlushyConfig<Context>> & Partial<SlushyPlugins> = {}
    ): Promise<Slushy<Context>> {
        const slushy = await Slushy.create<Context>({
            transformError: (error, _req) => {
                if (error instanceof RequestValidationError) {
                    return new BadRequestError(error)
                }
                return undefined
            },
            contextFactory: async _ctx => ({}),
            ...config,
            resourceConfiguration: new ResourcesConfiguration({
                PetsResource: new PetsResourceImpl(),
                FeaturesResource: new FeaturesResourceImpl(),
                HttpResource: new HttpResourceImpl(),
                ValidationResource: new ValidationResourceImpl(),
            }),
        })
        return slushy
    }
}
