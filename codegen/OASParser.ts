import SwaggerParser from 'swagger-parser'
import * as path from 'path'
import { OpenAPIV3 } from 'openapi-types'
import { fs } from 'mz'
import { ResourceFactory } from './ResourceFactory';
import { log } from './log';
import { CodeGenContext } from './CodeGenContext';
import { TypeFactory } from './TypeFactory';
import Mustache from 'mustache'

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

        const context: CodeGenContext = {
            sourceFile,
            destDir,
            openApi: await SwaggerParser.bundle(sourceFile),
            mkDir: this.mkDir,
            writeFile: fs.writeFile,
            readFile: async file => (await fs.readFile(file)).toString(),
            joinPath: path.join.bind(path),
            renderTemplate: async (template, data) => Mustache.render(await context.readFile(context.joinPath(__dirname, 'templates', 'server', template)), data)
        }

        const swaggerOutPath = path.join(destDir, 'openapi.json')
        log('Writing openapi.json to', swaggerOutPath)
        await fs.writeFile(swaggerOutPath, JSON.stringify(swagger, null, 2))

        const typeFactory = new TypeFactory()
        await typeFactory.createTypesFile(context)

        const resourceFactory = new ResourceFactory()
        await resourceFactory.createResources(swagger, destDir)
    }
}