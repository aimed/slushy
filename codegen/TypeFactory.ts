import { CodeGenContext } from "./CodeGenContext";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../server/isReferenceObject";
import { capitalize } from "./utils";
import { log } from "./log";

export class TypeFactory {
    async createTypesFileFromComponentSchemas(context: CodeGenContext) {
        const { openApi, mkDir, joinPath, destDir } = context
        const typesDir = joinPath(destDir, 'types')
        await mkDir(typesDir)

        if (!openApi.components) {
            log('Could not generate types because #/components/ is not defined')
            return
        }

        if (!openApi.components.schemas) {
            log('Could not generate types because #/components/schemas is not defined')
            return
        }

        const typeDefs: string[] = []
        const typeAliases = Object.keys(openApi.components.schemas)
        for (const typeAlias of typeAliases) {
            const schema = openApi.components.schemas[typeAlias]
            if (!isReferenceObject(schema) && schema.properties) {
                const typeName = capitalize(typeAlias)
                const tsDef = this.getTSObjectType(schema)
                const typeDef = `type ${typeName} = ${tsDef}`
                typeDefs.push(typeDef)
            }
        }
        const typeDefFileContent = context.prettifyTS(typeDefs.join('\r\n'))
        await context.writeFile(context.joinPath(context.destDir, 'types.ts'), typeDefFileContent)
    }

    createType(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, name: string) {
        // For references this will result in something like `type A = B`
        const type = isReferenceObject(schema) ? this.resolveReferenceType(schema) : this.getTSObjectType(schema)
        // All types are exported as 'type' and not interface, because they might be union types.
        const typeDef = `type ${name} = ${type}`
        return typeDef
    }

    resolveReferenceType(schema: OpenAPIV3.ReferenceObject): string {
        if (!schema.$ref.startsWith('#/components/schemas/')) {
            throw new Error('Currently only local refs to \'#/components/schemas/\' are allowed, you might have forgotten to use swagger-parser.bundle')
        }
        return capitalize(schema.$ref.replace('#/components/schemas/', ''))
    }

    getTSType(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): string {
        if (isReferenceObject(schema)) {
            return this.resolveReferenceType(schema)
        }

        switch (schema.type) {
            case 'object': return this.getTSObjectType(schema)
            case 'boolean': return 'boolean'
            case 'integer': return 'number'
            case 'number': return 'number'
            case 'null': return 'null'
            case 'string':
                if (schema.enum) {
                    return schema.enum.map(value => typeof value === 'string' ? `'${value}'` : value).join(' | ')
                }
                return 'string'
            case 'array': return `Array<${this.getTSType(schema.items)}>`
            default:
                log('unexpected schema type', (schema as any).type)
                return 'any'
        }
        // TODO: nullable, constant
    }

    getTSObjectType(schema: OpenAPIV3.SchemaObject): string {
        const { type, properties, required = [], additionalProperties, oneOf, anyOf, allOf } = schema
        if (type && type !== 'object') {
            return this.getTSType(schema)
        }

        if (properties) {
            const propertyDefs: string[] = []

            for (const propertyName of Object.keys(properties)) {
                const isRequired = required.includes(propertyName)
                const propertyDef = properties[propertyName]
                const propertyDefString = this.getTSType(propertyDef)
                propertyDefs.push(`${propertyName}${isRequired ? '' : '?'}: ${propertyDefString}`)
            }

            if (additionalProperties) {
                propertyDefs.push('[k:string]: any')
            }

            return `{\r\n${propertyDefs.join('\r\n')}\r\n}`
        }

        if (allOf) {
            return allOf.map(allOfItem => this.getTSType(allOfItem)).join(' & ')
        }

        if (anyOf) {
            return anyOf.map(anyOfItem => this.getTSType(anyOfItem)).join(' | ')
        }

        if (oneOf) {
            return oneOf.map(oneOfItem => this.getTSType(oneOfItem)).join(' | ')
        }

        // TODO: not, readOnly

        return 'any'
    }
}