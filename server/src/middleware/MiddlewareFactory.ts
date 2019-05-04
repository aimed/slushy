import { SlushyRequest, SlushyResponse } from "../ServerImpl";
import { SlushyProps } from "../SlushyProps";

export interface MiddlewareFactory {
    // new(): Middleware
    create(props: SlushyProps): Array<(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any) => any>
}
