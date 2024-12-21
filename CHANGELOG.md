# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Show workflow titles instead of filenames for installed workflows

## [0.9.0]
### Added
- Workflows for [Rust](https://github.com/actions-rs/example) projects
- Workflows for [Go](https://github.com/mvdan/github-actions-golang) projects
- Workflows for [Terraform](https://github.com/dflook/terraform-github-actions) projects
- Workflows for [Julia](https://github.com/julia-actions/Example.jl) projects
- Multiple jobs in one workflow support
- Autocomplete repository root GitHub URLs with `/tree/master/.github/workflows`

### Fixed
- Suggested `--force` updates were not showing step/job names correctly
- Stored indexes are trimmed to the last 20 used
- Steps with the same data are considered the same
- Steps diff for added/removed steps was incorrect
- Accept `*.yaml` files as workflows
- Mark manually added items in interactive mode

## [0.8.0]
### Added
- Support `file:///` protocol for index URL
- Support any GitHub repositories as index
- Interactive mode allows to choose GitHub repo
- Interactive mode allows to choose local directory