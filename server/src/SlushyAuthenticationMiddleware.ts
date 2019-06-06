import { SlushyRequest, SlushyResponse } from "./ServerImpl";

export interface SlushyAuthenticationMiddleware {
    execute(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any): any
}