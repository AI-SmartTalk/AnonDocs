# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of AnonDocs seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [your-email@example.com]

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

## Security Best Practices

When using AnonDocs:

1. **API Keys**: Never commit API keys to version control. Use environment variables.

2. **Database**: 
   - Use strong passwords for your PostgreSQL database
   - Restrict database access to only the API server
   - Enable SSL/TLS for database connections in production

3. **File Uploads**:
   - The API validates file types (PDF, DOCX only)
   - Configure appropriate file size limits
   - Store uploaded files outside the web root
   - Consider virus scanning uploaded files

4. **Network Security**:
   - Use HTTPS in production (reverse proxy like nginx)
   - Configure CORS appropriately for your use case
   - Implement rate limiting (not included by default)

5. **Data Privacy**:
   - Anonymized documents may still contain sensitive information
   - Review anonymized output before sharing
   - Implement appropriate access controls
   - Consider data retention policies

6. **Updates**:
   - Keep dependencies up to date
   - Monitor for security advisories
   - Apply security patches promptly

## Known Limitations

1. **LLM Reliability**: The anonymization quality depends on the LLM provider. False negatives (missed PII) are possible.

2. **Document Formats**: Complex document formatting may not be fully preserved.

3. **Rate Limiting**: Not implemented by default. Consider adding rate limiting in production.

4. **Authentication**: No built-in authentication. Implement at the reverse proxy level or add middleware.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.

