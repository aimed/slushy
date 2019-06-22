import { IdentifierExport } from './IdentifierExport'

export class IdentifierRegistry {
    /**
     * Unique types to exports.
     */
    private readonly typeRegistry = new Map<string, IdentifierExport>()

    public register(identifier: string, path: string, exported: boolean) {
        if (this.typeRegistry.has(identifier)) {
            throw new Error(`Symbol ${identifier} has already been registered`)
        }

        this.typeRegistry.set(identifier, { identifier, path, exported })
    }

    public get(identifier: string): IdentifierExport {
        const registeredIdentifier = this.typeRegistry.get(identifier)
        if (!registeredIdentifier) {
            throw new Error(`Identifier ${identifier} has never been registered in the module.`)
        }
        return registeredIdentifier
    }
}
