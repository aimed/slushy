import SwaggerParser from 'swagger-parser'
import { ResourceFactory } from './ResourceFactory'
import { log } from './log'
import { CodeGenContext } from './CodeGenContext'
import { TypeFactory } from './typescript/TypeFactory'
import { TSModule } from './typescript/module/TSModule';
import { ComponentSchemaTypesGenerator } from './generators/ComponentSchemaTypesGenerator';

export class OASParser {
    async parseOAS(sourceFile: string, destDir: string) {
        // TODO: Use generators to allow plug ins
        log('Validating OpenApi definition')
        // TODO: Get rid of CodeGenContext and instead use typescript.module?
        const openApi = await SwaggerParser.bundle(sourceFile)
        const context = new CodeGenContext(sourceFile, destDir, openApi)
        await context.mkDir(destDir)

        const swaggerOutPath = context.joinPath(destDir, 'openapi.json')
        log('Writing openapi.json to', swaggerOutPath)
        await context.writeFile(swaggerOutPath, JSON.stringify(await SwaggerParser.validate(sourceFile), null, 2))

        log('Creating types')
        // TODO: Use ComponentSchemaTypesGenerator
        const tsModule = new TSModule()
        const componentSchemaTypesGenerator = new ComponentSchemaTypesGenerator()
        componentSchemaTypesGenerator.generate(openApi, tsModule)
        await tsModule.build(destDir)

        // TODO: Remove dependency on types.ts file
        const typeFactory = new TypeFactory()
        await typeFactory.createTypesFileFromComponentSchemas(context)

        log('Creating resources')
        // TODO: Create SlushyResourcesGenerator
        const resourceFactory = new ResourceFactory()
        await resourceFactory.createResources(context)
    }
}
