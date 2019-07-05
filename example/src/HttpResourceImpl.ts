import {
    HttpResource,
    GetParams,
    GetResponse,
    PutParams,
    PutResponse,
    PostParams,
    PostResponse,
    DeleteParams,
    DeleteResponse,
    PatchParams,
    PatchResponse,
    GetOK,
    PutOK,
    PostOK,
    DeleteOK,
    PatchOK,
} from './generated/resources/HttpResource'
import { Context } from './Context'
import { SlushyContext } from '@slushy/server'

export class HttpResourceImpl implements HttpResource<Context> {
    async get(_params: GetParams, _context: SlushyContext<Context>): Promise<GetResponse> {
        return new GetOK()
    }

    async put(_params: PutParams, _context: SlushyContext<Context>): Promise<PutResponse> {
        return new PutOK()
    }

    async post(_params: PostParams, _context: SlushyContext<Context>): Promise<PostResponse> {
        return new PostOK()
    }

    async delete(_params: DeleteParams, _context: SlushyContext<Context>): Promise<DeleteResponse> {
        return new DeleteOK()
    }

    async patch(_params: PatchParams, _context: SlushyContext<Context>): Promise<PatchResponse> {
        return new PatchOK()
    }
}
