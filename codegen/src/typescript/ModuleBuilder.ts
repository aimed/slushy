import { OpenAPIV3 } from 'openapi-types'
import { ModuleResolver } from './ModuleResolver';

/**
 * Typescript source code
 */
export type TSText = string
/**
 * An exported object from a source file
 */
export type TSExport = string

export interface Import {
    path: string
    name: OpenAPIV3.ReferenceObject | TSExport
}

export interface SourceFile {
    path: string
    content: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | TSText
    imports: Import[]
}

/**
 * A module is a folder structure that contains typescript files.
 */
export class ModuleBuilder {
    public readonly moduleResolver = new ModuleResolver()

    public readonly sourceFiles: SourceFile[] = []

    public constructor() { }

    // public addSourceFile(path: string, content: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | TSText, imports: Import[] = []) {

    // }
}

/*
i want to create typescript files based on schemas and ts definitions

if i have a schema object i want to create a typescript type
- string -> string
- object -> { ...properties }

if i have a reference object i want to import the reference on the top level of the file and want to use it
- $ref: '#/components/schema/pet' -> import { Pet } from '../petPath/'
- $ref: '../resources/user.yaml' -> import { User } from '../userPath/'
- $ref: '../resources/pets.yaml#/components/schema/pet' -> import { Pet } from '../petPath/'

but when resolving a $ref, i do not yet know what the path is. solutions:
- (currently used) use swagger bundle, which will resolve all refs and add them as local schemas, then create one types file
- use a resolver that:
    - for a ref returns the named import as well as the path


i also want to create typescript classes, that might depend on other imports, e.g. Pets as well as Server
- i can continue to use the ref resolver and make a ref to slushy something like $ref: '#/slushy'

i need to safe all refs made and later add them to the import section of the file

// const symbols = new SymbolsRegistry()
// const file = new TSFile(symbols)
const module = new TSModuleBuilder()
const file = module.file('PetResource.ts')
const types = new TypeBuilder(file)

file.import('Server', '@slushy/server')
file.import('Pet') // This will lazy resolve
file.addType('GetPetResponse', types.union())
file.addType('GetPetSuccess', types.fromSchema({ $ref: '#/components/schemas/Pet' })) // This will import Pet
file.addType('Pet', {}) // This will now resolve pet
file.add(tsSymbol) // For classes
*/