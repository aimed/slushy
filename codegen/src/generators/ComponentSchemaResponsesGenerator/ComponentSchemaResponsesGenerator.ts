import { OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import { TSModule } from '../../typescript/TSModule'
import { isReferenceObject } from '../../typescript/utils'
import { Generator } from '../Generator'

export class ComponentSchemaResponsesGenerator implements Generator {
    public dependsOn = []

    public async generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void> {
        const tsFile = tsModule.file(path.join('responses', 'responses.ts'))

        if (!document.components) {
            return
        }

        if (!document.components.responses) {
            return
        }

        for (const [name, responseObject] of Object.entries(document.components.responses)) {
            if (isReferenceObject(responseObject)) {
                throw new Error('A component response cannot be a ReferenceObject')
            }
            const { content = {} } = responseObject
            const jsonContent = content['application/json']
            if (!jsonContent) {
                throw new Error('A component response must have application/json defined')
            }

            const typeName = `${name}Response`
            const typeDefinition = `export type ${typeName} = ${tsFile.getTSType(jsonContent.schema)}`
            tsFile.addSourceText(typeDefinition)
        }
    }
}
