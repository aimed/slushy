import { SlushyRequestHandler } from '../ServerImpl'
import { SlushyProps } from '../SlushyProps'
import { PathHttpOperation } from '../types/PathHttpOperation'

export interface MiddlewareFactory {
    create(props: SlushyProps<any>, path?: string, operation?: PathHttpOperation): Array<SlushyRequestHandler>
}
