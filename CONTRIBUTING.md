# Contributing to AI Shortcut Companion

Thank you for your interest in contributing to the AI Shortcut Companion! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Workflow](#contributing-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them succeed
- **Be collaborative**: Work together constructively
- **Be professional**: Maintain professional communication standards

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git for version control
- OpenAI API key (for AI features)
- Basic knowledge of React, TypeScript, and PostgreSQL

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-shortcut-companion.git
   cd ai-shortcut-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/shortcuts
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Contributing Workflow

### 1. Create an Issue
Before starting work, create an issue describing:
- The problem you're solving
- Your proposed solution
- Any relevant context or screenshots

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Changes
- Follow the code standards outlined below
- Write tests for new functionality
- Update documentation as needed
- Ensure all existing tests pass

### 4. Commit Changes
Use clear, descriptive commit messages:
```bash
git commit -m "feat: add OAuth callback handler for development

- Implement universal OAuth redirect handler
- Add parameter parsing and color-coded display
- Include copy functionality for developers
- Support all major OAuth providers"
```

### 5. Submit a Pull Request
- Push your branch to your fork
- Create a pull request with a clear description
- Link to the related issue
- Include screenshots for UI changes
- Request review from maintainers

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Maintain strict type safety
- Use proper interfaces and types from `shared/schema.ts`
- Follow existing patterns for consistency

### React Components
- Use functional components with hooks
- Follow the established component structure
- Use proper prop typing
- Implement proper error boundaries

### Styling
- Use Tailwind CSS for styling
- Follow iOS design patterns
- Maintain responsive design principles
- Use shadcn/ui components when possible

### Database
- Use Drizzle ORM for database operations
- Define schemas in `shared/schema.ts`
- Use migrations through `npm run db:push`
- Follow existing naming conventions

### API Design
- Follow RESTful principles
- Use proper HTTP status codes
- Implement consistent error handling
- Document all endpoints

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for utilities and functions
- Create integration tests for API endpoints
- Add component tests for React components
- Test edge cases and error conditions

### Test Structure
```typescript
// Example test file
import { describe, it, expect } from 'vitest';
import { generateShortcut } from '../lib/openai';

describe('generateShortcut', () => {
  it('should generate a valid shortcut from prompt', async () => {
    const result = await generateShortcut('Create a timer');
    expect(result.title).toBeDefined();
    expect(result.actions).toHaveLength.greaterThan(0);
  });
});
```

## Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Document complex logic with inline comments
- Keep comments up-to-date with code changes

### API Documentation
- Update `docs/API.md` for API changes
- Include request/response examples
- Document error codes and handling

### User Documentation
- Update README.md for user-facing changes
- Add setup instructions for new features
- Include troubleshooting information

## Issue Reporting

### Bug Reports
When reporting bugs, include:
- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Full error text and stack traces

### Bug Report Template
```markdown
**Environment**
- OS: macOS 14.1
- Browser: Chrome 120.0
- Node.js: 18.17.0

**Steps to Reproduce**
1. Navigate to /create
2. Click "AI Assistant" tab
3. Enter prompt "create a timer"
4. Click generate

**Expected Behavior**
Should generate a timer shortcut

**Actual Behavior**
Error: "AI service unavailable"

**Error Messages**
```
OpenAI API error: 401 Unauthorized
```

**Screenshots**
[Attach relevant screenshots]
```

## Feature Requests

### Proposing Features
- Check existing issues for similar requests
- Provide clear use cases and benefits
- Consider implementation complexity
- Discuss with maintainers before large changes

### Feature Request Template
```markdown
**Feature Description**
Brief description of the proposed feature

**Use Case**
Who would use this feature and how?

**Proposed Implementation**
High-level approach for implementation

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

## Development Guidelines

### Architecture Decisions
- Follow the existing architecture patterns
- Prefer composition over inheritance
- Use dependency injection for testability
- Maintain separation of concerns

### Performance Considerations
- Optimize for mobile devices
- Use lazy loading for large components
- Implement proper caching strategies
- Monitor bundle size and loading times

### Security Guidelines
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP security guidelines

### Accessibility
- Follow WCAG 2.1 AA standards
- Test with screen readers
- Ensure keyboard navigation works
- Use semantic HTML elements

## Review Process

### Pull Request Reviews
Pull requests require:
- At least one approving review from a maintainer
- All CI checks passing
- No merge conflicts
- Updated documentation (if applicable)

### Review Criteria
Reviewers will check for:
- Code quality and consistency
- Test coverage
- Performance implications
- Security considerations
- Documentation updates

## Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule
- **Patch releases**: As needed for critical fixes
- **Minor releases**: Monthly feature releases
- **Major releases**: Quarterly with breaking changes

## Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Email**: support@oneseco.com for private matters

### Documentation Resources
- **API Documentation**: `docs/API.md`
- **Architecture Guide**: `README.md#architecture`
- **Deployment Guide**: `CLOUDFLARE_SETUP.md`

## Recognition

### Contributors
All contributors are recognized in:
- GitHub contributors page
- CHANGELOG.md acknowledgments
- Annual contributor highlights

### Contribution Types
We value all types of contributions:
- Code contributions
- Documentation improvements
- Bug reports and testing
- Feature suggestions
- Community support

Thank you for contributing to the AI Shortcut Companion! Your efforts help make iOS automation more accessible and powerful for everyone.