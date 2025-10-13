#!/bin/bash

# AnonDocs API Test Script
# This script demonstrates how to use the API

API_URL="http://localhost:3000"

echo "🧪 Testing AnonDocs API"
echo "========================"
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
HEALTH=$(curl -s "$API_URL/health")
echo "Response: $HEALTH"
echo ""

# Upload a test document
echo "2. Uploading a test document..."
echo "NOTE: Make sure you have a test PDF or DOCX file"
echo "Usage: ./scripts/test-api.sh /path/to/your/document.pdf"
echo ""

if [ -n "$1" ]; then
  UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/documents/upload" \
    -F "file=@$1")
  echo "Upload Response: $UPLOAD_RESPONSE"
  
  # Extract document ID
  DOC_ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "Document ID: $DOC_ID"
  echo ""
  
  if [ -n "$DOC_ID" ]; then
    # Start anonymization
    echo "3. Starting anonymization..."
    ANONYMIZE_RESPONSE=$(curl -s -X POST "$API_URL/api/documents/$DOC_ID/anonymize" \
      -H "Content-Type: application/json" \
      -d '{"provider": "openai"}')
    echo "Response: $ANONYMIZE_RESPONSE"
    echo ""
    
    # Wait a bit
    echo "4. Waiting for processing (10 seconds)..."
    sleep 10
    
    # Check status
    echo "5. Checking document status..."
    STATUS_RESPONSE=$(curl -s "$API_URL/api/documents/$DOC_ID")
    echo "Response: $STATUS_RESPONSE"
    echo ""
    
    # Try to get anonymized version
    echo "6. Fetching anonymized document..."
    ANONYMIZED_RESPONSE=$(curl -s "$API_URL/api/documents/$DOC_ID/anonymized")
    echo "Response: $ANONYMIZED_RESPONSE"
  fi
else
  echo "⚠️  No file provided. Skipping upload test."
  echo "Usage: ./scripts/test-api.sh /path/to/your/document.pdf"
fi

echo ""
echo "✅ Test script complete"

