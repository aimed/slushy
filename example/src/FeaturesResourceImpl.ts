import {
    FeaturesResource,
    FeatureComponentResponsesParams,
    FeatureComponentResponsesResponse,
    FeatureComponentResponsesBadRequest,
    FeatureFileUploadParams,
    FeatureFileUploadResponse,
    FeatureFileUploadOK,
} from './generated/resources/FeaturesResource'
import { Context } from './Context'
import { SlushyContext } from '@slushy/server'

export class FeaturesResourceImpl implements FeaturesResource<Context> {
    async featureComponentResponses(
        _params: FeatureComponentResponsesParams,
        _context: SlushyContext<Context>
    ): Promise<FeatureComponentResponsesResponse> {
        throw new FeatureComponentResponsesBadRequest({ errors: [{ message: '' }] })
    }

    async featureFileUpload(
        _params: FeatureFileUploadParams,
        _context: SlushyContext<Context>
    ): Promise<FeatureFileUploadResponse> {
        return new FeatureFileUploadOK()
    }
}
