# GitHub Actions Manager

[![npm](https://img.shields.io/npm/v/github-actions?color=blue&label=github-actions&style=flat-square)](https://www.npmjs.com/package/github-actions)
![Codecov](https://img.shields.io/codecov/c/github/vemel/github_actions_js?style=flat-square)
![npm type definitions](https://img.shields.io/npm/types/github-actions?style=flat-square)

> -- Who will test our unit tests?
>
> -- I have no idea 🤨
>
> -- Okay, who will automate our automation?
>
> -- GitHub Actions Manager 😎

Kickstart automation in one command.
Clone, update and share [GitHub Actions](https://github.com/features/actions) workflows and best practices.

Comes with awesome packs for
[Node.js](./workflows/README.md),
[Python](./workflows_py/README.md),
[Go](https://github.com/mvdan/github-actions-golang),
[Terraform](https://github.com/dflook/terraform-github-actions),
[Julia](https://github.com/julia-actions/Example.jl),
and [Rust](https://github.com/actions-rs/example) projects.

- [GitHub Actions Manager](#github-actions-manager)
  - [Basic usage](#basic-usage)
  - [Automated automation?](#automated-automation)
  - [Let's start today](#lets-start-today)
  - [Advanced usage](#advanced-usage)
    - [Simple, no-force update](#simple-no-force-update)
    - [Force update](#force-update)
    - [CLI arguments](#cli-arguments)
  - [Version 1.0.0 checklist](#version-100-checklist)
  - [Versioning](#versioning)
  - [Latest changes](#latest-changes)

<img src="ghactions.png" alt="GitHub Actions Manager" width="400"/>

## Basic usage

```bash
# install globally or locally
npm i -g github-actions
# npm i --save-dev github-actions

# run interactive manager
# in a GitHub repository root
ghactions

# or check how to run non-interactively
ghactions --help
```

## Automated automation?
