# Streaming API Documentation

**For Integration Teams**

This document explains how to integrate with the AnonDocs streaming API to track real-time progress of text and document anonymization.

---

## Overview

The streaming API uses **Server-Sent Events (SSE)** to provide real-time progress updates during the anonymization process. This is especially useful for:

- Long documents that take time to process
- Showing progress bars to end users
- Monitoring processing status in real-time
- Better user experience during LLM processing

## Endpoints

### 1. Stream Text Anonymization

**Endpoint:** `POST /api/stream/anonymize`

**Content-Type:** `application/json`

**Response Type:** `text/event-stream`

#### Request Body

```json
{
  "text": "Your text to anonymize...",
  "provider": "ollama" // optional: openai | anthropic | ollama
}
```

#### Response Events

The server sends progress events in SSE format:

```
data: {"type":"started","progress":0,"message":"Starting anonymization","totalChunks":3}

data: {"type":"chunk_processing","progress":0,"message":"Processing chunk 1 of 3","currentChunk":1,"totalChunks":3}

data: {"type":"chunk_completed","progress":30,"message":"Completed chunk 1 of 3","currentChunk":1,"totalChunks":3}

data: {"type":"chunk_processing","progress":30,"message":"Processing chunk 2 of 3","currentChunk":2,"totalChunks":3}

data: {"type":"chunk_completed","progress":60,"message":"Completed chunk 2 of 3","currentChunk":2,"totalChunks":3}

data: {"type":"chunk_processing","progress":60,"message":"Processing chunk 3 of 3","currentChunk":3,"totalChunks":3}

data: {"type":"chunk_completed","progress":90,"message":"Completed chunk 3 of 3","currentChunk":3,"totalChunks":3}

data: {"type":"completed","progress":100,"message":"Anonymization completed","data":{...}}

data: [DONE]
```

### 2. Stream Document Anonymization

**Endpoint:** `POST /api/stream/document`

**Content-Type:** `multipart/form-data`

**Response Type:** `text/event-stream`

#### Request Form Data

- `file`: The document file (PDF, DOCX, or TXT)
- `provider`: (optional) `"openai"` | `"anthropic"` | `"ollama"`

---

## Event Types

| Event Type         | Description                       | Fields                                               |
| ------------------ | --------------------------------- | ---------------------------------------------------- |
| `started`          | Anonymization process has started | `progress`, `message`, `totalChunks`                 |
| `chunk_processing` | A chunk is being processed        | `progress`, `message`, `currentChunk`, `totalChunks` |
| `chunk_completed`  | A chunk has finished processing   | `progress`, `message`, `currentChunk`, `totalChunks` |
| `completed`        | All processing is done            | `progress: 100`, `message`, `data` (full result)     |
| `error`            | An error occurred                 | `progress: 0`, `message` (error details)             |

### Event Structure

```typescript
interface ProgressEvent {
  type: 'started' | 'chunk_processing' | 'chunk_completed' | 'completed' | 'error';
  progress: number; // 0-100
  message: string; // Human-readable status
  currentChunk?: number; // Current chunk being processed (1-indexed)
  totalChunks?: number; // Total number of chunks
  data?: any; // Full result (only in 'completed' event)
}
```

---

## Integration Examples

### JavaScript / TypeScript (Fetch API)

```javascript
const response = await fetch('http://localhost:3000/api/stream/anonymize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Long text to anonymize...',
    provider: 'ollama',
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);

      if (data === '[DONE]') {
        console.log('Stream finished');
        break;
      }

      try {
        const event = JSON.parse(data);
        console.log(`Progress: ${event.progress}% - ${event.message}`);

        // Update your UI here
        if (event.type === 'completed') {
          console.log('Result:', event.data);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}
```

### JavaScript (EventSource - Simple)

