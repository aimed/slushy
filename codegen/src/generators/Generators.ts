import { ComponentSchemaTypesGenerator } from './ComponentSchemaTypesGenerator'
import { ResourcesGenerator } from './ResourcesGenerator'

export const Generators = {
    [ComponentSchemaTypesGenerator.name]: ComponentSchemaTypesGenerator,
    [ResourcesGenerator.name]: ResourcesGenerator,
}
