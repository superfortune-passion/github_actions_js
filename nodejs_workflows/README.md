# GitHub Actions Manager

- [GitHub Actions Manager](#github-actions-manager)
  - [Installation](#installation)
  - [How to use](#how-to-use)
  - [Zen](#zen)
  - [Secrets](#secrets)
  - [Available workflows](#available-workflows)
    - [Run style checks and unit tests](#run-style-checks-and-unit-tests)
    - [Update Pull Request labels](#update-pull-request-labels)
    - [Update Release from Pull Request](#update-release-from-pull-request)
    - [Create Release Pull Request](#create-release-pull-request)
    - [Publish to NPM](#publish-to-npm)
    - [Create Release draft](#create-release-draft)

## Installation

```bash
# install globally or locally
npm i -g github-actions
# npm i --save-dev github-actions

# run interactive manager
# in a GitHub repository root
ghactions -i node
```

Index: [index.yml](./index.yml)

## How to use
- Set 'github-actions-managed' to false on manual edit to prevent step overwrite on update
- User-added steps survive update as well
- Deleted steps are restored on update, so make them empty instead of removing

## Zen