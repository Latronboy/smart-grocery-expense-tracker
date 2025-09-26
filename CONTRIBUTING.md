# Contributing Guide

Thank you for your interest in contributing to the Smart Grocery List & Expense Tracker! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git
- Basic knowledge of JavaScript, React, and Node.js

### Development Setup

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/Expense.git
   cd Expense
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/Expense.git
   ```

4. **Install Dependencies**
   ```bash
   npm install
   cd mobile && npm install && cd ..
   ```

5. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Making Changes

- Make your changes in a feature branch
- Follow the coding standards (see below)
- Test your changes thoroughly
- Update documentation if needed

### 2. Testing

Before submitting a pull request:

```bash
# Test the server
npm run dev

# Test the web interface
# Open http://localhost:3000

# Test the mobile app (if applicable)
cd mobile
npx expo start
```

### 3. Committing Changes

Use clear, descriptive commit messages:

```bash
# Good examples
git commit -m "Add user profile editing functionality"
git commit -m "Fix mobile app login issue on Android"
git commit -m "Update README with new installation steps"

# Bad examples
git commit -m "fix"
git commit -m "update stuff"
git commit -m "WIP"
```

### 4. Submitting a Pull Request

1. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template
   - Request review from maintainers

## Coding Standards

### JavaScript/Node.js

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **const** and **let** instead of **var**
- Use **arrow functions** when appropriate
- Add **JSDoc comments** for functions

```javascript
/**
 * Authenticates a user with username and password
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {Promise<Object>} User object with token
 */
const authenticateUser = async (username, password) => {
  // Implementation
};
```

### React Components

- Use **functional components** with hooks
- Use **PascalCase** for component names
- Use **camelCase** for props and variables
- Add **PropTypes** for type checking

```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LoginScreen = ({ navigation, onLogin }) => {
  const [username, setUsername] = useState('');
  
  // Component logic
  
  return (
    <View>
      {/* JSX */}
    </View>
  );
};

LoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  onLogin: PropTypes.func.isRequired
};

export default LoginScreen;
```

### File Organization

```
src/
├── components/          # Reusable components
├── screens/            # Screen components
├── services/           # API services
├── utils/              # Utility functions
├── hooks/              # Custom hooks
└── constants/          # App constants
```

## Project Structure

### Backend (server.js)
- API routes and middleware
- Authentication logic
- Data validation
- Error handling

### Frontend (script.js, index.html)
- React components
- State management
- API integration
- UI/UX logic

### Mobile (mobile/)
- React Native screens
- Navigation
- Platform-specific code
- Mobile-specific features

## Types of Contributions

### 🐛 Bug Fixes
- Fix existing issues
- Improve error handling
- Resolve compatibility problems

### ✨ New Features
- Add new functionality
- Enhance existing features
- Improve user experience

### 📚 Documentation
- Update README files
- Add code comments
- Create tutorials
- Improve installation guides

### 🎨 UI/UX Improvements
- Enhance visual design
- Improve user interface
- Add animations
- Responsive design fixes

### 🔧 Code Quality
- Refactor code
- Improve performance
- Add tests
- Fix linting issues

## Issue Guidelines

### Before Creating an Issue
1. Check existing issues
2. Search for similar problems
3. Try to reproduce the issue
4. Gather relevant information

### Issue Template
```markdown
## Bug Report / Feature Request

**Description**
A clear description of the issue or feature request.

**Steps to Reproduce** (for bugs)
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 10, macOS 12, Ubuntu 20.04]
- Node.js version: [e.g., 16.14.0]
- Browser: [e.g., Chrome 91, Firefox 89]
- Mobile: [e.g., iOS 15, Android 11]

**Additional Context**
Any other relevant information.
```

## Pull Request Guidelines

### PR Template
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented code
```

### Review Process
1. **Automated Checks**
   - Code formatting
   - Linting
   - Basic functionality

2. **Manual Review**
   - Code quality
   - Security considerations
   - Performance impact
   - User experience

3. **Testing**
   - Functionality testing
   - Cross-platform testing
   - Edge case testing

## Code Review Guidelines

### For Reviewers
- Be constructive and helpful
- Focus on code quality, not personal preferences
- Explain the reasoning behind suggestions
- Approve when ready

### For Authors
- Respond to feedback promptly
- Make requested changes
- Ask questions if unclear
- Be open to suggestions

## Release Process

### Version Numbering
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features
- **Patch** (0.0.1): Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Tagged in Git

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Use welcoming language
- Accept constructive criticism
- Focus on what's best for the community

### Getting Help
- Check documentation first
- Search existing issues
- Ask questions in discussions
- Be specific about problems

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

If you have questions about contributing:
- Open a discussion
- Create an issue
- Contact maintainers directly

Thank you for contributing! 🎉