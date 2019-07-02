export interface LoggerFactory {
    /**
     * Creates a logger.
     * @param context A context the logger is used in. In most cases this will be the request id.
     */
    create(context: string): Logger
}

export interface Logger {
    log(...params: any[]): any
    info(...params: any[]): any
    error(...params: any[]): any
}
export abstract class Logger {}

export class DefaultLoggerFactory implements LoggerFactory {
    create(context: string) {
        return {
            log: (...params: any[]) => console.log(context, ...params),
            info: (...params: any[]) => console.info(context, ...params),
            error: (...params: (any | Error)[]) => console.error(context, ...params),
        }
    }
}
