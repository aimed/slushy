import { OpenAPIV3 } from "openapi-types";

export interface CodeGenContext {
    destDir: string
    /**
     * A BUNDLED version of the open api definition.
     */
    openApi: OpenAPIV3.Document
    mkDir(dir: string): Promise<void>
    writeFile(path: string, content: string | Buffer): Promise<void>
    joinPath(...path: string[]): string
}