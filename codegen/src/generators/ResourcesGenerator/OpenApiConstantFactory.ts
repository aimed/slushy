import { OpenAPIV3 } from 'openapi-types'
import Swagger from 'swagger-parser'
import { TSFile } from '../../typescript/TSFile'

export class OpenApiConstantFactory {
    public async create(document: OpenAPIV3.Document, tsFile: TSFile): Promise<string> {
        const documentString = JSON.stringify(await Swagger.dereference(document))
        const name = 'openApi'
        tsFile.addSourceText(`
            export const ${name} = \`
                ${documentString}
            \`
        `)
        return name
    }
}
