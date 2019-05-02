import { OpenAPIV3 } from "openapi-types";

export interface CodeGenContext {
    renderTemplate: (template: string, data: any) => Promise<string>
    sourceFile: string
    destDir: string
    /**
     * A BUNDLED version of the open api definition.
     */
    openApi: OpenAPIV3.Document
    mkDir(dir: string): Promise<void>
    readFile(path: string): Promise<string>
    writeFile(path: string, content: string | Buffer): Promise<void>
    joinPath(...path: string[]): string
}