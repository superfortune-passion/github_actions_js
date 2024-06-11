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
- Enforce best practices for versioning and changelog in a passive-aggressive way
- Write Release and Pull Request notes in [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
- Follow [SemVer](https://semver.org/) versioning schema
- Noone likes to write and assemble Release notes, so leave it to automation
- Always leave a final decision to a human in case automation goes crazy
- All actions use only Node.js 12 for speed and stability
- Every action should have an additional manual trigger in case of trouble
- Full compatibility with [nektos/act](https://github.com/nektos/act) for local execution
- Do not try to build one-fits-all soultion, provide customization instead

## Secrets
- `CODECOV_TOKEN` - Token for https://codecov.io/ coverage report
- `GPG_PRIVATE_KEY` - Key to sign commits https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key
- `GPG_PRIVATE_KEY_PASSPHRASE` - Passphrase for GPG private key
- `NPM_TOKEN` - Token for npm publishing https://docs.npmjs.com/creating-and-viewing-access-tokens

## Available workflows