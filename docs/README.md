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

# Bearer Authorization
Slushy also supports OpenAPI's `security` - although it is a bit opinionated on the declaration.

It provides two levels of granularity, all endpoints are authenticated or single endpoint authentication

To inject your middleware into all endpoints you can declare it on top level of your configuration file:

```yaml
# pet.yaml
security:
  - bearerAuth: []
```
To inject your middle ware into a single endpoint you can declare it inside the endpoint definition:

```yaml
# pet.yaml
paths:
  /pets:
    get:
      security:
        - bearerAuth: []
```

In both cases, you have to write your `AuthenticationMiddleware` that implements `SlushyAuthenticationMiddleware`

```ts
// AuthenticationMiddleware.ts
export class AuthenticationMiddleware implements SlushyAuthenticationMiddleware {
    execute(req: SlushyRequest, res: SlushyResponse, next: (error?: Error) => any): any {
        if (req.headers.authorization) {
            next()
        } else {
            res.status(401).json({ error: { message: "unauthorized" }})
        }
        
    }
}
```

After that you just have to pass it on a `Slushy` server creation:

```ts
// index.ts
import { SlushyFactory } from './SlushyFactory'
import { AuthenticationMiddleware } from './AuthenticationMiddleware'

async function run() {
    const slushy = await SlushyFactory.create({ authenticationMiddleware: new AuthenticationMiddleware() })
    await slushy.start(3031)
}

run()
```

And voilá!