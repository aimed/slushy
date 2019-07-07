/**
 * This abstracts away the underlying server implementation
 */
import express from 'express'
import { OpenAPIV3 } from 'openapi-types'
import { Logger } from './LoggerFactory'

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

export const LoggerSymbol = Symbol('Logger')
export const RequestIdSymbol = Symbol('RequestId')
export const PathItemObjectSymbol = Symbol('PathItemObject')
export const OperationObjectSymbol = Symbol('OperationObject')

declare global {
    namespace Express {
        interface Request {
            [LoggerSymbol]: Logger
            [RequestIdSymbol]: string
            [PathItemObjectSymbol]: OpenAPIV3.PathItemObject
            [OperationObjectSymbol]: OpenAPIV3.OperationObject
        }
    }
}
