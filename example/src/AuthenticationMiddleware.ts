import { SlushyAuthenticationMiddleware, SlushyResponse, SlushyRequest } from '@slushy/server';

export class AuthenticationMiddleware implements SlushyAuthenticationMiddleware {
    execute(__: SlushyRequest, _: SlushyResponse, next: (error?: Error) => any): any {
        console.log('applying auth middleware')
        next()
    }
}