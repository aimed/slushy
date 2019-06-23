import commander from 'commander'
import { TSModule } from './typescript/TSModule'
import SwaggerParser from 'swagger-parser'
import { getRequiredGenerators, GeneratorConstructor } from './generators/Generator'
import { Generators } from './generators/Generators'

commander
    .version(require('../package.json').version, '-v, --version')
    .command('gen <openApiFile> <outDir> [...generators]')
    .action(async (api, outDir, generatorNames = [Generators.ResourcesGenerator.name]) => {
        try {
            const document = await SwaggerParser.bundle(api)
            const tsModule = new TSModule()

            const generators: GeneratorConstructor[] = generatorNames.map(
                (generatorName: keyof typeof Generators) => Generators[generatorName]
            )
            if (!generators.every(Boolean)) {
                throw new Error(`Invalid generator, only allowed values are: ${Object.keys(Generators).join(', ')}`)
            }

            const requiredGenerators = getRequiredGenerators(generators)
            for (const Generator of requiredGenerators) {
                const generator = new Generator()
                await generator.generate(document, tsModule)
            }

            await tsModule.build(outDir)
        } catch (error) {
            console.error(error, error.stack)
            process.exit(1)
        }
        // TODO: Replace with generators.
        //       Example: @slushy/codegen gen ./openapi.yaml ./src/generated ComponentSchemaTypes SlushyResources
    })

commander.parse(process.argv)
