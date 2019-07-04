import { ComponentSchemaTypesGenerator } from './ComponentSchemaTypesGenerator'
import { ResourcesGenerator } from './ResourcesGenerator'
import { ComponentSchemaResponsesGenerator } from './ComponentSchemaResponsesGenerator'

export const Generators = {
    [ComponentSchemaTypesGenerator.name]: ComponentSchemaTypesGenerator,
    [ResourcesGenerator.name]: ResourcesGenerator,
    [ComponentSchemaResponsesGenerator.name]: ComponentSchemaResponsesGenerator,
}
