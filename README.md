# Atlantis - fully typed and validated NodeJS backend framework 🍦

Current features:
- Input validation
- Type generation
- Route generation

## How does it work
**First**: Define your OAS (OpenApi) Schema ✒️

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
- A ResourceDefinition that you have to pass to `Atlantis`, which will bind the OAS paths to your controllers.

Pet:
```ts
export type Pet = {
  id: number
  name: string
}
```

PetsResource:
```ts
export type GetPetsParams = {}

export type GetPetsResponse = Array<Pet>

// You have to implement this
export interface PetsResource<TContext = {}> {
  getPets(params: GetPetsParams, context: AtlantisContext<TContext>): Promise<GetPetsResponse>
}

```


**Last**: Setup the server
It's easy:
```ts
async function run() {
    const atlantis = await Atlantis.create({
        resourceConfiguration: new ResourceConfig({
            PetsResource: new PetsResourceImpl()
        })
    })
    await atlantis.start(3031)
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