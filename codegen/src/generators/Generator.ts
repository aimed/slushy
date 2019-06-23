import { OpenAPIV3 } from 'openapi-types'
import { TSModule } from '../typescript/TSModule'

export interface Generator {
    dependsOn: Array<new () => Generator>
    generate(document: OpenAPIV3.Document, tsModule: TSModule): Promise<void>
}

export interface GeneratorConstructor {
    new (): Generator
}

export function getRequiredGenerators(generators: Array<GeneratorConstructor>) {
    const requiredGenerators = new Set<GeneratorConstructor>()
    const generatorsToTraverse = generators
    let CurrentGenerator: GeneratorConstructor | undefined = generators.splice(0, 1)[0]
    while (CurrentGenerator) {
        if (requiredGenerators.has(CurrentGenerator)) {
            CurrentGenerator = generators.splice(0, 1)[0]
            continue
        }

        requiredGenerators.add(CurrentGenerator)

        // Get all dependencies
        const currentGenerator = new CurrentGenerator()
        generatorsToTraverse.push(...currentGenerator.dependsOn)

        CurrentGenerator = generators.splice(0, 1)[0]
    }

    return Array.from(requiredGenerators)
}
