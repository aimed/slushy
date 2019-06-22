import { TSClassMethod } from './TSClassMethod'
import { TSClassProperty } from './TSClassProperty'

export class TSInterfaceBuilder {
    private readonly methods: TSClassMethod[] = []
    private readonly properties: TSClassProperty[] = []

    public constructor(private readonly interfaceName: string, public readonly generic?: string) {}

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
            export interface ${this.interfaceName}${this.generic ? `<${this.generic}>` : ''} {
                ${this.properties.map(prop => `${prop.name}: ${prop.type}`).join('\n')}

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
