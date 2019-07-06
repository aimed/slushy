import { OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import { TSModule } from '../../typescript/TSModule'
import { capitalize } from '../../typescript/utils'
import { Generator } from '../Generator'

export class ComponentSchemaTypesGenerator implements Generator {
    public dependsOn = []

    public async generate(document: OpenAPIV3.Document, tsModule: TSModule) {
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
            const tsFile = tsModule.file(path.join('types', `${typeName}.ts`))
            const typeDefinition = tsFile.getTSType(schemaDefinition)
            const typeDeclarationString = `export type ${typeName} = ${typeDefinition}`
            tsFile.addSourceText(typeDeclarationString)
            indexExportFiles.push(`./${typeName}`)
        }

        const indexFile = tsModule.file(path.join('types', 'index.ts'))
        const indexFileSourceText = indexExportFiles.map(file => `export * from '${file}'`).join('\r')
        indexFile.addSourceText(indexFileSourceText)
    }
}
