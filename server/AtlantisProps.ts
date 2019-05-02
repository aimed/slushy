import { OpenAPIV3 } from "openapi-types";
import { AtlantisConfig } from "./AtlantisConfig";

export interface AtlantisProps extends AtlantisConfig {
    openApi: OpenAPIV3.Document;
}
