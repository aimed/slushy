import { Slushy, SlushyConfig, SlushyPlugins } from '@slushy/server'
import { PetsResourceImpl } from './PetsResourceImpl'
import { ResourcesConfiguration } from './generated/ResourcesConfiguration'
import { Context } from './Context'

export class SlushyFactory {
    public static async create(
        config: Partial<SlushyConfig<Context>> & Partial<SlushyPlugins> = {}
    ): Promise<Slushy<Context>> {
        const slushy = await Slushy.create<Context>({
            contextFactory: ctx => ({ ...ctx, context: {} }),
            ...config,
            resourceConfiguration: new ResourcesConfiguration({
                PetsResource: new PetsResourceImpl(),
            }),
        })
        return slushy
    }
}
