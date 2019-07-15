import { OpenAPIV3 } from 'openapi-types'
import * as path from 'path'
import { TSModule } from '../../typescript/TSModule'
import { isReferenceObject } from '../../typescript/utils'
import { capitalize } from '../../utils'
import { Generator } from '../Generator'

export class ComponentParametersGenerator implements Generator {
    public dependsOn: (new () => Generator)[] = []

    public async generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void> {
        const parameters = (document.components || {}).parameters || {}
        const imports: string[] = []

        for (const [parameterName, parameterSchema] of Object.entries(parameters)) {
            if (!parameterSchema) {
                continue
            }

            if (isReferenceObject(parameterSchema)) {
                throw new Error(`A component parameter cannot be a reference object`)
            }

            const parameterIdentifier = `${capitalize(parameterName)}Param`
            imports.push(parameterIdentifier)
            const tsFile = tsModule.file(path.join('parameters', `${parameterIdentifier}.ts`))
            tsFile.addSourceText(`export type ${parameterIdentifier} = ${tsFile.getTSType(parameterSchema.schema)}`)
        }
    }
}
