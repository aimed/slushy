import * as fsPath from 'path'
import { FileSystem } from './FileSystem'
import { IdentifierRegistry } from './IdentifierRegistry'
import { TSFile } from './TSFile'

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
                return this.fileSystem.write(fsPath.join(outDir, fileName), fileContent)
            }),
        )
    }
}
