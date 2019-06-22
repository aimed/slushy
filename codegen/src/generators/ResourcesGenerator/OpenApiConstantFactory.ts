import { TSFile } from '../../typescript/module/TSFile'
import { OpenAPIV3 } from 'openapi-types'

export class OpenApiConstantFactory {
    async create(document: OpenAPIV3.Document, tsFile: TSFile): Promise<string> {
        const documentString = JSON.stringify(document)
        const name = 'openApi'
        tsFile.addSourceText(`
            export const ${name} = \`
                ${documentString}
            \`
        `)
        return name
    }
}
