import {
    ValidationResource,
    ValidationQueryParams,
    ValidationQueryResponse,
    ValidationQueryOK,
    ValidationPathParams,
    ValidationPathResponse,
    ValidationPathOK,
} from './generated/resources/ValidationResource'
import { Context } from './Context'
import { SlushyContext } from '@slushy/server'

export class ValidationResourceImpl implements ValidationResource<Context> {
    async validationQuery(
        params: ValidationQueryParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationQueryResponse> {
        return new ValidationQueryOK({ query: params.query })
    }

    async validationPath(
        params: ValidationPathParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationPathResponse> {
        return new ValidationPathOK({ num: params.num, str: params.str })
    }
}
