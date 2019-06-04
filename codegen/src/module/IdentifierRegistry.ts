import { IdentifierDeclaration } from "./IdentifierExport";
import { IdentifierExportedHandler } from "./IdentifierExportedHandler";

export class IdentifierRegistry {
    /**
     * Unique types to exports.
     */
    private readonly typeRegistry = new Map<string, IdentifierDeclaration>()

    private readonly typeRegisteredListeners = new Map<string, IdentifierExportedHandler[]>()

    public register(identifier: string, path: string, exported: boolean) {
        if (this.typeRegistry.has(identifier)) {
            throw new Error(`Symbol ${identifier} has already been registered`)
        }

        this.typeRegistry.set(identifier, { identifier, path, exported })
        const listeners = this.typeRegisteredListeners.get(identifier) || []
        for (const listener of listeners) {
            listener({ identifier: identifier, path, exported })
        }
        this.typeRegisteredListeners.delete(identifier)
    }

    /**
     * Resolves to the identifier as soon at it has been registered.
     * @note This can potentially lead to dead locks.
     */
    public async get(identifier: string): Promise<IdentifierDeclaration> {
        return new Promise((resolve) => {
            const registeredIdentifier = this.typeRegistry.get(identifier)

            if (registeredIdentifier) {
                resolve(registeredIdentifier)
                return
            }

            const listeners = this.typeRegisteredListeners.get(identifier)
            if (listeners) {
                listeners.push(resolve)
            } else {
                this.typeRegisteredListeners.set(identifier, [resolve])
            }
        })
    }

}