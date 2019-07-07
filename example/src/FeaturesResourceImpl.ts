import { SlushyContext } from '@slushy/server'
import * as fs from 'fs'
import { Context } from './Context'
import {
    FeatureComponentResponsesBadRequest,
    FeatureComponentResponsesParams,
    FeatureComponentResponsesResponse,
    FeatureFileDownloadOK,
    FeatureFileDownloadParams,
    FeatureFileUploadOK,
    FeatureFileUploadParams,
    FeatureFileUploadResponse,
    FeaturesResource,
} from './generated/resources/FeaturesResource'

export class FeaturesResourceImpl implements FeaturesResource<Context> {
    public async featureComponentResponses(
        _params: FeatureComponentResponsesParams,
        _context: SlushyContext<Context>,
    ): Promise<FeatureComponentResponsesResponse> {
        throw new FeatureComponentResponsesBadRequest({ errors: [{ message: '' }] })
    }

    public async featureFileUpload(
        params: FeatureFileUploadParams,
        _context: SlushyContext<Context>,
    ): Promise<FeatureFileUploadResponse> {
        return new FeatureFileUploadOK({ content: params.requestBody.file.buffer.toString() })
    }

    public async featureFileDownload(
        _params: FeatureFileDownloadParams,
        _context: SlushyContext<Context>,
    ): Promise<FeatureFileUploadResponse> {
        const file = await new Promise((resolve, reject) =>
            fs.readFile(__filename, (err, buffer) => (err ? reject(err) : resolve(buffer))),
        )
        return new FeatureFileDownloadOK(file)
    }
}
