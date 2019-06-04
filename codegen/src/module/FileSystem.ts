import * as path from 'path'
import * as fs from 'fs-extra'

export class FileSystem {

    /**
     * Writes file contents to the file system.
     * Guarantees that the directory the file is going to be written to exists.
     * 
     * @param fileName The path of the file.
     * @param fileContent The file content.
     */
    public async write(fileName: string, fileContent: string) {
        const dir = path.dirname(fileName)
        await fs.ensureDir(dir)
        await fs.writeFile(fileName, fileContent)
    }
}