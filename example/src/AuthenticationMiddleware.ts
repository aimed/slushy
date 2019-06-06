import { SlushyAuthenticationMiddleware, SlushyResponse, SlushyRequest } from '@slushy/server';

export class AuthenticationMiddleware implements SlushyAuthenticationMiddleware {
    execute(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any): any {
        if (req.headers.authorization) {
            next()
        } else {
            res.status(401).json({ error: { message: "unauthorized" }})
        }
        
    }
}