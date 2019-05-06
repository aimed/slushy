import { Slushy, SlushyConfig, SlushyPlugins } from '@slushy/server'
import { ResourceConfig } from './generated/resources'
import { PetsResourceImpl } from './PetsResourceImpl'

export class SlushyFactory {
    public static async create(config: Partial<SlushyConfig> & Partial<SlushyPlugins> = {}) {
        const slushy = await Slushy.create({
            ...config,
            resourceConfiguration: new ResourceConfig({
                PetsResource: new PetsResourceImpl(),
            }),
        })
        return slushy
    }
}
