import { SlushyFactory } from './SlushyFactory'
import { AuthenticationMiddleware } from './AuthenticationMiddleware'

async function run() {
    const slushy = await SlushyFactory.create({ authenticationMiddleware: new AuthenticationMiddleware() })
    await slushy.start(3031)
    console.log('Started server')
}

run()
