[![test-and-publish](https://github.com/bbeesley/hygen-cook/actions/workflows/test-and-publish.yml/badge.svg)](https://github.com/bbeesley/hygen-cook/actions/workflows/test-and-publish.yml)

# 🧑‍🍳 hygen-cook

A composition tool for [hygen](https://www.hygen.io) templates. Allows you to compose and generate complex services from many small modular hygen generators.

## Introduction

Hygen is great for templating out small bits of boilerplate for specific use cases, but less than ideal for large complex projects with multiple different options. Hygen Cook aims to solve that issue by allowing you to define a recipe for that large complex project by combining multiple small generators in a specific shape and order.

## Recipes

A recipe is composed of two main sections, `ingredients` and `instructions`. Ingredients specifies which generators will be used in the recipe, either by git url or npm package name. Instructions specifies the calls to those generators and the arguments they require. When you have a recipe file and want to cook the recipe, simply call `hygen-cook` and pass it the recipe, pretty soon you'll have a freshly baked project to start working on.

## Usage

### Install

To get the `hygen-cook` command available in your terminal you'll need to install the module globally:

```shell
npm i -g hygen-cook
```

### Create a Recipe

```yaml
name: My API
ingredients:
  - https://github.com/hygen-generators/scaffolder-demo-hygen
  - github-actions-generators
instructions:
  - ingredient: scaffolder-demo-hygen
    generator: monorepo
    action: new
    args:
      - option: name
        value: simple-service
  - ingredient: scaffolder-demo-hygen
    generator: monorepo-package
    action: new
    basePath: packages/api
    args:
      - option: name
        value: api
  - ingredient: scaffolder-demo-hygen
    generator: monorepo-package
    action: lambda
    basePath: packages/api
    args:
      - option: name
        value: api-lambda
      - option: component
        value: api
  - ingredient: scaffolder-demo-hygen
    generator: monorepo-package
    action: new
    basePath: packages/ingest
    args:
      - option: name
        value: ingest
  - ingredient: scaffolder-demo-hygen
    generator: monorepo-package
    action: lambda
    basePath: packages/ingest
    args:
      - option: name
        value: ingest-lambda
      - option: component
        value: ingest
  - ingredient: github-actions-generators
    generator: github-actions
    action: build-test-publish
    args:
      - option: admin-github-token
        value: SUPER_SECRET_TOKEN
      - option: main-branch
        value: main
      - option: node-version
        value: '14.11'
      - option: use-commit-lint
      - option: use-lerna
  - ingredient: github-actions-generators
    generator: github-actions
    action: dependabot
    args:
      - option: admin-github-token
        value: SUPER_SECRET_TOKEN
      - option: main-branch
        value: main
      - option: node-version
        value: '14.11'
  - ingredient: github-actions-generators
    generator: github-actions
    action: terraform-deploy
    args:
      - option: admin-github-token
        value: SUPER_SECRET_TOKEN
      - option: main-branch
        value: main
```

### Time to cook

```shell
hygen-cook -r path/to/my-api-recipe.yml
```

### CLI Ref

```shell
hygen-cook --help
Options:
      --version             Show version number                        [boolean]
  -r, --recipe              The recipe to cook up            [string] [required]
      --overwriteTemplates  Should overwrite templates?
                                                      [boolean] [default: false]
      --help                Show help                                  [boolean]

```
