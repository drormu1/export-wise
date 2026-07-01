# Commit Message Template

Use this format:

```text
<type>(<scope>): <short summary>

Why:
- <reason 1>
- <reason 2>

What:
- <change 1>
- <change 2>

Verification:
- <command/result>
```

## Common Types
- `feat` - new feature
- `fix` - bug fix
- `refactor` - internal improvement without behavior change
- `docs` - documentation only
- `test` - tests only
- `chore` - maintenance tasks

## Example

```text
feat(db): add initial sqlite schema and env config

Why:
- Establish first persistent data layer for POC
- Align implementation with architecture conceptual model

What:
- Add SQLite database configuration via .env
- Create core tables for country, manufacturer, product, and committee decision

Verification:
- npm run typecheck
- npm test
```
