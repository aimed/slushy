export interface ResourceTemplatePathType {
    resourceName: string;
    path: string;
    method: 'get' | 'post' | 'delete' | 'options' | 'put' | 'head';
    operationId: string;
    parameterTypeName: string;
    parameterTypeDefinition: string;
    response: {
        definition: string;
        name: string;
    };
}