**Note:** EventSource only supports GET requests. For POST with body, use the Fetch API example above.

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useAnonymizationStream(text: string, provider?: string) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/stream/anonymize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, provider }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsProcessing(false);
              return;
            }

            try {
              const event = JSON.parse(data);
              setProgress(event.progress);
              setMessage(event.message);

              if (event.type === 'completed') {
                setResult(event.data);
                setIsProcessing(false);
              } else if (event.type === 'error') {
                setError(event.message);
                setIsProcessing(false);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return { progress, message, result, error, isProcessing, startProcessing };
}

// Usage in component
function AnonymizeComponent() {
  const { progress, message, result, startProcessing } = useAnonymizationStream(
    'Text to anonymize',
    'ollama'
  );

  return (
    <div>
      <button onClick={startProcessing}>Start Anonymization</button>
      <progress value={progress} max="100">
        {progress}%
      </progress>
      <p>{message}</p>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
```

### Python

```python
import requests
import json

def stream_anonymize(text: str, provider: str = 'ollama'):
    url = 'http://localhost:3000/api/stream/anonymize'
    headers = {'Content-Type': 'application/json'}
    data = {'text': text, 'provider': provider}

    with requests.post(url, json=data, stream=True, headers=headers) as response:
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data_str = line_str[6:]  # Remove 'data: ' prefix

                    if data_str == '[DONE]':
                        print('Stream finished')
                        break

                    try:
                        event = json.loads(data_str)
                        progress = event.get('progress', 0)
                        message = event.get('message', '')

                        print(f"Progress: {progress}% - {message}")

                        if event.get('type') == 'completed':
                            result = event.get('data')
                            print('Result:', result)
                            return result
                        elif event.get('type') == 'error':
                            print(f"Error: {message}")
                            return None
                    except json.JSONDecodeError:
                        pass  # Skip invalid JSON

# Usage
result = stream_anonymize(
    'My name is John Smith and my email is john@example.com',
    'ollama'
)
```

### Python with Progress Bar

```python
import requests
import json
from tqdm import tqdm

def stream_anonymize_with_progress(text: str, provider: str = 'ollama'):
    url = 'http://localhost:3000/api/stream/anonymize'
    data = {'text': text, 'provider': provider}

    with requests.post(url, json=data, stream=True) as response:
        pbar = None

        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data_str = line_str[6:]

                    if data_str == '[DONE]':
                        if pbar:
                            pbar.close()
                        break

                    try:
                        event = json.loads(data_str)
                        progress = event.get('progress', 0)
                        message = event.get('message', '')

                        if pbar is None:
                            pbar = tqdm(total=100, desc='Anonymizing')

                        pbar.n = progress
                        pbar.set_description(message)
                        pbar.refresh()

                        if event.get('type') == 'completed':
                            return event.get('data')
                    except json.JSONDecodeError:
                        pass
```

### cURL (Command Line)

```bash
curl -X POST http://localhost:3000/api/stream/anonymize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Smith, email: john@example.com",
    "provider": "ollama"
  }' \
  --no-buffer
```

### Document Streaming (with File Upload)

```javascript
// JavaScript/TypeScript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('provider', 'ollama');

const response = await fetch('http://localhost:3000/api/stream/document', {
  method: 'POST',
  body: formData,
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;

      try {
        const event = JSON.parse(data);
        console.log(`${event.progress}%: ${event.message}`);
      } catch (e) {}
    }
  }
}
```

```python
# Python
files = {'file': open('document.pdf', 'rb')}
data = {'provider': 'ollama'}

with requests.post(
    'http://localhost:3000/api/stream/document',
    files=files,
    data=data,
    stream=True
) as response:
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                # Process event...
```

---

## Best Practices

### 1. Connection Management

- SSE connections can be long-lived - implement proper timeout handling
- Close connections gracefully when done
- Handle network interruptions and reconnection logic

### 2. Error Handling

Always handle errors in event parsing:

```javascript
try {
  const event = JSON.parse(data);
  // Process event
} catch (e) {
  console.error('Failed to parse event:', e);
}
```

### 3. UI Updates

- Throttle UI updates if processing many chunks quickly
- Use debouncing for progress bar updates
- Show meaningful messages to users

### 4. Large Documents

- For very large documents, consider showing estimated time remaining
- Allow users to cancel ongoing operations if needed
- Implement retry logic for failed chunks

### 5. Testing

Test with different document sizes:

```bash
# Small text (single chunk)
curl -X POST http://localhost:3000/api/stream/anonymize \
  -H "Content-Type: application/json" \
  -d '{"text": "Short text", "provider": "ollama"}'

# Large text (multiple chunks)
curl -X POST http://localhost:3000/api/stream/anonymize \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$(cat large-document.txt)\", \"provider\": \"ollama\"}"
```

---

## Performance Notes

- **Sequential processing** (default): Shows progress for each chunk individually
- **Parallel processing** (`ENABLE_PARALLEL_CHUNKS=true`): Faster but less granular progress updates
- Progress is calculated as: `(chunksProcessed / totalChunks) * 90`
- Final 10% is reserved for result aggregation

---

## Troubleshooting

### Connection Closes Immediately

- Check that your client supports SSE
- Verify the server is running and accessible
- Check CORS settings if calling from a browser

### No Progress Events Received

- Ensure text is long enough to be chunked (> 1500 characters by default)
- Check network connectivity
- Verify the request body format is correct

### Incomplete Events

- Buffer incoming data properly before parsing
- Handle multi-line events correctly
- Check for `[DONE]` marker to know when stream ends

---

## Support

For issues or questions, contact the AnonDocs team or open an issue on GitHub.

**Made with ❤️ by [AI SmartTalk](https://aismarttalk.tech)**
