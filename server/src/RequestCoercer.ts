import { SlushyContext } from './SlushyContext'
import OpenApiRequestCoercer from 'openapi-request-coercer'

export class RequestCoercer<TContext> {
    /**
     * @note Modifies the request object.
     */
    public coerce(context: SlushyContext<TContext>): void {
        const coercer = new OpenApiRequestCoercer({
            enableObjectCoercion: true,
            parameters: context.operationObject.parameters || [],
        })
        coercer.coerce(context.req)
    }
}
