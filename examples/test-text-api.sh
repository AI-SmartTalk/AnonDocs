#!/bin/bash

# Test the raw text anonymization API

API_URL="http://localhost:3000"

echo "🧪 Testing Raw Text Anonymization API"
echo "======================================"
echo ""

# Test 1: Simple text anonymization
echo "1️⃣  Testing with sample text..."
RESPONSE=$(curl -s -X POST "$API_URL/api/documents/anonymize-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hi, my name is John Smith. I live at 123 Main St, New York. You can reach me at john.smith@email.com or call me at (555) 123-4567.",
    "provider": "ollama"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 2: Medical record
echo "2️⃣  Testing with medical record..."
RESPONSE=$(curl -s -X POST "$API_URL/api/documents/anonymize-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient: Sarah Johnson\nDOB: 03/15/1985\nSSN: 123-45-6789\nAddress: 456 Oak Avenue, Boston, MA 02101\nEmergency Contact: Michael Johnson (555) 987-6543\n\nDiagnosis: The patient presented with symptoms on January 15, 2024. Treatment plan initiated.",
    "provider": "ollama"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 3: Without provider (use default)
echo "3️⃣  Testing with default provider..."
RESPONSE=$(curl -s -X POST "$API_URL/api/documents/anonymize-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Contact Jane Doe at jane.doe@company.com or visit our office at 789 Business Blvd."
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 4: Error case - empty text
echo "4️⃣  Testing error handling (empty text)..."
RESPONSE=$(curl -s -X POST "$API_URL/api/documents/anonymize-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": ""
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 5: Error case - missing text field
echo "5️⃣  Testing error handling (missing text field)..."
RESPONSE=$(curl -s -X POST "$API_URL/api/documents/anonymize-text" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "ollama"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

echo "✅ Test script complete"
echo ""
echo "💡 Tips:"
echo "   - Use 'provider' field to choose LLM (openai, anthropic, ollama)"
echo "   - Omit 'provider' to use your DEFAULT_LLM_PROVIDER"
echo "   - Max text length: 50,000 characters"
echo "   - For longer documents, use file upload instead"

