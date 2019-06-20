import { TSClassMethod } from './TSClassMethod'
import { TSClassProperty } from './TSClassProperty'

export class TSClassBuilder {
    private extend?: { className: string; constructorCalls: string[] }
    private readonly parameters: TSClassProperty[] = []
    private readonly properties: TSClassProperty[] = []
    private readonly methods: TSClassMethod[] = []

    public constructor(public readonly className: string) {}

    public addConstructorParameter(param: TSClassProperty) {
        this.parameters.push(param)
        return this
    }

    public addProperty(prop: TSClassProperty) {
        this.properties.push(prop)
        return this
    }

    public addMethod(method: TSClassMethod) {
        this.methods.push(method)
        return this
    }

    public extends(className: string, ...constructorCalls: string[]) {
        this.extend = { className, constructorCalls }
        return this
    }

    public build() {
        return `
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
                ) { 
                    ${this.extend ? this.extend.constructorCalls.join('\r') : ''}
                }

                ${this.methods
                    .map(
                        ({ name, returnType, parameters }) => `
                public ${name}(${parameters
                            .map(
                                param =>
                                    `${param.name}: ${param.type}${
                                        param.initialValue ? ` = ${param.initialValue}` : ''
                                    }`
                            )
                            .join(', ')}): ${returnType}
                `
                    )
                    .join('\n\n')}
            }
        `
    }
}
