# Contributing to MERN Blog Platform

Thank you for your interest in contributing to our MERN stack blogging platform! We welcome contributions from the community.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them learn
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone has different experience levels

## Getting Started

### Prerequisites
- Node.js (>=18.0.0)
- MongoDB (local or Atlas)
- Git
- Cloudinary account (for image uploads)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mern-blog-platform.git
   cd mern-blog-platform
   ```

2. **Set up the development environment**
   ```bash
   # Install dependencies
   npm install
   cd server && npm install
   cd ../client && npm install
   
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Configure environment variables**
   - Update `server/.env` with your MongoDB URI, JWT secret, and Cloudinary credentials
   - Update `client/.env` with your API URL

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## Development Process

### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Message Format
We follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(auth): add password reset functionality
fix(blog): resolve image upload issue
docs(readme): update installation instructions
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   # Run all tests
   npm run test:all
   
   # Run linting
   npm run lint
   
   # Check formatting
   npm run format:check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request on GitHub.

### PR Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Coding Standards

### JavaScript/Node.js (Backend)
- Use ES6+ features when appropriate
- Follow Airbnb JavaScript style guide
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Handle errors properly with try-catch blocks
- Use async/await instead of callbacks

### React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use meaningful component and prop names
- Implement proper error boundaries
- Use TypeScript when possible
- Follow the established folder structure

### Database
- Use proper Mongoose schemas with validation
- Implement proper indexing
- Follow MongoDB naming conventions
- Use transactions when needed

### API Design
- Follow RESTful principles
- Use proper HTTP status codes
- Implement proper error responses
- Add input validation
- Use consistent response formats

## Testing

### Writing Tests
- Write unit tests for all new functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for good test coverage (>80%)

### Running Tests
```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test

# All tests
npm run test:all
```

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Test implementation
  });
});
```

## Issue Reporting

### Before Creating an Issue
1. Check if the issue already exists
2. Make sure you're using the latest version
3. Try to reproduce the issue

### Creating a Good Issue
Include:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots/logs if applicable

### Issue Templates

#### Bug Report
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows, macOS, Linux]
- Node Version: [e.g. 18.17.0]
- Browser: [e.g. Chrome, Firefox]
- Version: [e.g. 1.0.0]
```

#### Feature Request
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of alternative solutions or features.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Code Review Process

### For Reviewers
- Be constructive and respectful
- Focus on the code, not the person
- Explain the "why" behind suggestions
- Approve when ready, request changes when needed

### For Contributors
- Respond to feedback promptly
- Ask questions if feedback is unclear
- Make requested changes
- Mark conversations as resolved when addressed

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Run all tests
5. Create GitHub release
6. Deploy to production

## Getting Help

- **Documentation**: Check the README and docs folder
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers directly for sensitive issues

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to make this project better! 🚀
