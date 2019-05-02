import { OpenAPIV3 } from "openapi-types";
import { fs } from 'mz'
import Mustache from 'mustache'
import * as path from 'path'

export class CodeGenContext {
    constructor(
        public sourceFile: string,
        public destDir: string,
        public openApi: OpenAPIV3.Document,
    ) { }

    async renderTemplate(template: string, data: any): Promise<string> {
        return Mustache.render(await this.readFile(this.joinPath(__dirname, 'templates', 'server', template)), data)
    }

    /**
     * A BUNDLED version of the open api definition.
     */
    async mkDir(dir: string) {
        if (!(await fs.exists(dir))) {
            await fs.mkdir(dir)
        }
    }
    async readFile(path: string) {
        return (await fs.readFile(path)).toString()
    }

    writeFile = fs.writeFile

    joinPath = path.join
}

