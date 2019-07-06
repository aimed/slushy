import { OpenAPIV3 } from 'openapi-types'
import {
    isErrorStatusCode,
    isStatusCodeDefault,
    isStatusCodeRange,
    StatusCode,
    StatusCodeDefault,
    StatusCodeRange,
    statusCodesForRange,
} from '../../StatusCodes'
import { StatusCodeClassNames } from '../../StatusCodesClassNames'
import { TSClassBuilder } from '../../typescript/TSClassBuilder'
import { TSFile } from '../../typescript/TSFile'
import { capitalize, isReferenceObject } from '../../typescript/utils'

/**
 * Creates a resource operation response.
 * @example
 * export class GetPetOK { status = 200 }
 * export class GetPetBadRequest extends SlushyError { status = 400 }
 * export type GetPetResponse = GetPetOK | GetPetBadRequest
 */
export class ResponseTypeFactory {
    public declarePathResponseType(operationObject: OpenAPIV3.OperationObject, tsFile: TSFile): string {
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
        tsFile: TSFile,
    ) {
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
        tsFile: TSFile,
    ) {
        // If the status code indicates an error, generate an actual error class that can be thrown.
        if (isErrorStatusCode(responseStatusCode)) {
            tsFile.import('SlushyError', '@slushy/server', true)
            responseClassBuilder.extends('SlushyError', 'super()', 'Object.setPrototypeOf(this, new.target.prototype)')
        }
    }

    private addPayload(
        response: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject,
        responseClassBuilder: TSClassBuilder,
        tsFile: TSFile,
    ) {
        if (isReferenceObject(response)) {
            if (!response.$ref.startsWith('#/components/responses/')) {
                throw new Error('A status code reference must point to #/components/responses/')
            }

            const responseType = `${response.$ref.replace('#/components/responses/', '')}Response`
            tsFile.import(responseType)
            responseClassBuilder.addConstructorParameter({
                name: 'payload',
                type: responseType,
            })
            return
        }

        if (!response.content) {
            return
        }

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

    private addStatusCode(
        responseStatusCode: keyof typeof StatusCodeRange | StatusCode | typeof StatusCodeDefault,
        responseClassBuilder: TSClassBuilder,
        tsFile: TSFile,
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
