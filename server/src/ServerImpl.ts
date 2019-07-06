/**
 * This abstracts away the underlying server implementation
 */
import express from 'express'

export type SlushyRouterImplementation = express.Router
export type SlushyApplication = express.Application
export type SlushyRequest = express.Request
export type SlushyResponse = express.Response
export type SlushyRequestHandler = express.RequestHandler
export type SlushyErrorRequestHandler = express.ErrorRequestHandler

export class OpenApiBridge {
    public makeRouterPath(path: string): string {
        return path.replace(/\{([a-zA-Z0-9]*)\}/g, (_match, matches) => `:${matches}`)
    }

    public makeOASPath(path: string): string {
        return path.replace(/:([a-zA-Z0-9]*)/g, (_match, matches) => `{${matches}}`)
    }
}
