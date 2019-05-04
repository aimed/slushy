import { SlushyRequest, SlushyResponse } from "../ServerImpl";
import { SlushyProps } from "../SlushyProps";

export interface Middleware {
    // new(): Middleware
    create(props: SlushyProps): Array<(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any) => any>
}
