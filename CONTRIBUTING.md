# Contributing to LifeLog

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from commit messages).

Examples:

- `frontend`
- `backend`
- `shared`

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Maximum 50 characters

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.

## Examples

```
feat(frontend): add user authentication component

Add login and registration forms with validation
using React Hook Form and Yup schema validation.

Closes #123
```

```
fix(backend): resolve database connection timeout

Increase connection timeout from 5s to 30s to handle
slow network conditions in production environment.

BREAKING CHANGE: Database configuration now requires
timeout parameter in milliseconds instead of seconds.
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Commit with conventional message format
6. Push to your branch
7. Create a Pull Request

## Pre-commit Hooks

This project uses Husky and lint-staged to run the following checks before each commit:

- ESLint with auto-fix for JavaScript/TypeScript files
- Prettier formatting for all supported files
- Commit message format validation

If any of these checks fail, the commit will be rejected. Fix the issues and try committing again.
