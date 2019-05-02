import SwaggerParser from 'swagger-parser'
import * as path from 'path'
import { OpenAPIV3 } from 'openapi-types'
import { compile as compileJsonSchema } from 'json-schema-to-typescript'
import { JSONSchema4 } from 'json-schema'
import { fs } from 'mz'
import { ResourceFactory } from './ResourceFactory';
import { capitalize } from './utils';

async function parseSwagger() {
    const sourceFile = path.join(__dirname, '..', 'example', 'pet.yaml')
    const destDir = path.join(__dirname, '..', 'example', 'generated')
    if (!(await fs.exists(destDir))) {
        await fs.mkdir(destDir)
    }

    console.log('Validating OpenApi definition')
    const swagger: OpenAPIV3.Document = await SwaggerParser.validate(sourceFile)

    const swaggerOutPath = path.join(destDir, 'openapi.json')
    console.log('Writing openapi.json to', swaggerOutPath)
    await fs.writeFile(swaggerOutPath, JSON.stringify(swagger, null, 2))

    const factory = new ResourceFactory()
    await factory.createResources(swagger, destDir)
    await generateTypes(destDir, swagger.components!.schemas!)
}

// TODO: This does not yet use existing types, but instead nests them, because swagger already resolves references.
//       A possible workaround is to manually parse the yaml and resolve references.
async function generateTypes(generatedDir: string, schemas: { [name: string]: JSONSchema4 }) {
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

parseSwagger()
    .catch(error => console.error(error.stack || error.message))
