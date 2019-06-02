import { SymbolExport } from "./SymbolExport";
import { SymbolExportedHandler } from "./SymbolExportedHandler";

export class SymbolRegistry {
    /**
     * Unique types to exports.
     */
    private readonly typeRegistry = new Map<string, SymbolExport>()

    private readonly typeRegisteredListeners = new Map<string, SymbolExportedHandler[]>()

    public register(symbol: string, path: string, exported: boolean) {
        if (this.typeRegistry.has(symbol)) {
            throw new Error(`Symbol ${symbol} has already been registered`)
        }

        this.typeRegistry.set(symbol, { symbol, path, exported })
        const listeners = this.typeRegisteredListeners.get(symbol) || []
        for (const listener of listeners) {
            listener({ symbol, path, exported })
        }
        this.typeRegisteredListeners.delete(symbol)
    }

    /**
     * Resolves to the symbol as soon at it has been registered.
     * @note This can potentially lead to dead locks.
     */
    public async get(symbol: string): Promise<SymbolExport> {
        return new Promise((resolve) => {
            const identifier = this.typeRegistry.get(symbol)

            if (identifier) {
                resolve(identifier)
                return
            }

            const listeners = this.typeRegisteredListeners.get(symbol)
            if (listeners) {
                listeners.push(resolve)
            } else {
                this.typeRegisteredListeners.set(symbol, [resolve])
            }
        })
    }

}