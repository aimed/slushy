import { OpenAPIV3 } from 'openapi-types'
import { TSFile } from '../../typescript/TSFile'

export class OpenApiConstantFactory {
    public async create(document: OpenAPIV3.Document, tsFile: TSFile): Promise<string> {
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
