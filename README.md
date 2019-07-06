[![Build Status](https://travis-ci.org/aimed/slushy.svg?branch=master)](https://travis-ci.org/aimed/slushy)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

🚧 Early prototype ahead 🚧

# Slushy - fully typed and validated APIs 🍦🍭

Slushy uses OAS (OpenApi Specification) schemas to generate server boilerplate and validate server inputs and outputs.
Slushy currently consist of the following parts:

-   [@slushy/codegen](./codegen) Takes an OAS schema and generates typescript type definitions as well as @slushy/server boilerplate.
-   [@slushy/server](./server) An opinionated NodeJS server based on an OAS schema with inputs/outputs validation and out of the box functionality such as api documentation.

To use slushy just follow three simple steps:

-   Define the OAS schema
-   Generate typescript types and server boilerplate
-   Run the server

Current features:

-   Input validation
-   Type generation
-   Route generation

## Documentation

For documentation see [https://aimed.github.io/slushy/](https://aimed.github.io/slushy/).

## Development

Coming up.
