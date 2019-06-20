import { TSClassMethod } from './TSClassMethod'

export class TSInterfaceBuilder {
    private readonly methods: TSClassMethod[] = []

    public constructor(private readonly interfaceName: string) {}

    public addMethod(method: TSClassMethod) {
        this.methods.push(method)
        return this
    }

    public build(): string {
        return `
            export interface ${this.interfaceName} {
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
