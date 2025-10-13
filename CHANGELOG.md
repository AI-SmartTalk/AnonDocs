# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-13

### Added
- Initial release of AnonDocs API
- PDF document parsing and anonymization
- DOCX document parsing and anonymization
- LangChain.js integration for multi-LLM support
- OpenAI GPT-4 integration
- Anthropic Claude integration
- Document chunking strategy for efficient processing
- PII detection for:
  - Personal names
  - Physical addresses
  - Email addresses
  - Phone numbers
  - Dates and birthdates
  - Organizations
  - Financial information (credit cards, account numbers)
  - ID numbers (SSN, passport, etc.)
- REST API endpoints:
  - Document upload
  - Start anonymization
  - Get document status
  - Retrieve anonymized document
  - List all documents
  - Delete document
- PostgreSQL database with Prisma ORM
- Repository pattern for database operations
- Docker Compose setup for development
- Production Docker deployment
- Comprehensive documentation
- Security best practices guide
- Contributing guidelines
- Postman collection for API testing
- Setup scripts for easy installation
- CI/CD pipeline with GitHub Actions

### Security
- File type validation (PDF and DOCX only)
- File size limits
- Helmet.js for HTTP security headers
- CORS configuration
- Environment variable management

## [Unreleased]

### Planned
- Support for additional document formats (TXT, RTF, HTML)
- Batch document processing
- Webhook notifications for completed anonymizations
- Custom PII pattern configuration
- Additional LLM providers (Mistral, Llama, etc.)
- Export anonymized documents in original format
- OpenAPI/Swagger documentation
- Rate limiting middleware
- Authentication and authorization
- Document encryption at rest
- Audit logging
- Performance monitoring

