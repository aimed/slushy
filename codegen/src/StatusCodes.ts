export enum InformalStatusCode {
    'Continue' = 100,
    'Switching Protocols' = 101,
    'Processing' = 102,
}

export enum SuccessStatusCode {
    'OK' = 200,
    'Created' = 201,
    'Accepted' = 202,
    'Non-authoritative Information' = 203,
    'No Content' = 204,
    'Reset Content' = 205,
    'Partial Content' = 206,
    'Multi-Status' = 207,
    'Already Reported' = 208,
    'IM Used' = 226,
}

export enum RedirectionStatusCode {
    'Multiple Choices' = 300,
    'Moved Permanently' = 301,
    'Found' = 302,
    'See Other' = 303,
    'Not Modified' = 304,
    'Use Proxy' = 305,
    'Temporary Redirect' = 307,
    'Permanent Redirect' = 308,
}

export enum ClientErrorStatusCode {
    'Bad Request' = 400,
    'Unauthorized' = 401,
    'Payment Required' = 402,
    'Forbidden' = 403,
    'Not Found' = 404,
    'Method Not Allowed' = 405,
    'Not Acceptable' = 406,
    'Proxy Authentication Required' = 407,
    'Request Timeout' = 408,
    'Conflict' = 409,
    'Gone' = 410,
    'Length Required' = 411,
    'Precondition Failed' = 412,
    'Payload Too Large' = 413,
    'Request-URI Too Long' = 414,
    'Unsupported Media Type' = 415,
    'Requested Range Not Satisfiable' = 416,
    'Expectation Failed' = 417,
    "I'm a teapot" = 418,
    'Misdirected Request' = 421,
    'Unprocessable Entity' = 422,
    'Locked' = 423,
    'Failed Dependency' = 424,
    'Upgrade Required' = 426,
    'Precondition Required' = 428,
    'Too Many Requests' = 429,
    'Request Header Fields Too Large' = 431,
    'Connection Closed Without Response' = 444,
    'Unavailable For Legal Reasons' = 451,
    'Client Closed Request' = 499,
}

export enum ServerErrorStatusCode {
    'Internal Server Error' = 500,
    'Not Implemented' = 501,
    'Bad Gateway' = 502,
    'Service Unavailable' = 503,
    'Gateway Timeout' = 504,
    'HTTP Version Not Supported' = 505,
    'Variant Also Negotiates' = 506,
    'Insufficient Storage' = 507,
    'Loop Detected' = 508,
    'Not Extended' = 510,
    'Network Authentication Required' = 511,
    'Network Connect Timeout Error' = 599,
}

export type StatusCode =
    | InformalStatusCode
    | SuccessStatusCode
    | RedirectionStatusCode
    | ClientErrorStatusCode
    | ServerErrorStatusCode

export const StatusCodeRange = {
    '1XX': InformalStatusCode,
    '2XX': SuccessStatusCode,
    '3XX': RedirectionStatusCode,
    '4XX': ClientErrorStatusCode,
    '5XX': ServerErrorStatusCode,
}

export function isStatusCodeRange(maybeRange: any): maybeRange is keyof typeof StatusCodeRange {
    return maybeRange in StatusCodeRange
}

export function statusCodesForRange(range: keyof typeof StatusCodeRange): number[] {
    const statusCodes = StatusCodeRange[range]
    return Object.values(statusCodes)
}

export function isErrorStatusCode(code: string | number | keyof typeof StatusCodeRange) {
    if (isStatusCodeRange(code)) {
        return code !== '2XX'
    }

    if (typeof code === 'string') {
        code = Number(code)
    }

    return !(code >= 200 && code < 300)
}
