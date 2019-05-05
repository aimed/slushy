import { CodeGenContext } from './CodeGenContext'
import { OpenAPIV3 } from 'openapi-types'
import { capitalize } from './utils'
import { log } from './log'
import { isReferenceObject } from './isReferenceObject'

export class TypeFactory {
    async createTypesFileFromComponentSchemas(context: CodeGenContext) {
        const { openApi, writeFile, joinPath, destDir, prettifyTS } = context
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
                const tsDef = this.getTSObjectType(schema, [])
                const typeDef = `export type ${typeName} = ${tsDef}`
                typeDefs.push(typeDef)
            }
        }
        const typeDefFileContent = prettifyTS(typeDefs.join('\r\n'))
        await writeFile(joinPath(destDir, 'types.ts'), typeDefFileContent)
    }

    createType(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined, name: string, resolvedTypes: string[] = []) {
        // For references this will result in something like `type A = B`
        const type = isReferenceObject(schema)
            ? this.resolveReferenceType(schema, resolvedTypes)
            : this.getTSObjectType(schema, resolvedTypes)
        // All types are exported as 'type' and not interface, because they might be union types.
        const typeDef = `export type ${name} = ${type}`
        return typeDef
    }

    resolveReferenceType(schema: OpenAPIV3.ReferenceObject, resolvedTypes: string[] = []): string {
        if (!schema.$ref.startsWith('#/components/schemas/')) {
            throw new Error(
                "Currently only local refs to '#/components/schemas/' are allowed, you might have forgotten to use swagger-parser.bundle"
            )
        }
        const resolved = capitalize(schema.$ref.replace('#/components/schemas/', ''))
        resolvedTypes.push(resolved)
        return resolved
    }

    getTSType(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject, resolvedTypes: string[]): string {
        if (isReferenceObject(schema)) {
            return this.resolveReferenceType(schema)
        }

        switch (schema.type) {
            case 'object':
                return this.getTSObjectType(schema, resolvedTypes)
            case 'boolean':
                return 'boolean'
            case 'integer':
                return 'number'
            case 'number':
                return 'number'
            case 'null':
                return 'null'
            case 'string':
                // TODO: Extract into separate method
                // TODO: Handle files etc.
                if (schema.enum) {
                    return schema.enum.map(value => (typeof value === 'string' ? `'${value}'` : value)).join(' | ')
                }
                return 'string'
            case 'array':
                return `Array<${this.getTSType(schema.items, resolvedTypes)}>`
            default:
                log('unexpected schema type', (schema as any).type)
                return 'any'
        }
        // TODO: nullable, constant
    }

    getTSObjectType(schema: OpenAPIV3.SchemaObject | undefined, resolvedTypes: string[]): string {
        if (schema === undefined) {
            return 'undefined'
        }

        const { type, properties, required = [], additionalProperties, oneOf, anyOf, allOf } = schema
        if (type && type !== 'object') {
            return this.getTSType(schema, resolvedTypes)
        }

        if (properties) {
            const propertyDefs: string[] = []

            for (const propertyName of Object.keys(properties)) {
                const isRequired = required.includes(propertyName)
                const propertyDef = properties[propertyName]
                const propertyDefString = this.getTSType(propertyDef, resolvedTypes)
                propertyDefs.push(`${propertyName}${isRequired ? '' : '?'}: ${propertyDefString}`)
            }

            if (additionalProperties) {
                propertyDefs.push('[k:string]: any')
            }

            return `{\r\n${propertyDefs.join('\r\n')}\r\n}`
        }

        if (allOf) {
            return allOf.map(allOfItem => this.getTSType(allOfItem, resolvedTypes)).join(' & ')
        }

        // TODO: This is actually oneOf, but a good approximation
        if (anyOf) {
            return anyOf.map(anyOfItem => this.getTSType(anyOfItem, resolvedTypes)).join(' | ')
        }

        if (oneOf) {
            return oneOf.map(oneOfItem => this.getTSType(oneOfItem, resolvedTypes)).join(' | ')
        }

        // TODO: not, readOnly

        return 'any'
    }
}
