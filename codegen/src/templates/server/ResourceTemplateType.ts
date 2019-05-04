import { ResourceTemplatePathType } from './ResourceTemplatePathType'
export interface ResourceTemplateType {
    resourceName: string
    importedTypes: string[]
    paths: ResourceTemplatePathType[]
}
