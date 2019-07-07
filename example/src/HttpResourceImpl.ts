import { SlushyContext } from '@slushy/server'
import { Context } from './Context'
import {
    DeleteOK,
    DeleteParams,
    DeleteResponse,
    GetOK,
    GetParams,
    GetResponse,
    HttpResource,
    PatchOK,
    PatchParams,
    PatchResponse,
    PostOK,
    PostParams,
    PostResponse,
    PutOK,
    PutParams,
    PutResponse,
} from './generated/resources/HttpResource'

export class HttpResourceImpl implements HttpResource<Context> {
    public async get(_params: GetParams, _context: SlushyContext<Context>): Promise<GetResponse> {
        return new GetOK()
    }

    public async put(_params: PutParams, _context: SlushyContext<Context>): Promise<PutResponse> {
        return new PutOK()
    }

    public async post(_params: PostParams, _context: SlushyContext<Context>): Promise<PostResponse> {
        return new PostOK()
    }

    public async delete(_params: DeleteParams, _context: SlushyContext<Context>): Promise<DeleteResponse> {
        return new DeleteOK()
    }

    public async patch(_params: PatchParams, _context: SlushyContext<Context>): Promise<PatchResponse> {
        return new PatchOK()
    }
}
