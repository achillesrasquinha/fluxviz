### Environment Variables

| Name                                  | Type                                  | Description |
|---------------------------------------|---------------------------------------|-------------|
| `fluxviz_ACCEPT_ALL_DIALOGS`       | `boolean`                             | Confirm for all dialogs.
| `fluxviz_DRY_RUN`                  | `boolean`                             | Perform a dry-run, avoid updating packages.
| `fluxviz_UPDATE_LATEST`            | `boolean`                             | Update all packages to latest.
| `fluxviz_DISPLAY_FORMAT`           | `string` (table, tree, json, yaml)    | Display packages format.
| `fluxviz_DISPLAY_ALL_PACKAGES`     | `boolean`                             | List all packages.
| `fluxviz_UPDATE_PIP`               | `boolean`                             | Update pip. 
| `fluxviz_INTERACTIVE`              | `boolean`                             | Interactive Mode.
| `fluxviz_GIT_USERNAME`             | `string`                              | Git Username
| `fluxviz_GIT_EMAIL`                | `string`                              | Git Email
| `fluxviz_GITHUB_ACCESS_TOKEN`      | `string`                              | GitHub Access Token
| `fluxviz_GITHUB_REPONAME`          | `string`                              | Target GitHub Repository Name
| `fluxviz_GITHUB_USERNAME`          | `string`                              | Target GitHub Username
| `fluxviz_TARGET_BRANCH`            | `string`                              | Target Branch
| `fluxviz_JOBS`                     | `integer`                             | Number of Jobs to be used.
| `fluxviz_USER_ONLY`                | `boolean`                             | Install to the Python user install directory for environment variables and user configuration.
| `fluxviz_NO_INCLUDED_REQUIREMENTS` | `boolean`                             | Avoid updating included requirements.
| `fluxviz_NO_CACHE`                 | `boolean`                             | Avoid fetching latest updates from PyPI server.
| `fluxviz_FORCE`                    | `boolean`                             | Force search for files within a project.
| `fluxviz_NO_COLOR`                 | `boolean`                             | Avoid colored output.
| `fluxviz_OUTPUT_FILE`              | `string`                              | Output File.