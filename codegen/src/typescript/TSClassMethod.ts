import { TSClassProperty } from './TSClassProperty'
export interface TSClassMethod {
    name: string
    parameters: TSClassProperty[]
    returnType: string
}
