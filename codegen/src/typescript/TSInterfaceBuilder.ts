import { TSClassMethod } from './TSClassMethod'
import { TSClassProperty } from './TSClassProperty'

export class TSInterfaceBuilder {
    private readonly methods: TSClassMethod[] = []
    private readonly properties: TSClassProperty[] = []

    public constructor(private readonly interfaceName: string) {}

    public addMethod(method: TSClassMethod) {
        this.methods.push(method)
        return this
    }

    public addProperty(property: TSClassProperty) {
        this.properties.push(property)
        return this
    }

    public build(): string {
        return `
            export interface ${this.interfaceName} {
                ${this.properties.map(prop => `${prop.name}${prop.initialValue ? '' : '?'}: ${prop.type}`).join('\n')}

                ${this.methods
                    .map(
                        ({ name, returnType, parameters }) => `
                ${name}(${parameters.map(param => `${param.name}: ${param.type}`).join(', ')}): ${returnType}
                `
                    )
                    .join('\n\n')}
            }
        `
    }
}
