An OpenAPI based typescript server code generator. Slushy takes care of the boring parts like typing and route binding for you. All you do is define the schema and implement resources!

## What does it do?

You write:

```yaml
paths:
    /pets:
        get:
            operationId: getPets
            responses:
                '200':
                    description: A lot of pets
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
                                    $ref: '#/components/schemas/pet'
components:
    schemas:
        Pet:
            type: object
            properties:
                id:
                    type: number
```

Slushy generates:

```ts
// JSON Schema types
export type Pet = { id: number }

// Typed responses
export class GetPetsSuccess {
    public status: 200
    public constructor(public payload: Array<Pet>) {}
}

// Typed resources
export interface PetsResource {
    getPetsById(request: {}): Promise<GetPetsSuccess>
}

// Typed routers
export class PetsResourceRouter {
    bind(router: Router, resource: PetsResource) {
        router.get('/pets', resource.getPetsById.bind(resource))
    }
}
```

You write:

```ts
export class PetsResourceImplementation implements PetsResource {
    getPetsById() {
        return Promise.resolve(new GetPetsSuccess([{ id: 1 }]))
    }
}
```

## How does it work?

### The CLI tool (codegen)

```
# Install the CLI tool
yarn install @slushy/codegen

# Generate code based on an OpenApi file
yarn @slushy/codegen gen ./openApi.yaml ./src/generated
```

The command line tool takes the following arguments: `@slushy/codegen gen <Open Api File> <Generated Code Dir> [Code generators]`.

Currently the following code generators are supported:
|Generator name|Description|
|--------------|-----------|
|ResourcesGenerator|(Default) Generates Slushy resources and all required types.|
|ComponentSchemaTypesGenerator|Generates all types for the #/components/schemas section of the OpenApi file.|
