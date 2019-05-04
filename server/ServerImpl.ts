/**
 * This abstracts away the underlying server implementation
 */
import express from 'express'

export class SlushyApplicationFactory {
    public static create(): SlushyApplication {
        return express()
    }
}

export class SlushyRouterImplementationFactory {
    public static create(): SlushyRouterImplementation {
        return express.Router()
    }
}

export type SlushyRouterImplementation = express.Router
export type SlushyApplication = express.Application
export type SlushyRequest = express.Request
export type SlushyResponse = express.Response
export type SlushyRequestHandler = express.RequestHandler

export class OpenApiBridge {

    public makeRouterPath(path: string): string {
        return path.replace(/\{([a-zA-Z0-9]*)\}/g, (_match, matches) => `:${matches}`)
    }

    public makeOASPath(path: string): string {
        return path.replace(/:([a-zA-Z0-9]*)/g, (_match, matches) => `{${matches}}`)
    }
}