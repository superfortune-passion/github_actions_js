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

Yes, why not! Even small projects nowadays have at least simple CI/CD to enforce best practices
or just to avoid boring release management. Thanks to [GitHub Actions](https://github.com/features/actions),
it is super easy to kickstart an automation for a new project in minutes.

However, every project CI/CD has to be set up and updated separately,
even though they have a lot in common. So, instead of making our life easier,
CI/CD adds a new folder in a project to keep an eye on.

But imagine, what if we could...

- manage our GitHub Actions the same way we manage npm dependencies
- adapt CI/CD for different projects to our needs and still keep them in sync
- share the best CI/CD practices and collaborate to raise the bar even higher

And finally, what if we could add these best practices for a new project with a single command.

## Let's start today
- CI/CD for `Node.js` projects [installation guide](./nodejs_workflows/README.md)
- CI/CD for `Python` projects [installation guide](./python_workflows_py/README.md)
- CI/CD for `Rust` projects by [@actions-rs](https://github.com/actions-rs/example)
- CI/CD for `Go` projects by [@mvdan](https://github.com/mvdan/github-actions-golang)
- CI/CD for `Julia` projects by [@julia-actions](https://github.com/julia-actions/Example.jl)
- CI/CD for `Terraform` projects by [@dflook](https://github.com/dflook/terraform-github-actions)
- Or provide path to any GitHub repository to clone their workflows (run `ghactions`, then select `From GitHub URL`)
- Or even clone workflows from your local path (run `ghactions`, then select `From directory`)

## Advanced usage
