import { AtlantisRequest, AtlantisResponse } from "../ServerImpl";
import { AtlantisProps } from "../AtlantisProps";

export interface Middleware {
    // new(): Middleware
    create(props: AtlantisProps): Array<(req: AtlantisRequest, res: AtlantisResponse, next: (error?: Error) => any) => any>
}
