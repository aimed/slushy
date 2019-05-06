import { OpenAPIV3 } from 'openapi-types'
import { fs } from 'mz'
import Mustache from 'mustache'
import * as path from 'path'
import * as prettier from 'prettier'

export class CodeGenContext {
    constructor(
        public sourceFile: string,
        public destDir: string,
        /**
         * A BUNDLED version of the open api definition.
         */
        public openApi: OpenAPIV3.Document
    ) {}

    private get templatesDir() {
        return this.joinPath(__dirname, '..', 'templates', 'server')
    }

    async renderTemplate(template: string, data: any): Promise<string> {
        return Mustache.render(await this.readFile(this.joinPath(this.templatesDir, template)), data)
    }

    prettifyTS(ts: string) {
        return prettier.format(ts, { semi: false, parser: 'typescript', printWidth: 120, singleQuote: true })
    }

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
