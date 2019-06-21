import { TSFile } from '../../typescript/module/TSFile'
import { OpenAPIV3 } from 'openapi-types'
import * as SwaggerParser from 'swagger-parser'

export class OpenApiConstantFactory {
    async create(document: OpenAPIV3.Document, tsFile: TSFile): Promise<string> {
        const documentString = JSON.stringify(document)
        const documentResolved = await SwaggerParser.resolve(documentString)
        const documentResolvedString = JSON.stringify(documentResolved)
        const name = 'openApi'
        tsFile.addSourceText(`
            export const ${name} = \`
                ${documentResolvedString}
            \`
        `)
        return name
    }
}
