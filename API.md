# AnonDocs API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required. For production use, implement authentication via middleware or reverse proxy.

---

## Endpoints

### 1. Anonymize Raw Text (NEW! 🎉)

Anonymize text content directly without uploading a file. Perfect for quick text snippets and API integrations.

**Endpoint**: `POST /api/documents/anonymize-text`

**Content-Type**: `application/json`

**Request Body**:

```json
{
  "text": "Your text content here",
  "provider": "ollama"
}
```

**Fields**:

- `text` (required): String content to anonymize (max 50,000 characters)
- `provider` (optional): LLM provider (`openai` | `anthropic` | `ollama`). Defaults to `DEFAULT_LLM_PROVIDER`

**Response**:

```json
{
  "anonymizedText": "Hi, I am [NAME]. Email me at [EMAIL] or call [PHONE].",
  "piiDetected": {
    "names": ["John Smith"],
    "addresses": [],
    "emails": ["john@example.com"],
    "phoneNumbers": ["(555) 123-4567"],
    "dates": [],
    "organizations": [],
    "other": []
  },
  "originalLength": 72,
  "anonymizedLength": 58,
  "chunksProcessed": 1
}
```

**Status Codes**:

- `200`: Success
- `400`: Invalid input (missing text, empty, or too large)
- `500`: Processing error

**Example**:

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hi, my name is John Smith. Email me at john@example.com or call (555) 123-4567.",
    "provider": "ollama"
  }'
```

**Constraints**:

- Maximum text length: 50,000 characters
- For larger documents, use the file upload endpoint

**See also**: [TEXT_API.md](TEXT_API.md) for detailed guide with more examples

---

### 2. Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-10-13T10:30:00.000Z"
}
```

**Status Codes**:

- `200`: Service is healthy

**Example**:

```bash
curl http://localhost:3000/health
```

---

### 3. Upload Document

Upload a PDF or DOCX document for processing.

**Endpoint**: `POST /api/documents/upload`

**Content-Type**: `multipart/form-data`

**Request Body**:

- `file`: The document file (PDF or DOCX)

**Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "sample-document.pdf",
  "status": "PENDING",
  "createdAt": "2025-10-13T10:30:00.000Z"
}
```

**Status Codes**:

- `201`: Document uploaded successfully
- `400`: No file provided or invalid file type
- `413`: File too large

**Example**:

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/path/to/document.pdf"
```

**Constraints**:

- Maximum file size: 10MB (configurable via `MAX_FILE_SIZE`)
- Allowed types: PDF, DOCX

---

### 4. Start Anonymization

Trigger the anonymization process for an uploaded document.

**Endpoint**: `POST /api/documents/:id/anonymize`

**Path Parameters**:

- `id`: Document ID (UUID)

**Request Body**:

```json
{
  "provider": "openai"
}
```

**Fields**:

- `provider` (optional): LLM provider to use (`openai` | `anthropic`)
  - Default: Value of `DEFAULT_LLM_PROVIDER` environment variable

**Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PROCESSING",
  "message": "Anonymization started"
}
```

**Status Codes**:

- `200`: Anonymization started
- `400`: Document is already being processed
- `404`: Document not found

**Example**:

```bash
curl -X POST http://localhost:3000/api/documents/550e8400-e29b-41d4-a716-446655440000/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'
```

**Notes**:

- Anonymization is processed asynchronously
- Poll the status endpoint to check progress
- Processing time depends on document size and LLM response time

---

### 5. Get Document Status

Retrieve the status and metadata of a document.

**Endpoint**: `GET /api/documents/:id`

**Path Parameters**:

- `id`: Document ID (UUID)

**Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "sample-document.pdf",
  "mimeType": "application/pdf",
  "fileSize": 524288,
  "status": "COMPLETED",
  "createdAt": "2025-10-13T10:30:00.000Z",
  "updatedAt": "2025-10-13T10:35:00.000Z",
  "hasAnonymizedVersion": true
}
```

**Status Field Values**:

- `PENDING`: Uploaded, not yet processed
- `PROCESSING`: Currently being anonymized
- `COMPLETED`: Anonymization finished
- `FAILED`: Error during processing

**Status Codes**:

- `200`: Success
- `404`: Document not found

**Example**:

```bash
curl http://localhost:3000/api/documents/550e8400-e29b-41d4-a716-446655440000
```

---

### 6. Get Anonymized Document

Retrieve the anonymized content of a document.

**Endpoint**: `GET /api/documents/:id/anonymized`

**Path Parameters**:

- `id`: Document ID (UUID)

**Response**:

```json
{
  "originalName": "sample-document.pdf",
  "content": "CONFIDENTIAL MEDICAL RECORD\n\nPatient Information:\nName: [NAME]\nDate of Birth: [DATE]\nAddress: [ADDRESS]\nPhone: [PHONE]\nEmail: [EMAIL]...",
  "llmProvider": "openai",
  "llmModel": "gpt-4",
  "createdAt": "2025-10-13T10:35:00.000Z"
}
```

**Status Codes**:

- `200`: Success
- `404`: Anonymized document not found (check if processing is complete)

**Example**:

```bash
curl http://localhost:3000/api/documents/550e8400-e29b-41d4-a716-446655440000/anonymized
```

