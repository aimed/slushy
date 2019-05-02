import { CodeGenContext } from "./CodeGenContext";
import { compile } from "json-schema-to-typescript";
import { JSONSchema4 } from "json-schema";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../server/isReferenceObject";
import { capitalize } from "./utils";
import { log } from "./log";
import * as prettier from 'prettier'

export class TypeFactory {
    async createTypes(context: CodeGenContext) {
        const { openApi, mkDir, joinPath, destDir } = context
        const typesDir = joinPath(destDir, 'types')
        await mkDir(typesDir)

        if (!openApi.components) {
            return
        }

        if (!openApi.components.schemas) {
            return
        }

        const typeDefs: string[] = []
        const typeAliases = Object.keys(openApi.components.schemas)
        for (const typeAlias of typeAliases) {
            const schema = openApi.components.schemas[typeAlias]
            if (!isReferenceObject(schema) && schema.properties) {
                const tsDef = this.getTSObjectDefinition(schema)
                const typeName = capitalize(typeAlias)
                const typeDef = `type ${typeName} = ${tsDef}`
                typeDefs.push(typeDef)
            }
        }
        const typeDefFileContent = prettier.format(typeDefs.join('\r\n'), { semi: false, parser: 'typescript' })
        await context.writeFile(context.joinPath(context.destDir, 'test.ts'), typeDefFileContent)
    }

    getTSType(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): string {
        if (isReferenceObject(schema)) {
            return capitalize(schema.$ref.replace('#/components/schemas/', ''))
        }

        switch (schema.type) {
            case 'boolean': return 'boolean'
            case 'integer': return 'number'
            case 'number': return 'number'
            case 'null': return 'null'
            case 'string': return 'string'
            case 'array': return `Array<${this.getTSType((schema as OpenAPIV3.ArraySchemaObject).items)}>`
            default:
                log('unexpected schema type', schema.type)
                return 'any'
        }
    }

    getTSObjectDefinition(schema: OpenAPIV3.SchemaObject): string {
        const { properties = {}, required = [], additionalProperties } = schema
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
}