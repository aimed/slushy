import { SlushyInfo } from '@slushy/server'
import * as fs from 'fs'
import { Context } from './Context'
import {
    FeatureComponentResponsesBadRequest,
    FeatureComponentResponsesBody,
    FeatureComponentResponsesParams,
    FeatureComponentResponsesResponse,
    FeatureFileDownloadBody,
    FeatureFileDownloadOK,
    FeatureFileDownloadParams,
    FeatureFileUploadBody,
    FeatureFileUploadOK,
    FeatureFileUploadParams,
    FeatureFileUploadResponse,
    FeaturesResource,
} from './generated/resources/FeaturesResource'

export class FeaturesResourceImpl implements FeaturesResource<Context> {
    public async featureComponentResponses(
        _params: FeatureComponentResponsesParams,
        _body: FeatureComponentResponsesBody,
        _context: Context,
        _info: SlushyInfo,
    ): Promise<FeatureComponentResponsesResponse> {
        throw new FeatureComponentResponsesBadRequest({ errors: [{ message: '' }] })
    }

    public async featureFileUpload(
        _params: FeatureFileUploadParams,
        body: FeatureFileUploadBody,
        _context: Context,
        _info: SlushyInfo,
    ): Promise<FeatureFileUploadResponse> {
        return new FeatureFileUploadOK({ content: body.file.buffer.toString() })
    }

    public async featureFileDownload(
        _params: FeatureFileDownloadParams,
        _body: FeatureFileDownloadBody,
        _context: Context,
        _info: SlushyInfo,
    ): Promise<FeatureFileUploadResponse> {
        const file = await new Promise((resolve, reject) =>
            fs.readFile(__filename, (err, buffer) => (err ? reject(err) : resolve(buffer))),
        )
        return new FeatureFileDownloadOK(file)
    }
}