**Notes**:

- Only available after document status is `COMPLETED`
- Content is plain text (formatting from original document is not preserved)

---

### 7. List All Documents

Get a list of all uploaded documents.

**Endpoint**: `GET /api/documents`

**Response**:

```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "originalName": "sample-document.pdf",
      "mimeType": "application/pdf",
      "fileSize": 524288,
      "status": "COMPLETED",
      "createdAt": "2025-10-13T10:30:00.000Z",
      "hasAnonymizedVersion": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "originalName": "another-doc.docx",
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "fileSize": 102400,
      "status": "PROCESSING",
      "createdAt": "2025-10-13T11:00:00.000Z",
      "hasAnonymizedVersion": false
    }
  ]
}
```

**Status Codes**:

- `200`: Success

**Example**:

```bash
curl http://localhost:3000/api/documents
```

**Notes**:

- Documents are ordered by creation date (newest first)
- No pagination (consider adding for large datasets)

---

### 8. Delete Document

Delete a document and all associated data.

**Endpoint**: `DELETE /api/documents/:id`

**Path Parameters**:

- `id`: Document ID (UUID)

**Response**:

```json
{
  "message": "Document deleted successfully"
}
```

**Status Codes**:

- `200`: Document deleted
- `404`: Document not found

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/documents/550e8400-e29b-41d4-a716-446655440000
```

**Notes**:

- Deletes the file from filesystem
- Deletes all database records (cascading)
- This operation cannot be undone

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Error Codes

| Code | Description                                 |
| ---- | ------------------------------------------- |
| 400  | Bad Request - Invalid input                 |
| 404  | Not Found - Resource doesn't exist          |
| 413  | Payload Too Large - File exceeds size limit |
| 500  | Internal Server Error - Server-side error   |

### Example Error Response

```json
{
  "error": "Invalid file type",
  "message": "Only PDF and DOCX files are allowed"
}
```

---

## Usage Flow

### Complete Workflow Example

```bash
# 1. Upload a document
RESPONSE=$(curl -s -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf")

# Extract document ID
DOC_ID=$(echo $RESPONSE | jq -r '.id')
echo "Document ID: $DOC_ID"

# 2. Start anonymization
curl -X POST http://localhost:3000/api/documents/$DOC_ID/anonymize \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai"}'

# 3. Check status (poll until COMPLETED)
while true; do
  STATUS=$(curl -s http://localhost:3000/api/documents/$DOC_ID | jq -r '.status')
  echo "Status: $STATUS"

  if [ "$STATUS" == "COMPLETED" ]; then
    break
  elif [ "$STATUS" == "FAILED" ]; then
    echo "Processing failed"
    exit 1
  fi

  sleep 5
done

# 4. Get anonymized content
curl -s http://localhost:3000/api/documents/$DOC_ID/anonymized | jq -r '.content' > anonymized.txt

echo "Anonymized document saved to anonymized.txt"
```

---

## PII Detection

The LLM detects and replaces the following types of PII:

| PII Type       | Replacement        | Examples                        |
| -------------- | ------------------ | ------------------------------- |
| Names          | `[NAME]`           | John Smith, Mary Johnson        |
| Addresses      | `[ADDRESS]`        | 123 Main St, Apt 4B             |
| Emails         | `[EMAIL]`          | user@example.com                |
| Phone Numbers  | `[PHONE]`          | +1 (555) 123-4567               |
| Dates          | `[DATE]`           | 01/15/2024, March 3rd, 1990     |
| Organizations  | `[ORGANIZATION]`   | Acme Corp, City Hospital        |
| Financial Info | `[FINANCIAL_INFO]` | Credit card, bank account       |
| ID Numbers     | `[ID_NUMBER]`      | SSN, passport, driver's license |

---

## Rate Limiting

**Current Implementation**: None

**Recommendation for Production**:

- Implement rate limiting middleware
- Suggested limits:
  - Upload: 10 requests/minute per IP
  - Anonymize: 5 requests/minute per IP
  - Get: 60 requests/minute per IP

---

## Postman Collection

Import the included `postman_collection.json` file into Postman for easy API testing.

**Features**:

- Pre-configured requests
- Automatic variable extraction (document ID)
- Environment variables support

---

## SDKs and Client Libraries

Currently, no official SDKs are available. However, the REST API can be easily integrated with any HTTP client:

### JavaScript/TypeScript

```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('http://localhost:3000/api/documents/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Document ID:', data.id);
```

### Python

```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:3000/api/documents/upload', files=files)

doc_id = response.json()['id']
print(f'Document ID: {doc_id}')
```

### cURL

See examples above for each endpoint.

---

## Webhooks (Future Feature)

Not yet implemented. Consider adding webhook support for:

- Document processing completion
- Processing failures
- Status updates

---

## Versioning

**Current Version**: v1 (implicit)

**Future**: Consider adding versioning to API paths:

- `/api/v1/documents`
- `/api/v2/documents`

---

## Support

For issues or questions:

- GitHub Issues: [Your Repo URL]
- Documentation: README.md
- Security: SECURITY.md

---

## Additional Resources

- [Quick Start Guide](QUICKSTART.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Project Summary](PROJECT_SUMMARY.md)
