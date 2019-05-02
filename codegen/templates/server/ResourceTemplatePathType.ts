export interface ResourceTemplatePathType {
    resourceName: string;
    path: string;
    method: 'get' | 'post' | 'delete' | 'options' | 'put' | 'head';
    operationId: string;
    parameter: {
        name: string
        definition: string
    }
    response: {
        name: string;
        definition: string;
    };
}
