import SwaggerParser from 'swagger-parser'
import * as path from 'path'
import { OpenAPIV3 } from 'openapi-types'
import { compile as compileJsonSchema } from 'json-schema-to-typescript'
import { JSONSchema4 } from 'json-schema'
import { fs } from 'mz'
import { ResourceFactory } from './ResourceFactory';
import { capitalize } from './utils';
import { log } from './log';

export class OASParser {
    async mkDir(dir: string) {
        if (!(await fs.exists(dir))) {
            await fs.mkdir(dir)
        }
    }

    async writeFile(path: string, content: string | Buffer) {
        await fs.writeFile(path, content)
    }

    async parseOAS(sourceFile: string, destDir: string) {
        await this.mkDir(destDir)

        log('Validating OpenApi definition')
        // FIXME: Remove
        await this.test(sourceFile)
        const swagger: OpenAPIV3.Document = await SwaggerParser.validate(sourceFile)

        const swaggerOutPath = path.join(destDir, 'openapi.json')
        log('Writing openapi.json to', swaggerOutPath)
        await fs.writeFile(swaggerOutPath, JSON.stringify(swagger, null, 2))

        const factory = new ResourceFactory()
        await factory.createResources(swagger, destDir)
        await this.generateTypes(destDir, swagger.components!.schemas!)
    }

    async test(sourceFile: string) {
        const swagger: OpenAPIV3.Document = await SwaggerParser.bundle(sourceFile)
        console.log(swagger);
    }

    // TODO: This does not yet use existing types, but instead nests them, because swagger already resolves references.
    //       A possible workaround is to manually parse the yaml and resolve references.
    async generateTypes(generatedDir: string, schemas: { [name: string]: JSONSchema4 }) {
        const destDir = path.join(generatedDir, 'types')
        if (!(await fs.exists(destDir))) {
            await fs.mkdir(destDir)
        }

        return Promise.all(Object.keys(schemas).map(async (typeKey: keyof typeof schemas) => {
            const typeName = capitalize(typeKey.toString())
            const typeDefinitions = await compileJsonSchema(schemas[typeKey], typeName)
            return fs.writeFile(path.join(destDir, `${typeName}.ts`), typeDefinitions)
        }))
    }
}