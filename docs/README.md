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
export type Pet = {
  id: number
}

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
    return Promise.resolve(
      new GetPetsSuccess([
        {
          id: 1,
        },
      ]),
    )
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

| Generator name                | Description                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| ResourcesGenerator            | (Default) Generates Slushy resources and all required types.                  |
| ComponentSchemaTypesGenerator | Generates all types for the #/components/schemas section of the OpenApi file. |

## Experimental Features

### File uploads

For the OpenApi documentation regarding file uploads see https://swagger.io/docs/specification/describing-request-body/multipart-requests/.
You can (and should) enforce limits on the files that are uploaded. The limits can be configured using the `x-multer-limits` property on the [OperationObject]. For possible configuration values please consult the [multer documentation](https://github.com/expressjs/multer#limits).

**Limitations:**

- File uploads are only possible via multipart/form-data.
- The requestBody MUST be an object and all files MUST be on the root of the object (e.g. `{ file: Buffer, otherBodyProperty: string }`).
- All files are currently read into a Buffer.

## Experimental APIs

### Request Context

Slushy currently supports a [RequestContext] through the continuation local storage and async hooks APIs. That is why it might not work with some libraries (e.g. async).
For more info see https://github.com/skonves/express-http-context and https://github.com/Jeff-Lewis/cls-hooked.

The [RequestContext] is a per request global state object that can be used to share objects. Out of the box the [RequestContext] provides the [Logger] as well as the [RequestId]. You can retrieve these as described below:

```ts
const logger = RequestContext.get(Logger)
const requestId = RequestContext.get(RequestId)
```

You can also attach custom objects to the RequestContext:

```ts
// In your authentication code (AuthorizationMiddleware.ts):
authorize() {
  const user = new User()
  RequestContext.set(User, user)
}

// Later in your application:
doSomething() {
  const user = RequestContext.get(User)
}
```

Note that currently the identifier always is a class and the value an instance of that class. The [RequestContext] will throw if no instance has been bound to a given identifier.
