# 🤝 Contributing to EthioLegalAI

Thank you for your interest in contributing to EthioLegalAI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ethiolegal-ai.git
   cd ethiolegal-ai
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ethiolegal-ai.git
   ```
4. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```
5. **Set up environment** following [SETUP.md](./docs/SETUP.md)

### Finding Issues to Work On

- Check [Issues](https://github.com/yourusername/ethiolegal-ai/issues) labeled:
  - `good first issue` - Great for newcomers
  - `help wanted` - Community contributions welcome
  - `bug` - Bug fixes needed
  - `enhancement` - New features
  - `documentation` - Documentation improvements

- Comment on the issue to let others know you're working on it
- Wait for maintainer approval before starting work

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Manual testing
npm run dev
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add contract risk scoring algorithm"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Link related issues
5. Submit the PR

---

## Coding Standards

### JavaScript/TypeScript Style

We follow **Airbnb JavaScript Style Guide** with some modifications.

#### General Rules

```javascript
// ✅ Good
const getUserData = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    throw error;
  }
};

// ❌ Bad
const getUserData = async (userId) => {
  const user = await User.findById(userId)
  return user
}
```

#### Key Principles

1. **Use const/let, never var**
   ```javascript
   const API_URL = 'https://api.example.com';
   let counter = 0;
   ```

2. **Prefer arrow functions**
   ```javascript
   const add = (a, b) => a + b;
   ```

3. **Use async/await over promises**
   ```javascript
   // ✅ Good
   const data = await fetchData();
   
   // ❌ Avoid
   fetchData().then(data => { ... });
   ```

4. **Destructure objects**
   ```javascript
   const { name, email } = user;
   ```

5. **Use template literals**
   ```javascript
   const message = `Hello, ${name}!`;
   ```

### Backend Conventions

#### File Structure
```javascript
// controllers/exampleController.js
const ExampleService = require('../services/exampleService');

/**
 * Get example by ID
 * @route GET /api/examples/:id
 */
const getExample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const example = await ExampleService.findById(id);
    
    res.json({
      success: true,
      data: { example }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExample };
```

#### Error Handling
```javascript
// Use custom error classes
throw new ValidationError('Invalid email format');
throw new NotFoundError('User not found');
throw new UnauthorizedError('Invalid credentials');
```

#### Database Queries
```javascript
// ✅ Good - Use lean() for read-only queries
const users = await User.find({ isActive: true })
  .select('name email')
  .lean();

// ✅ Good - Use indexes
const user = await User.findOne({ email }).lean();

// ❌ Bad - Loading unnecessary data
const users = await User.find();
```

### Frontend Conventions

#### Component Structure
```typescript
// components/ExampleComponent.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ExampleProps {
  userId: string;
  onSuccess?: () => void;
}

export const ExampleComponent: React.FC<ExampleProps> = ({ 
  userId, 
  onSuccess 
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="example-component">
      {/* Component content */}
    </div>
  );
};
```

#### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

#### CSS/Tailwind
```tsx
// ✅ Good - Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Title</h2>
</div>

// ✅ Good - Group related classes
<button className="
  px-4 py-2 
  bg-blue-600 hover:bg-blue-700 
  text-white font-medium 
  rounded-lg shadow-sm
  transition-colors duration-200
">
  Click Me
</button>
```

---

## Commit Guidelines

We follow **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(ai): add contract risk scoring algorithm"

# Bug fix
git commit -m "fix(auth): resolve token refresh race condition"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Breaking change
git commit -m "feat(api)!: change response format for /api/chats

BREAKING CHANGE: Response now includes pagination metadata"
```

### Commit Message Rules

1. **Use imperative mood**: "add" not "added" or "adds"
2. **Keep subject line under 72 characters**
3. **Capitalize subject line**
4. **No period at the end of subject**
5. **Separate subject from body with blank line**
6. **Wrap body at 72 characters**
7. **Explain what and why, not how**

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console.log() or debugger statements
- [ ] Branch is up to date with main

### PR Title Format

Follow commit message format:
```
feat(scope): add new feature
fix(scope): resolve bug
docs: update README
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainer reviews code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

### After Merge

- Delete your feature branch
- Update your local repository:
  ```bash
  git checkout main
  git pull upstream main
  ```

---

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage
```

### Writing Tests

#### Backend Example
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

#### Frontend Example
```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Documentation

### Code Documentation

#### JSDoc Comments
```javascript
/**
 * Calculate contract risk score based on analysis
 * @param {Object} analysis - Contract analysis object
 * @param {Array<Object>} analysis.risks - Array of identified risks
 * @param {number} analysis.aiConfidence - AI confidence score (0-100)
 * @returns {number} Risk score (0-100)
 * @throws {ValidationError} If analysis is invalid
 */
const calculateRiskScore = (analysis) => {
  // Implementation
};
```

#### TypeScript Types
```typescript
/**
 * User authentication credentials
 */
interface LoginCredentials {
  /** User email address */
  email: string;
  /** User password (min 6 characters) */
  password: string;
}
```

### README Updates

When adding new features, update:
- Main README.md
- docs/API.md (if API changes)
- docs/ARCHITECTURE.md (if architecture changes)
- docs/SETUP.md (if setup changes)

---

## Questions?

- **General Questions**: [GitHub Discussions](https://github.com/yourusername/ethiolegal-ai/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/ethiolegal-ai/issues)
- **Security Issues**: Email security@ethiolegal-ai.com
- **Other**: Email contribute@ethiolegal-ai.com

---

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Project website (coming soon)

Thank you for contributing to EthioLegalAI! 🙏
