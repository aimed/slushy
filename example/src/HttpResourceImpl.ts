import { Context } from './Context'
import {
    DeleteOK,
    DeleteResponse,
    GetOK,
    GetResponse,
    HttpResource,
    PatchOK,
    PatchResponse,
    PostOK,
    PostResponse,
    PutOK,
    PutResponse,
} from './generated/resources/HttpResource'

export class HttpResourceImpl implements HttpResource<Context> {
    public async get(): Promise<GetResponse> {
        return new GetOK()
    }

    public async put(): Promise<PutResponse> {
        return new PutOK()
    }

    public async post(): Promise<PostResponse> {
        return new PostOK()
    }

    public async delete(): Promise<DeleteResponse> {
        return new DeleteOK()
    }

    public async patch(): Promise<PatchResponse> {
        return new PatchOK()
    }
}
