import SwaggerParser from 'swagger-parser'
import { ResourceFactory } from './ResourceFactory'
import { log } from './log'
import { CodeGenContext } from './CodeGenContext'
import { TypeFactory } from './typescript/TypeFactory'

export class OASParser {
    async parseOAS(sourceFile: string, destDir: string) {
        log('Validating OpenApi definition')
        const context = new CodeGenContext(sourceFile, destDir, await SwaggerParser.bundle(sourceFile))
        await context.mkDir(destDir)

        const swaggerOutPath = context.joinPath(destDir, 'openapi.json')
        log('Writing openapi.json to', swaggerOutPath)
        await context.writeFile(swaggerOutPath, JSON.stringify(await SwaggerParser.validate(sourceFile), null, 2))

        log('Creating types')
        const typeFactory = new TypeFactory()
        await typeFactory.createTypesFileFromComponentSchemas(context)

        log('Creating resources')
        const resourceFactory = new ResourceFactory()
        await resourceFactory.createResources(context)
    }
}
