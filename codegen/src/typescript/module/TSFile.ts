import { IdentifierRegistry } from './IdentifierRegistry'
import { IdentifierImport } from './IdentifierImport'
import { groupBy } from 'lodash'
import ts from 'typescript'
import * as path from 'path'
import { OpenAPIV3 } from 'openapi-types'
import { capitalize, isReferenceObject } from './utils'
import * as prettier from 'prettier'

export class TSFile {
    private readonly imports: IdentifierImport[] = []

    private contents: string[] = []

    public constructor(
        public readonly path: string,
        private readonly registry: IdentifierRegistry = new IdentifierRegistry()
    ) {}

    /**
     * Imports an identifier.
     * @param identifier The symbol to import.
     * @param from A path the import the symbol from. This is helpful for e.g. importing libraries.
     */
    public import(identifier: string, from?: string): void {
        this.imports.push({ identifier, path: from })
    }

    public setContent(file: ts.SourceFile) {
        this.contents = file.text.split('\n')

        for (const statement of file.statements) {
            this.registerDeclarationStatementIfApplicable(statement)
        }
    }

    /**
     * Parses the source and adds all nodes to the file.
     */
    public addSourceText(sourceText: string) {
        const sourceFile = ts.createSourceFile('tmp.ts', sourceText, ts.ScriptTarget.Latest)
        for (const node of sourceFile.statements) {
            this.addNode(node, sourceFile)
        }
    }

    public addNode(node: ts.Node, sourceFile: ts.SourceFile) {
        this.contents.push(node.getText(sourceFile))
        this.registerDeclarationStatementIfApplicable(node)
    }

    private registerDeclarationStatementIfApplicable(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) {
            if (node.name && ts.isIdentifier(node.name)) {
                this.registry.register(node.name.escapedText.toString(), this.path, ts.isExportDeclaration(node))
            }
        }
    }

    private getReferencedTypeIdentifier(schema: OpenAPIV3.ReferenceObject): string {
        // TODO: Replace with resolver function
        if (!schema.$ref.startsWith('#/components/schemas/')) {
            throw new Error(
                "Currently only local refs to '#/components/schemas/' are allowed, you might have forgotten to use swagger-parser.bundle"
            )
        }

        const identifier = capitalize(schema.$ref.replace('#/components/schemas/', ''))
        return identifier
    }

    public getTSType(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined): string {
        if (schema === undefined) {
            return 'undefined'
        }

        if (isReferenceObject(schema)) {
            const referencedType = this.getReferencedTypeIdentifier(schema)
            this.import(referencedType)
            return referencedType
        }

        if (schema.allOf) {
            return schema.allOf.map(allOfItem => this.getTSType(allOfItem)).join(' & ') || 'never'
        }

        // TODO: This is actually oneOf, but a good approximation
        if (schema.anyOf) {
            return schema.anyOf.map(anyOfItem => this.getTSType(anyOfItem)).join(' | ') || 'never'
        }

        if (schema.oneOf) {
            return schema.oneOf.map(oneOfItem => this.getTSType(oneOfItem)).join(' | ') || 'never'
        }

        // TODO: not, readOnly, nullable, constant
        switch (schema.type) {
            case 'object':
                return this.getTSObjectType(schema)
            case 'boolean':
                return 'boolean'
            case 'integer':
                return 'number'
            case 'number':
                return 'number'
            case 'null':
                return 'null'
            case 'string':
                // TODO: Extract into separate method
                // TODO: Handle files etc.
                if (schema.enum) {
                    return schema.enum.map(value => (typeof value === 'string' ? `'${value}'` : value)).join(' | ')
                }
                return 'string'
            case 'array':
                return `Array<${this.getTSType(schema.items)}>`
            default:
                console.warn('Unexpected schema type, defaulting to any', schema)
                return 'any'
        }
    }

    private getTSObjectType(schema: OpenAPIV3.SchemaObject): string {
        const { properties, required = [], additionalProperties } = schema

        if (properties) {
            const propertyDefs: string[] = []

            for (const propertyName of Object.keys(properties)) {
                const isRequired = required.includes(propertyName)
                const propertyDef = properties[propertyName]
                const propertyDefString = this.getTSType(propertyDef)
                propertyDefs.push(`${propertyName}${isRequired ? '' : '?'}: ${propertyDefString}`)
            }

            if (additionalProperties) {
                propertyDefs.push('[k:string]: any')
            }

            return `{\r\n${propertyDefs.join('\r\n')}\r\n}`
        }

        return 'any'
    }

    public async build(): Promise<string> {
        const imports = await this.resolveImports()
        const source = [...imports, '', ...this.contents].join('\r')
        const formatted = prettier.format(source, {
            parser: 'typescript',
            semi: false,
            singleQuote: true,
            printWidth: 120,
        })
        return formatted
    }

    private resolveImports() {
        // FIXME: Behavior for not exported types is currently undefined.
        // Group all imports and create the import statements
        const importStatements = this.imports.map(imp => (imp.path ? imp : this.registry.get(imp.identifier)))
        const importsWithoutSelf = importStatements.filter(imp => imp.path !== this.path)
        const importsByFile = groupBy(importsWithoutSelf, 'path')
        const importDeclarations: string[] = []

        for (const [file, importsFromFile] of Object.entries(importsByFile)) {
            const pathRelative = path.relative(path.dirname('/' + this.path), '/' + file)
            // path.relative will resolve ('/', '/a/b.ts') to 'a/b.ts', but we need './a/b.ts'.
            const pathRelativeNormalized = pathRelative.startsWith('.') ? pathRelative : `./${pathRelative}`
            const importedIdentifiers = Array.from(new Set(importsFromFile))
                .map(im => im.identifier)
                .join(', ')
            importDeclarations.push(
                `import { ${importedIdentifiers} } from '${pathRelativeNormalized.replace('.ts', '')}'`
            )
        }

        return importDeclarations
    }
}
