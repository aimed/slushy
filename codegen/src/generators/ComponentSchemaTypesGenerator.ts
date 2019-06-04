import { OpenAPIV3 } from "openapi-types";
import ts from 'typescript'
import { capitalize } from "../module/utils";
import { TSModule } from "../module/TSModule";
import * as path from 'path'

export class ComponentSchemaTypesGenerator {
    async createComponentSchemaTypes(document: OpenAPIV3.Document, tsModule: TSModule) {
        if (!document.components) {
            return
        }

        if (!document.components.schemas) {
            return
        }

        const schemas = Object.entries(document.components.schemas)
        for (const [name, schemaDefinition] of schemas) {
            const file = tsModule.file(path.join('types', `${capitalize(name)}.ts`))
            const typeDefinition = file.getTSType(schemaDefinition)
            const typeDeclarationString = `export type ${capitalize(name)} = ${typeDefinition}`
            const typeDeclarationStatementFile = ts.createSourceFile('tmp.ts', typeDeclarationString, ts.ScriptTarget.Latest)
            const typeDeclarationStatement = typeDeclarationStatementFile.statements[0] as ts.DeclarationStatement
            file.addNode(typeDeclarationStatement, typeDeclarationStatementFile)
        }
    }
}