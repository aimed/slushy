import { Generator } from './Generator'
import { TSModule } from '../typescript/module/TSModule';
import { OpenAPIV3 } from 'openapi-types';
import { ComponentSchemaTypesGenerator } from './ComponentSchemaTypesGenerator';
import { TSFile } from '../typescript/module/TSFile';
import { isErrorStatusCode, isStatusCodeRange, StatusCodeRange, StatusCode, statusCodesForRange } from '../StatusCodes';
import { capitalize, isReferenceObject } from '../typescript/module/utils';
import { StatusCodeClassNames } from '../StatusCodesClassNames';
import { TSClassBuilder } from '../typescript/TSClassBuilder';
import { groupBy } from 'lodash';
import * as path from 'path'

export class ResourcesGenerator implements Generator {
    dependsOn = [ComponentSchemaTypesGenerator]

    async generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void> {
        // TODO: This replaces ResourceTemplate
        // TODO: Create Responses (done)
        // TODO: Create Parameters ()
        // TODO: Create ResourceInterface

        // throw new Error("Method not implemented.")
        const resourceRouterNames: string[] = []

        const pathsWithResourceName = Object.entries(document.paths).map(([path, pathItemObject]) => ({ path, pathItemObject, resourceName: this.getResourceNameForPath(path) }))
        const groupedPathsWithResourceName = groupBy(pathsWithResourceName, item => item.resourceName)

        // For every resource, e.g. /pet create the response type, the parameter type and the resource router.
        for (const [resourceName, resourcePathDescriptions] of Object.entries(groupedPathsWithResourceName)) {
            const tsFile = tsModule.file(path.join('resources', `${capitalize(resourceName)}.ts`))
            const resourceOperations: ResourceOperation[] = []

            // For every path on a resource
            for (const resourcePathDescription of resourcePathDescriptions) {
                const { path, pathItemObject } = resourcePathDescription

                // For every operation on a resource, e.g. getPet (GET /pets)
                for (const pathOperationKey of httpVerbPathOperations) {
                    const operationObject = pathItemObject[pathOperationKey]
                    if (!operationObject) {
                        continue
                    }

                    const responseTypeFactory = new ResponseTypeFactory()
                    const responseType = responseTypeFactory.declarePathResponseType(operationObject, tsFile)

                    const parameterTypeFactory = new ParameterTypeFactory()
                    const parameterType = parameterTypeFactory.declareParameterType(operationObject, tsFile)
                    resourceOperations.push({ path, responseType, parameterType, pathItemObject, method: pathOperationKey })
                }

            }

            const resourceRouterFactory = new ResourceRouterFactory()
            const resourceRouterName = resourceRouterFactory.declareResourceRouter(resourceName, resourceOperations, tsFile)
            resourceRouterNames.push(resourceRouterName)
        }

        // TODO: Do things with resourceRouterNames -> Generate the ResourcesConfiguration
    }

    /**
     * For a given path create a resource name.
     * @example
     * /         -> Index
     * /pets     -> Pets
     * /pets/:id -> Pets
     */
    private getResourceNameForPath(path: string): string {
        const [, prefix] = path.split('/')
        if (!prefix || prefix.startsWith('{')) {
            return capitalize('index')
        }
        return capitalize(prefix)
    }
}

/**
 * A list of all http verbs that are supported by the OpenApi path.
 */
const httpVerbPathOperations = [
    'get' as 'get',
    'put' as 'put',
    'post' as 'post',
    'delete' as 'delete',
    'options' as 'options',
    'head' as 'head',
    'patch' as 'patch',
    'trace' as 'trace',
]

export interface ResourceOperation {
    parameterType: string
    responseType: string
    path: string
    method: string
    pathItemObject: OpenAPIV3.PathItemObject
}

export class ResourceRouterFactory {
    declareResourceRouter(resourceName: string, resourceOperations: Array<ResourceOperation>, tsFile: TSFile): string {
        throw new Error("Method not implemented.")
        // return the resouce router class name
    }
}

export class ParameterTypeFactory {
    declareParameterType(
        _operationObject: OpenAPIV3.OperationObject,
        _tsFile: TSFile,
    ): string {
        throw new Error("Method not implemented.")
    }
}

export class ResponseTypeFactory {
    declarePathResponseType(
        operationObject: OpenAPIV3.OperationObject,
        tsFile: TSFile,
    ): string {
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
            const responseClassSuffix = StatusCodeClassNames[responseStatusCode];
            const responseClassName = `${capitalize(operationObject.operationId)}${responseClassSuffix}`;
            responseClassNames.push(responseClassName)
            this.declareStatusCodeResponseClass(responseClassName, response, responseStatusCode, tsFile);
        }

        const responseTypeName = `${capitalize(operationObject.operationId)}Response`
        const responseTypeDefinition = `export type ${responseTypeName} = ${responseClassNames.join(' | ')}`
        tsFile.addSourceText(responseTypeDefinition)
        return responseTypeName
    }

    private declareStatusCodeResponseClass(responseClassName: string, response: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject, responseStatusCode: keyof typeof StatusCodeRange | StatusCode, tsFile: TSFile) {
        if (isReferenceObject(response)) {
            throw new Error('References for responses are not allowed, you maybe forgot to use .bundle');
        }

        const responseClassBuilder = new TSClassBuilder(responseClassName);
        this.extendBaseClass(responseStatusCode, tsFile, responseClassBuilder);
        this.addStatusCode(responseStatusCode, responseClassBuilder, tsFile);
        this.addPayload(response, responseClassBuilder, tsFile);
        tsFile.addSourceText(responseClassBuilder.build())
        return responseClassName
    }

    private extendBaseClass(responseStatusCode: keyof typeof StatusCodeRange | StatusCode, _tsFile: TSFile, responseClassBuilder: TSClassBuilder) {
        // If the status code indicates an error, generate an actual error class that can be thrown.
        if (isErrorStatusCode(responseStatusCode)) {
            responseClassBuilder.extends('Error', 'super()', 'Object.setPrototypeOf(this, new.target.prototype)');
        }
    }

    private addPayload(response: OpenAPIV3.ResponseObject, responseClassBuilder: TSClassBuilder, tsFile: TSFile) {
        if (response.content) {
            // TODO: Handle more cases.
            const jsonResponseType = response.content['application/json'];
            if (!jsonResponseType) {
                throw new Error('No content for application/json defined');
            }

            if (!jsonResponseType.schema) {
                throw new Error('No response schema is defined');
            }

            responseClassBuilder.addConstructorParameter({
                name: 'payload',
                type: tsFile.getTSType(jsonResponseType.schema),
            })
        }
    }

    private addStatusCode(responseStatusCode: keyof typeof StatusCodeRange | StatusCode, responseClassBuilder: TSClassBuilder, tsFile: TSFile) {
        // If the status code is a range, the actual status code must be passed as a parameter.
        // Otherwise the status code can be set as a class directly.
        if (isStatusCodeRange(responseStatusCode)) {
            responseClassBuilder.addConstructorParameter({
                name: 'status',
                type: tsFile.getTSType({ type: 'string', enum: statusCodesForRange(responseStatusCode) }),
            })
            return
        }

        responseClassBuilder.addProperty({
            name: 'status',
            initialValue: responseStatusCode.toString(),
            type: tsFile.getTSType({ type: 'string', enum: [Number(responseStatusCode)] }),
        });
    }
}