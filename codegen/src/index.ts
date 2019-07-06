import commander from 'commander'
import { OpenAPIV3 } from 'openapi-types'
import SwaggerParser from 'swagger-parser'
import { GeneratorConstructor, getRequiredGenerators } from './generators/Generator'
import { Generators } from './generators/Generators'
import { TSModule } from './typescript/TSModule'

commander
    // tslint:disable-next-line: no-var-requires
    .version(require('../package.json').version, '-v, --version')
    .command('gen <openApiFile> <outDir> [...generators]')
    .action(async (api, outDir, generatorNames = Generators.ResourcesGenerator.name) => {
        try {
            const document = (await SwaggerParser.bundle(api)) as OpenAPIV3.Document
            if (document.openapi.startsWith('2')) {
                throw new Error('Slushy currently only supports OpenApi v3 documents.')
            }

            const tsModule = new TSModule()

            const generators: GeneratorConstructor[] = generatorNames
                .split(',')
                .map((generatorName: keyof typeof Generators) => Generators[generatorName])
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
    })

commander.parse(process.argv)
