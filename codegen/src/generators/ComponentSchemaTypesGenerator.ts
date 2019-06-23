import { OpenAPIV3 } from 'openapi-types'
import { capitalize } from '../typescript/utils'
import { TSModule } from '../typescript/TSModule'
import * as path from 'path'
import { Generator } from './Generator'

export class ComponentSchemaTypesGenerator implements Generator {
    dependsOn = []

    async generate(document: OpenAPIV3.Document, tsModule: TSModule) {
        if (!document.components) {
            return
        }

        if (!document.components.schemas) {
            return
        }

        const schemas = Object.entries(document.components.schemas)
        const indexExportFiles: string[] = []
        for (const [name, schemaDefinition] of schemas) {
            const typeName = capitalize(name)
            const file = tsModule.file(path.join('types', `${typeName}.ts`))
            const typeDefinition = file.getTSType(schemaDefinition)
            const typeDeclarationString = `export type ${typeName} = ${typeDefinition}`
            file.addSourceText(typeDeclarationString)
            indexExportFiles.push(`./${typeName}`)
        }

        const indexFile = tsModule.file(path.join('types', 'index.ts'))
        const indexFileSourceText = indexExportFiles.map(file => `export * from '${file}'`).join('\r')
        indexFile.addSourceText(indexFileSourceText)
    }
}
