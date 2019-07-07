import { SlushyContext } from '@slushy/server'
import { Context } from './Context'
import {
    ValidationHeaderOK,
    ValidationHeaderParams,
    ValidationHeaderResponse,
    ValidationPathOK,
    ValidationPathParams,
    ValidationPathResponse,
    ValidationQueryOK,
    ValidationQueryParams,
    ValidationQueryResponse,
    ValidationResource,
} from './generated/resources/ValidationResource'

export class ValidationResourceImpl implements ValidationResource<Context> {
    public async validationQuery(
        params: ValidationQueryParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationQueryResponse> {
        return new ValidationQueryOK({ query: params.query })
    }

    public async validationPath(
        params: ValidationPathParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationPathResponse> {
        return new ValidationPathOK({ num: params.num, str: params.str })
    }

    public async validationHeader(
        params: ValidationHeaderParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationHeaderResponse> {
        return new ValidationHeaderOK({ header: params['x-header'] })
    }
}
