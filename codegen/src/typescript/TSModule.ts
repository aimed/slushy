import { IdentifierRegistry } from './IdentifierRegistry'
import { TSFile } from './TSFile'
import { FileSystem } from './FileSystem'
import * as path from 'path'

export class TSModule {
    private readonly registry = new IdentifierRegistry()
    private readonly files = new Map<string, TSFile>()

    public constructor(private readonly fileSystem = new FileSystem()) {}

    public file(path: string) {
        const file = new TSFile(path, this.registry)
        this.files.set(path, file)
        return file
    }

    public async build(outDir: string) {
        await Promise.all(
            Array.from(this.files).map(async file => {
                const [fileName, tsFile] = file
                const fileContent = await tsFile.build()
                return this.fileSystem.write(path.join(outDir, fileName), fileContent)
            })
        )
    }
}
