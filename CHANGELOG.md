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

### Fixed
- Custom indexes were not usable in interactive mode
- Temporary downloads clean up on error
- Added workflows were not listed as changed
- Steps are discovered by `id`, `name`, then `uses`
- Ref replace can be applied to any GitHub URLs

## [0.7.0]
### Added
- `--clean` CLI flag to create workflows without `github-actions-script` marker
- `--diff` and `--force` flags can be set during interactive run
- Indexes can list env variables used in workflows

### Fixed
- Workflows are downloaded in parallel
- Avoid loading resources two times in interactive mode
- Check mode shows a correct command to apply update
- Workflows were created with non-managed steps sometimes
- `job.*.steps.[].with.github-actions-script` moved to the first position to be more visible
- Show non-managed steps diff correctly
- Support `--list` flag in interactive mode

## [0.6.2]
### Fixed
- Incorrect Javascript imports

## [0.6.1]
### Fixed
- Comment lines are not trimmed on update

## [0.6.0]
### Added
- Interactive run when no `--names` are specified
- Index can be selected with a short id: `-i node`, `-i python`
- Index `documentation` field that contains a documentation URL
- Index `workflows.[].secrets` field with a list of secrets used in workflow

### Changed
- `--names existing` replaced with `--names installed`
- Workflow comment is populated from description in index

### Fixed
- Handle invalid user YAML in workflow

## [0.6.0-rc.1]
### Added
- Interactive run when no `--names` are specified
- Index can be selected with a short id: `-i node`, `-i python`
- Index `documentation` field that contains a documentation URL
- Index `workflows.[].secrets` field with a list of secrets used in workflow

### Changed
- `--names existing` replaced with `--names installed`
- Workflow comment is populated from description in index

### Fixed
- Handle invalid YAML error in workflow

## [0.5.0]
### Added
- `--path` CLI argument to specify local path to workflows
- `--update` CLI argument to create/update workflows

### Changed
- Sync `jobs.*.strategy` from remote with `--force`
- Logs cleaned up
- `--update` CLI argument renamed to `--names`
- `--diff` is shown for each change separately

### Fixed
- `--version` reports a correct version
- `--diff` shows changes between local and updated version instead of remote
- Removed extra empty line in renedered workflows
- Support basicauth in index URL

## [0.4.0]
### Added
- `--version` CLI flag to show package version
- `--diff` CLI flag to output diff on check/update
