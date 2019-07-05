import OpenAPIDefaultSetter from 'openapi-default-setter'
import { SlushyContext } from './SlushyContext'
import { isReferenceObject } from './helpers/isReferenceObject'
import { OpenAPIV3 } from 'openapi-types'

export class RequestDefaultSetter<TContext> {
    /**
     * @note Modifies the request object.
     */
    public setDefaults(context: SlushyContext<TContext>) {
        // FIXME: Handle reference objects
        const parameters = (context.operationObject.parameters || []).filter(
            val => !isReferenceObject(val)
        ) as OpenAPIV3.ParameterObject[]
        const defaultSetter = new OpenAPIDefaultSetter({
            parameters,
        })
        defaultSetter.handle(context.req)
    }
}
