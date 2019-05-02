import { AtlantisProps } from "./AtlantisProps";
import { OpenAPIV3 } from 'openapi-types';
import { AtlantisRequest, AtlantisResponse } from "./ServerImpl";
export type AtlantisContext<TContext = {}> = {
    req: AtlantisRequest;
    res: AtlantisResponse;
    props: AtlantisProps;
    pathItemObject: OpenAPIV3.PathItemObject;
    operationObject: OpenAPIV3.OperationObject;
}; // TODO: & TContext

