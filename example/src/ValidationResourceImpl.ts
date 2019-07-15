import { Context } from './Context'
import {
    ValidationBodyDefaultValueBody,
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
        _params: ValidationBodyDefaultValueParams,
        body: ValidationBodyDefaultValueBody,
    ): Promise<ValidationBodyDefaultValueResponse> {
        return new ValidationBodyDefaultValueOK({
            default: body.default,
            noDefault: body.noDefault,
        })
    }

    public async validationQuery(params: ValidationQueryParams): Promise<ValidationQueryResponse> {
        return new ValidationQueryOK({ query: params.query, refQueryParameter: params.refQueryParameter })
    }

    public async validationPath(params: ValidationPathParams): Promise<ValidationPathResponse> {
        return new ValidationPathOK({ num: params.num, str: params.str })
    }

    public async validationHeader(params: ValidationHeaderParams): Promise<ValidationHeaderResponse> {
        return new ValidationHeaderOK({ header: params['x-header'] })
    }

    public async validationResponse(_params: ValidationResponseParams): Promise<ValidationResponseResponse> {
        return new ValidationResponseOK({ data: { notAString: true } as any })
    }
}
