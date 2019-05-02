import { AtlantisRequest, AtlantisResponse } from "../ServerImpl";

export interface Middleware {
    create(): (req: AtlantisRequest, res: AtlantisResponse, next: (error?: Error) => any) => any
}
