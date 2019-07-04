import { Slushy, SlushyConfig, SlushyPlugins } from '@slushy/server'
import { PetsResourceImpl } from './PetsResourceImpl'
import { ResourcesConfiguration } from './generated/ResourcesConfiguration'
import { Context } from './Context'
import { FeaturesResourceImpl } from './FeaturesResourceImpl'

export class SlushyFactory {
    public static async create(
        config: Partial<SlushyConfig<Context>> & Partial<SlushyPlugins> = {}
    ): Promise<Slushy<Context>> {
        const slushy = await Slushy.create<Context>({
            contextFactory: async _ctx => ({}),
            ...config,
            resourceConfiguration: new ResourcesConfiguration({
                PetsResource: new PetsResourceImpl(),
                FeaturesResource: new FeaturesResourceImpl(),
            }),
        })
        return slushy
    }
}
