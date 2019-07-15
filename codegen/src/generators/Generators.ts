import { ComponentParametersGenerator } from './ComponentParametersGenerator'
import { ComponentSchemaResponsesGenerator } from './ComponentSchemaResponsesGenerator'
import { ComponentSchemaTypesGenerator } from './ComponentSchemaTypesGenerator'
import { ResourcesGenerator } from './ResourcesGenerator'

export const Generators = {
    [ComponentSchemaTypesGenerator.name]: ComponentSchemaTypesGenerator,
    [ComponentParametersGenerator.name]: ComponentParametersGenerator,
    [ResourcesGenerator.name]: ResourcesGenerator,
    [ComponentSchemaResponsesGenerator.name]: ComponentSchemaResponsesGenerator,
}
