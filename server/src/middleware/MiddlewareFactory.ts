import { SlushyRequest, SlushyResponse } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'

export interface MiddlewareFactory {
    create(
        props: SlushyProps<any>,
        path?: string,
        operation?: PathHttpOperation
    ): Array<(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any) => any>
}
