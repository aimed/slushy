import commander from 'commander'
import { TSModule } from './typescript/TSModule'
import { ComponentSchemaTypesGenerator } from './generators/ComponentSchemaTypesGenerator'
import SwaggerParser from 'swagger-parser'
import { ResourcesGenerator } from './generators/ResourcesGenerator/ResourcesGenerator'

commander
    .version(require('../package.json').version, '-v, --version')
    .command('gen <openApiFile> <outDir>')
    .action(async (api, outDir) => {
        try {
            const document = await SwaggerParser.bundle(api)
            const tsModule = new TSModule()

            const componentSchemaTypesGenerator = new ComponentSchemaTypesGenerator()
            await componentSchemaTypesGenerator.generate(document, tsModule)

            const resourcesGenerator = new ResourcesGenerator()
            await resourcesGenerator.generate(document, tsModule)

            await tsModule.build(outDir)
        } catch (error) {
            console.error(error, error.stack)
            process.exit(1)
        }
        // TODO: Replace with generators.
        //       Example: @slushy/codegen gen ./openapi.yaml ./src/generated ComponentSchemaTypes SlushyResources
    })

commander.parse(process.argv)
