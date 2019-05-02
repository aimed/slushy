import SwaggerParser from 'swagger-parser'
import { OpenAPIV3 } from 'openapi-types'
import { fs } from 'mz'
import { ResourceFactory } from './ResourceFactory';
import { log } from './log';
import { CodeGenContext } from './CodeGenContext';
import { TypeFactory } from './TypeFactory';

export class OASParser {
    async mkDir(dir: string) {
        if (!(await fs.exists(dir))) {
            await fs.mkdir(dir)
        }
    }

    async parseOAS(sourceFile: string, destDir: string) {
        await this.mkDir(destDir)

        log('Validating OpenApi definition')
        // FIXME: Remove
        const swagger: OpenAPIV3.Document = await SwaggerParser.validate(sourceFile)

        const context = new CodeGenContext(
            sourceFile,
            destDir,
            await SwaggerParser.bundle(sourceFile)
        )

        const swaggerOutPath = context.joinPath(destDir, 'openapi.json')
        log('Writing openapi.json to', swaggerOutPath)
        await fs.writeFile(swaggerOutPath, JSON.stringify(swagger, null, 2))

        const typeFactory = new TypeFactory()
        await typeFactory.createTypesFile(context)

        const resourceFactory = new ResourceFactory()
        await resourceFactory.createResources(swagger, destDir)
    }
}