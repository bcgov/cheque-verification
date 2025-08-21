# Contributing to Cheque Verification

## How to Contribute

Government employees, public and members of the private sector are encouraged to contribute to the repository by forking and submitting a pull request.

(If you are new to GitHub, you might start with a [basic tutorial](https://help.github.com/articles/set-up-git) and check out a [more detailed guide to pull requests](https://help.github.com/articles/using-pull-requests/).)

Pull requests will be evaluated by the repository guardians on a schedule and if deemed beneficial will be committed to the main branch.

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies:

   ```bash
   # Frontend
   cd frontend && npm install

   # Backend
   cd backend && npm install

   # API
   cd api && npm install
   ```

4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes and test them
6. Run the test suite to ensure nothing is broken:
   ```bash
   npm test
   ```
7. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) format
8. Push to your fork and submit a pull request

## Pull Request Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/) format for PR titles (e.g., `feat: add cheque validation endpoint`, `fix: resolve CORS issue`)
- Provide a clear description of the changes in the PR body
- Include tests for new functionality
- Ensure all tests pass
- Follow the existing code style and formatting
- Update documentation as needed

## Code Style

- Use 2 spaces for indentation
- Remove all trailing whitespace
- Use LF (Unix-style) line endings
- Follow TypeScript best practices
- Write clear, self-documenting code
- Include JSDoc comments for public APIs

## Testing

- Write unit tests for new functionality
- Maintain or improve test coverage
- Use the AAA pattern (Arrange-Act-Assert) for tests
- Ensure all tests pass before submitting

## Security

- Never commit credentials or secrets
- Follow BC Government security standards
- Validate all user inputs
- Use parameterized queries for database operations

## License

All contributors retain the original copyright to their stuff, but by contributing to this project, you grant a world-wide, royalty-free, perpetual, irrevocable, non-exclusive, transferable license to all users under the terms of the [Apache License 2.0](LICENSE) under which this project is distributed.
