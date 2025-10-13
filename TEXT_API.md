# Raw Text Anonymization API

Quick guide for anonymizing text content directly without file uploads.

## 🚀 Quick Start

### Simple Example

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hi, I am John Smith. Email me at john@example.com or call (555) 123-4567."
  }'
```

### With Provider Selection

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Contact Sarah at sarah.jones@company.com",
    "provider": "ollama"
  }'
```

---

## 📋 API Reference

### Endpoint

**POST** `/api/documents/anonymize-text`

### Request Body

```json
{
  "text": "Your text content here",
  "provider": "ollama" // optional: openai | anthropic | ollama
}
```

**Fields:**

- `text` (required): String content to anonymize (max 50,000 characters)
- `provider` (optional): LLM provider to use. Defaults to `DEFAULT_LLM_PROVIDER` from .env

### Response

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

**Response Fields:**

- `anonymizedText`: The anonymized content
- `piiDetected`: All PII found in the text
- `originalLength`: Original text character count
- `anonymizedLength`: Anonymized text character count
- `chunksProcessed`: Number of chunks processed

---

## 💡 Examples

### Example 1: Basic Usage

**Request:**

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "John Doe lives at 123 Main Street, NYC. Call him at 555-1234."
  }'
```

**Response:**

```json
{
  "anonymizedText": "[NAME] lives at [ADDRESS]. Call him at [PHONE].",
  "piiDetected": {
    "names": ["John Doe"],
    "addresses": ["123 Main Street, NYC"],
    "emails": [],
    "phoneNumbers": ["555-1234"],
    "dates": [],
    "organizations": [],
    "other": []
  },
  "originalLength": 60,
  "anonymizedLength": 52,
  "chunksProcessed": 1
}
```

### Example 2: Medical Record

**Request:**

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient: Sarah Johnson\nDOB: 03/15/1985\nSSN: 123-45-6789\nAddress: 456 Oak Ave\nEmail: sarah.j@email.com\n\nPatient Sarah Johnson visited on March 10, 2024.",
    "provider": "ollama"
  }'
```

**Response:**

```json
{
  "anonymizedText": "Patient: [NAME]\nDOB: [DATE]\nSSN: [ID_NUMBER]\nAddress: [ADDRESS]\nEmail: [EMAIL]\n\nPatient [NAME] visited on [DATE].",
  "piiDetected": {
    "names": ["Sarah Johnson"],
    "addresses": ["456 Oak Ave"],
    "emails": ["sarah.j@email.com"],
    "phoneNumbers": [],
    "dates": ["03/15/1985", "March 10, 2024"],
    "organizations": [],
    "other": ["123-45-6789"]
  },
  "originalLength": 156,
  "anonymizedLength": 112,
  "chunksProcessed": 1
}
```

### Example 3: Choose Provider

**Use Ollama (local, free):**

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here", "provider": "ollama"}'
```

**Use OpenAI (cloud, paid):**

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here", "provider": "openai"}'
```

**Use Anthropic (cloud, paid):**

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here", "provider": "anthropic"}'
```

---

## 🔄 JavaScript/TypeScript Example

```typescript
async function anonymizeText(text: string, provider?: string) {
  const response = await fetch('http://localhost:3000/api/documents/anonymize-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, provider }),
  });

  const result = await response.json();
  return result;
}

// Usage
const result = await anonymizeText('Contact John Smith at john@example.com', 'ollama');

console.log(result.anonymizedText);
// Output: "Contact [NAME] at [EMAIL]"

console.log(result.piiDetected);
// Output: { names: ['John Smith'], emails: ['john@example.com'], ... }
```

---

## 🐍 Python Example

```python
import requests

def anonymize_text(text: str, provider: str = None):
    url = 'http://localhost:3000/api/documents/anonymize-text'
    payload = {'text': text}
    if provider:
        payload['provider'] = provider

    response = requests.post(url, json=payload)
    return response.json()

