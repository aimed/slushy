---
id: intro
title: Slushy - Fully typed REST APIs
---

An OpenAPI based typescript server code generator and framework. Slushy takes care of the boring parts like typing and route binding for you. All you do is define the schema and implement resources!

## What does it do?

You define your [OpenApi (Swagger)](https://swagger.io/specification/) schema:

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

Slushy generates everything you need to get started:

```ts
// Types for all schemas defined in #/components/schemas
export type Pet = {
  id: number
}

// Types for all responses defined for a given path
export class GetPetsSuccess {
  public status = 200
  public constructor(public payload: Array<Pet>) {}
}
export type GetPetsResponse = GetPetsSuccess

// Fully typed path bindings
export class PetsResourceRouter {
  bind(router: Router, resource: PetsResource) {
    router.get<GetPetsParams, GetPetsResponse>('/pets', resource.getPetsById.bind(resource))
  }
}

// Fully typed resource interfaces for you to implement
export interface PetsResource<Context> {
  getPetsById(parameters: GetPetsParams, context: Context): Promise<GetPetsResponse>
}
```

All that's left for you is to actually implement request handlers based on the generated code:

```ts
// Implement all required resources
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

// Create the server and start it
const app = await Slushy.create<Context>({
  // The ResourcesConfiguration is generated.
  // It will require you to implement all resources defined in the schema.
  resourceConfiguration: new ResourcesConfiguration({
    PetsResource: new PetsResourceImplementation(),
  }),
})
await app.start(3000)
```

## How does it work?

### The CLI tool (codegen)

```
# Install the CLI tool
yarn add @slushy/codegen

# Generate code based on an OpenApi file
yarn @slushy/codegen gen ./openApi.yaml ./src/generated
```

The command line tool takes the following arguments: `@slushy/codegen gen <Open Api File> <Generated Code Dir> [Code generators]`.

Currently the following code generators are supported:

| Generator name                | Description                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| ResourcesGenerator            | (Default) Generates Slushy resources and all required types.                    |
| ComponentSchemaTypesGenerator | Generates all types for the #/components/schemas section of the OpenApi file.   |
| ComponentResponsesGenerator   | Generates all types for the #/components/responses section of the OpenApi file. |

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
For more info see [https://github.com/skonves/express-http-context](https://github.com/skonves/express-http-context) and [https://github.com/Jeff-Lewis/cls-hooked](https://github.com/Jeff-Lewis/cls-hooked).

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

## Development

Visit the GitHub project at [{{site.github.repository_url}}]({{site.github.repository_url}}).

## More

<ul>
{% for link in site.data.nav %}
<li><a href="{{site.github.url}}{{link.to}}">{{link.name}}</a></li>
{% endfor %}
</ul>
