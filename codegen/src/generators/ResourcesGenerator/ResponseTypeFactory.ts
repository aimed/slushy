import { OpenAPIV3 } from 'openapi-types'
import { TSFile } from '../../typescript/TSFile'
import {
    isErrorStatusCode,
    isStatusCodeRange,
    StatusCodeRange,
    StatusCode,
    statusCodesForRange,
    StatusCodeDefault,
    isStatusCodeDefault,
} from '../../StatusCodes'
import { capitalize, isReferenceObject } from '../../typescript/utils'
import { StatusCodeClassNames } from '../../StatusCodesClassNames'
import { TSClassBuilder } from '../../typescript/TSClassBuilder'

/**
 * Creates a resource operation response.
 * @example
 * export class GetPetOK { status = 200 }
 * export class GetPetBadRequest extends SlushyError { status = 400 }
 * export type GetPetResponse = GetPetOK | GetPetBadRequest
 */
export class ResponseTypeFactory {
    declarePathResponseType(operationObject: OpenAPIV3.OperationObject, tsFile: TSFile): string {
        if (!operationObject.responses) {
            throw new Error('Missing responses')
        }
        if (!operationObject.operationId) {
            throw new Error('Missing operationId')
        }
        /**
         * All accepted response class names used to generate the expected type.
         */
        const responseClassNames: string[] = []
        // Generate one class for every possible response value
        for (const [responseStatusCodeString, response] of Object.entries(operationObject.responses)) {
            const responseStatusCode = responseStatusCodeString as keyof typeof StatusCodeRange | StatusCode
            const responseClassSuffix = isStatusCodeDefault(responseStatusCode)
                ? 'Default'
                : StatusCodeClassNames[responseStatusCode]
            const responseClassName = `${capitalize(operationObject.operationId)}${responseClassSuffix}`
            responseClassNames.push(responseClassName)
            this.declareStatusCodeResponseClass(responseClassName, response, responseStatusCode, tsFile)
        }
        const responseTypeName = `${capitalize(operationObject.operationId)}Response`
        const responseTypeDefinition = `export type ${responseTypeName} = ${responseClassNames.join(' | ')}`
        tsFile.addSourceText(responseTypeDefinition)
        return responseTypeName
    }
    private declareStatusCodeResponseClass(
        responseClassName: string,
        response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject,
        responseStatusCode: keyof typeof StatusCodeRange | StatusCode,
        tsFile: TSFile
    ) {
        if (isReferenceObject(response)) {
            throw new Error('References for responses are not allowed, you maybe forgot to use .bundle')
        }
        const responseClassBuilder = new TSClassBuilder(responseClassName)
        this.extendBaseClass(responseStatusCode, responseClassBuilder, tsFile)
        this.addStatusCode(responseStatusCode, responseClassBuilder, tsFile)
        this.addPayload(response, responseClassBuilder, tsFile)
        tsFile.addSourceText(responseClassBuilder.build())
        return responseClassName
    }
    private extendBaseClass(
        responseStatusCode: keyof typeof StatusCodeRange | StatusCode,
        responseClassBuilder: TSClassBuilder,
        tsFile: TSFile
    ) {
        // If the status code indicates an error, generate an actual error class that can be thrown.
        tsFile.import('SlushyError', '@slushy/server', true)
        if (isErrorStatusCode(responseStatusCode)) {
            responseClassBuilder.extends('SlushyError', 'super()', 'Object.setPrototypeOf(this, new.target.prototype)')
        }
    }
    private addPayload(response: OpenAPIV3.ResponseObject, responseClassBuilder: TSClassBuilder, tsFile: TSFile) {
        if (response.content) {
            // TODO: Handle more cases.
            const jsonResponseType = response.content['application/json']
            if (!jsonResponseType) {
                throw new Error('No content for application/json defined')
            }
            if (!jsonResponseType.schema) {
                throw new Error('No response schema is defined')
            }
            responseClassBuilder.addConstructorParameter({
                name: 'payload',
                type: tsFile.getTSType(jsonResponseType.schema),
            })
        }
    }
    private addStatusCode(
        responseStatusCode: keyof typeof StatusCodeRange | StatusCode | typeof StatusCodeDefault,
        responseClassBuilder: TSClassBuilder,
        tsFile: TSFile
    ) {
        // If the status code is a range, the actual status code must be passed as a parameter.
        // Otherwise the status code can be set as a class property directly.
        if (isStatusCodeRange(responseStatusCode)) {
            responseClassBuilder.addConstructorParameter({
                name: 'status',
                type: tsFile.getTSType({ type: 'string', enum: statusCodesForRange(responseStatusCode) }),
            })
            return
        }

        if (isStatusCodeDefault(responseStatusCode)) {
            responseClassBuilder.addConstructorParameter({
                name: 'status',
                type: tsFile.getTSType({
                    type: 'number',
                    // enum: Object.values(StatusCodeRange).flatMap(range => Object.values(range)),
                }),
            })
            return
        }

        responseClassBuilder.addProperty({
            name: 'status',
            initialValue: responseStatusCode.toString(),
            type: tsFile.getTSType({ type: 'string', enum: [Number(responseStatusCode)] }),
        })
    }
}
