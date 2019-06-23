import { SlushyRequest, SlushyResponse } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'

export interface MiddlewareFactory {
    create(
        props: SlushyProps<any>
    ): Array<(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any) => any>
}
