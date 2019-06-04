# Slushy 🍦🍭
An OpenAPI based typescript server code generator. Slushy takes care of the boring parts like typing and route binding for you. All you do is define the schema and implement resources!

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
export type Pet = { id: number }

export class GetPetsSuccess {
    public status: 200
    public constructor(public payload: Array<Pet>) {}
}

export interface PetsResource {
    getPetsById(request: {}): Promise<GetPetsSuccess>
}

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