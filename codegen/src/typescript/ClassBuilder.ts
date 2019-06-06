import { CodeGenContext } from '../CodeGenContext'

export interface Property {
    name: string
    type: string
    initialValue?: string
}

export class ClassBuilder {
    private extend?: { className: string; constructorCalls: string[] }
    private readonly parameters: Property[] = []
    private readonly properties: Property[] = []

    public constructor(private readonly className: string, private readonly context: CodeGenContext) { }

    public addParameter(param: Property) {
        this.parameters.push(param)
        return this
    }

    public addProperty(prop: Property) {
        this.properties.push(prop)
        return this
    }

    public extends(className: string, ...constructorCalls: string[]) {
        this.extend = { className, constructorCalls }
        return this
    }

    public build() {
        return this.context.prettifyTS(`
            export class ${this.className}${this.extend ? ` extends ${this.extend.className}` : ''} {
                ${this.properties
                .map(
                    prop =>
                        `public readonly ${prop.name}${prop.initialValue ? '' : '?'}: ${prop.type}${
                        prop.initialValue ? ` = ${prop.initialValue}` : ''
                        }`
                )
                .join('\n')}
                public constructor(
                    ${this.parameters
                .map(
                    param =>
                        `public readonly ${param.name}: ${param.type}${
                        param.initialValue ? ` = ${param.initialValue}` : ''
                        }`
                )
                .join(',\n')}
                ) { ${this.extend ? this.extend.constructorCalls.join('\r') : ''}}
            }
        `)
    }
}
