# Contributing to AnonDocs

Thank you for your interest in contributing to AnonDocs! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/yourusername/anondocs-api.git
cd anondocs-api
```

3. Install dependencies:
```bash
npm install
```

4. Set up your environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start PostgreSQL (using Docker):
```bash
docker-compose up -d
```

6. Run migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```

7. Start the development server:
```bash
npm run dev
```

## Code Guidelines

### Architecture Principles

- **Repository Pattern**: All database operations must go through repository classes
- **Service Layer**: Business logic should be in service classes
- **Clean Code**: Write readable, maintainable code with clear naming

### Code Style

- Use TypeScript strict mode
- Follow existing patterns in the codebase
- Use async/await instead of promises
- Add proper error handling
- Document complex logic with comments

### File Structure

```
src/
├── controllers/       # HTTP request handlers
├── services/         # Business logic
├── repositories/     # Database operations (Prisma)
├── routes/          # API route definitions
├── middleware/      # Express middleware
└── utils/           # Utility functions
```

## Adding New Features

### Adding a New LLM Provider

1. Create a new integration in `src/services/llm.service.ts`
2. Add the provider to the `LLMProvider` type
3. Initialize the model in `initializeModels()`
4. Update documentation

Example:
```typescript
import { ChatMistral } from '@langchain/mistral';

// In initializeModels()
if (process.env.MISTRAL_API_KEY) {
  this.models.set(
    'mistral',
    new ChatMistral({
      apiKey: process.env.MISTRAL_API_KEY,
      modelName: process.env.MISTRAL_MODEL || 'mistral-large-latest',
      temperature: 0,
    })
  );
}
```

### Adding Document Format Support

1. Add parser logic in `src/services/parser.service.ts`
2. Update MIME type validation in `src/middleware/upload.middleware.ts`
3. Add necessary dependencies to `package.json`
4. Update documentation

## Testing

Before submitting a PR:

1. Test your changes locally
2. Ensure no TypeScript errors: `npm run build`
3. Test API endpoints with curl or Postman
4. Verify database migrations work correctly

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Commit with clear messages: `git commit -m "Add feature: description"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request with:
   - Clear description of changes
   - Why the change is needed
   - How to test it

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] No TypeScript errors
- [ ] Documentation updated (README, comments)
- [ ] Tested locally
- [ ] No breaking changes (or clearly documented)

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Error messages/logs

## Feature Requests

We welcome feature requests! Please:

- Check existing issues first
- Provide clear use case
- Explain expected behavior
- Suggest implementation if possible

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

## Questions?

Feel free to open an issue for questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