# Usage
result = anonymize_text(
    'Call Sarah at (555) 123-4567 or email sarah@company.com',
    provider='ollama'
)

print(result['anonymizedText'])
# Output: "Call [NAME] at [PHONE] or email [EMAIL]"

print(result['piiDetected'])
# Output: {'names': ['Sarah'], 'phoneNumbers': ['(555) 123-4567'], ...}
```

---

## ⚡ When to Use This vs File Upload

### Use Raw Text API When:

✅ Quick text snippets (< 50,000 chars)  
✅ Real-time anonymization  
✅ Simple integrations  
✅ Chat applications  
✅ Form submissions  
✅ API-to-API communication

### Use File Upload When:

✅ Large documents (> 50,000 chars)  
✅ PDF or DOCX files  
✅ Batch processing  
✅ Need to track document status  
✅ Want to store results in database

---

## 🚨 Error Handling

### Missing Text Field

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (400):**

```json
{
  "error": "Invalid input",
  "message": "Request body must include \"text\" field with string content"
}
```

### Empty Text

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

**Response (400):**

```json
{
  "error": "Invalid input",
  "message": "Text content cannot be empty"
}
```

### Text Too Large

```bash
# Text > 50,000 characters
```

**Response (400):**

```json
{
  "error": "Text too large",
  "message": "Text content must be less than 50,000 characters. Use file upload for larger documents."
}
```

### Invalid Provider

```bash
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "provider": "invalid"}'
```

**Response (500):**

```json
{
  "error": "Internal server error",
  "message": "LLM provider \"invalid\" is not configured"
}
```

---

## 🧪 Testing

### Interactive Test

```bash
# Simple test
curl -X POST http://localhost:3000/api/documents/anonymize-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Email me at test@example.com"
  }' | jq '.'
```

### Automated Test Script

```bash
# Run the test script
./examples/test-text-api.sh
```

---

## 📊 Performance

| Text Length  | Chunks | Avg Time (Ollama) | Avg Time (OpenAI) |
| ------------ | ------ | ----------------- | ----------------- |
| 100 chars    | 1      | ~2s               | ~1s               |
| 1,000 chars  | 1      | ~3s               | ~1s               |
| 5,000 chars  | 4      | ~10s              | ~4s               |
| 10,000 chars | 7      | ~18s              | ~7s               |
| 50,000 chars | 34     | ~90s              | ~35s              |

_Times are approximate and depend on hardware/network_

---

## 💡 Best Practices

### 1. Choose Right Provider

```javascript
// For sensitive data (stays local)
{
  provider: 'ollama';
}

// For best quality/speed (cloud)
{
  provider: 'openai';
}
```

### 2. Handle Errors

```javascript
try {
  const result = await anonymizeText(text);
  console.log(result.anonymizedText);
} catch (error) {
  console.error('Anonymization failed:', error);
}
```

### 3. Check Text Length

```javascript
if (text.length > 50000) {
  // Use file upload endpoint instead
  uploadFile(text);
} else {
  // Use raw text endpoint
  anonymizeText(text);
}
```

### 4. Review Results

```javascript
const result = await anonymizeText(text);

// Check what was found
console.log('PII detected:', result.piiDetected);

// Review anonymized text
console.log('Result:', result.anonymizedText);
```

---

## 🔗 Related Endpoints

- **File Upload**: `POST /api/documents/upload`
- **File Anonymization**: `POST /api/documents/:id/anonymize`
- **Get Status**: `GET /api/documents/:id`
- **Get Result**: `GET /api/documents/:id/anonymized`

---

## 📚 More Information

- [API Documentation](API.md) - Complete API reference
- [Configuration Guide](ENV_EXAMPLES.md) - LLM provider setup
- [Ollama Setup](OLLAMA_SETUP.md) - Local LLM setup

---

**Need quick anonymization? This is the fastest way!** 🚀
