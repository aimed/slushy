import { StatusCodeRange } from './StatusCodes'

export const StatusCodeClassNames: { [index: string]: string } = {
    '1XX': 'Informal',
    '2XX': 'Success',
    '3XX': 'Redirection',
    '4XX': 'ClientError',
    '5XX': 'ServerError',
}

for (const statusCodeGroup of Object.values(StatusCodeRange)) {
    for (const statusCodeName of Object.keys(statusCodeGroup)) {
        const statusCode = statusCodeGroup[statusCodeName as keyof typeof statusCodeGroup]
        const statusCodeClassName = statusCodeName
            .replace(/ /g, '')
            .replace(/'/g, '')
            .replace(/-/g, '')
        StatusCodeClassNames[statusCode.toString()] = statusCodeClassName
    }
}
