# Contributing to Infinite Engine (IE)

Thank you for considering contributing to the Infinite Engine project! We welcome contributions that help improve the codebase, add new features, fix bugs, or enhance documentation. Please read the following guidelines to ensure a smooth contribution process.

## Table of Contents
- [How to Contribute](#how-to-contribute)
- [Code of Conduct](#code-of-conduct)
- [Reporting Issues](#reporting-issues)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [License](#license)

## How to Contribute

### 1. Fork the Repository
Start by [forking the repository](https://github.com/SterlyDolce/Infinite-Engine) to your GitHub account. 

### 2. Clone the Repository
Clone your forked repository to your local machine:
```bash
git clone https://github.com/SterlyDolce/Infinite-Engine.git
```

### 3. Create a Branch
Create a new branch for your feature, bug fix, or documentation update:
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
Make your changes in the appropriate files. Be sure to follow the coding standards outlined below.

### 5. Commit Your Changes
Commit your changes with a descriptive commit message following the [Commit Messages](#commit-messages) guidelines.

### 6. Push to GitHub
Push your branch to your forked repository:
```bash
git push origin feature/your-feature-name
```

### 7. Submit a Pull Request
Submit a pull request (PR) to the `main` branch of the original repository. Provide a clear description of your changes and link any related issues.

## Code of Conduct
Please note that this project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Reporting Issues
If you encounter a bug or have a feature request, please open an issue on the GitHub repository. Be as detailed as possible and provide any relevant screenshots or logs.

## Development Workflow

### Set Up Your Environment
1. Clone the repository as mentioned above.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Make sure to update your branch with the latest changes from `main`:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

### Testing
- Ensure all tests pass before submitting a pull request. Add new tests if necessary.
- Run the test suite with:
  ```bash
  npm test
  ```

### Documentation
- Update documentation in the `docs` directory if your changes affect it.
- Make sure code is properly commented, especially for new features.

## Coding Standards

### General
- Follow consistent naming conventions: use camelCase for variables and functions, PascalCase for classes, and UPPER_CASE for constants.
- Ensure all code is clean, readable, and well-documented.
- Avoid global variables and use namespaces where necessary.

### Specific Guidelines for Loom
- Ensure Loom scripts are clear and follow the syntax conventions established in existing code.
- Properly handle events and ensure they are documented within the Loom script.

### Formatting
- Use 2 spaces for indentation.
- Run your code through a linter before committing. We use [ESLint](https://eslint.org/):
  ```bash
  npm run lint
  ```

## Commit Messages
- Write clear, concise commit messages.
- Use the imperative mood in the subject line (e.g., "Fix bug" or "Add feature").
- Limit the subject line to 50 characters.
- Reference issues and pull requests when relevant (e.g., "Fixes #123").

## Pull Request Process
1. Make sure your branch is up-to-date with the `main` branch.
2. Ensure your code passes all tests and lint checks.
3. Open a pull request with a clear title and description.
4. Be prepared to discuss and iterate on your changes if reviewers request modifications.

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
