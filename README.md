🚧 Early prototype ahead 🚧

# Slushy - fully typed and validated APIs ⛵️
Slushy uses OAS (OpenApi Specification) schemas to generate server boilerplate and validate server inputs and outputs.
Slushy currently consist of the following parts:
- [@slushy/codegen](./codegen) Takes an OAS schema and generates typescript type definitions as well as @slushy/server boilerplate.
- [@slushy/server](./server) An opinionated NodeJS server based on an OAS schema with inputs/outputs validation and out of the box functionality such as api documentation.

To use slushy just follow three simple steps:
- Define the OAS schema
- Generate typescript types and server boilerplate
- Run the server

Current features:
- Input validation
- Type generation
- Route generation

## How does it work
**First**: Define your OAS Schema ✒️

It's just like swagger. The following example defines one route `/pets` that will return an Array of Pets.

```yaml
openapi: 3.0.0

paths:
  # This will define the resource 'PetsResource'
  /pets:
    get:
      # This is required right now
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
    # This will define the type 'Pet'
    pet:
      type: object
      properties:
        id:
          type: number
        name:
          type: string
      required: ['id', 'name']
      additionalProperties: false
```

**Then**: Generate code using ```yarn gen <schemaFile> <outputDir>``` 🎩

This will generate the following:
- A `dir/types.ts` file, that contains all objects (e.g. `Pet`). These are types you can use to implement you code.
- Multiple resource type stubs in `dir/resources`, e.g. `PetResource`. These are controller interface you have to implement.
- A ResourceDefinition that you have to pass to `Slushy`, which will bind the OAS paths to your controllers.

<details>
<summary>Show generated code</summary>

Pet (generated):
```ts
export type Pet = {
  id: number
  name: string
}
```

PetsResource (generated):
```ts
export type GetPetsParams = {}

export type GetPetsResponse = Array<Pet>

// You have to implement this
export interface PetsResource<TContext = {}> {
  getPets(params: GetPetsParams, context: SlushyContext<TContext>): Promise<GetPetsResponse>
}
```
</details>

**Last**: Setup the server

It's easy:
```ts
async function run() {
    const slushy = await Slushy.create({
        resourceConfiguration: new ResourceConfig({
            PetsResource: new PetsResourceImpl()
        })
    })
    await slushy.start(3031)
}

run()
```


# TODO
- [ ] Create/use response types
- [ ] Validate output
- [ ] Use input/output formats
- [ ] Handle dates
- [ ] Add security, like helmet etc.
- [ ] Implement authentication