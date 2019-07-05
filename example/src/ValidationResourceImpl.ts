import {
    ValidationResource,
    ValidationQueryParams,
    ValidationQueryResponse,
    ValidationQueryOK,
} from './generated/resources/ValidationResource'
import { Context } from './Context'
import { SlushyContext } from '@slushy/server'

export class ValidationResourceImpl implements ValidationResource<Context> {
    async validationQuery(
        params: ValidationQueryParams,
        _context: SlushyContext<Context>
    ): Promise<ValidationQueryResponse> {
        return new ValidationQueryOK({ query: params.query })
    }
}
