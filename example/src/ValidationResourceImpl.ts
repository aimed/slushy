import { SlushyContext } from '@slushy/server'
import { Context } from './Context'
import {
    ValidationBodyDefaultValueOK,
    ValidationBodyDefaultValueParams,
    ValidationBodyDefaultValueResponse,
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
    ValidationResponseOK,
    ValidationResponseParams,
    ValidationResponseResponse,
} from './generated/resources/ValidationResource'

export class ValidationResourceImpl implements ValidationResource<Context> {
    public async validationBodyDefaultValue(
        params: ValidationBodyDefaultValueParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationBodyDefaultValueResponse> {
        return new ValidationBodyDefaultValueOK({
            default: params.requestBody.default,
            noDefault: params.requestBody.noDefault,
        })
    }

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

    public async validationResponse(
        _params: ValidationResponseParams,
        _context: SlushyContext<Context>,
    ): Promise<ValidationResponseResponse> {
        return new ValidationResponseOK({ data: { notAString: true } as any })
    }
}
