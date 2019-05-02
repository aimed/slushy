/**
 * This abstracts away the underlying server implementation
 */
import express from 'express'
import { AtlantisProps } from "./AtlantisProps";

export class AtlantisApplicationFactory {
    public static create(): AtlantisApplication {
        return express()
    }
}

export class AtlantisRouterImplementationFactory {
    public static create(): AtlantisRouterImplementation {
        return express.Router()
    }
}

export type AtlantisRouterImplementation = express.Router
export type AtlantisApplication = express.Application
export type AtlantisRequest = express.Request
export type AtlantisResponse = express.Response
export type AtlantisRequestHandler = express.RequestHandler

export class OpenApiBridge {

    public makeRouterPath(path: string): string {
        return path.replace(/\{([a-zA-Z0-9]*)\}/g, (_match, matches) => `:${matches}`)
    }

    public makeSwaggerPath(path: string): string {
        return path.replace(/:([a-zA-Z0-9]*)/g, (_match, matches) => `{${matches}}`)
    }
}