import { Slushy, SlushyConfig, SlushyPlugins } from '@slushy/server'
import { PetsResourceImpl } from './PetsResourceImpl'
import { ResourcesConfiguration } from './generated/ResourcesConfiguration'

export class SlushyFactory {
    public static async create(config: Partial<SlushyConfig> & Partial<SlushyPlugins> = {}) {
        const slushy = await Slushy.create({
            ...config,
            resourceConfiguration: new ResourcesConfiguration({
                PetsResource: new PetsResourceImpl(),
            }),
        })
        return slushy
    }
}
