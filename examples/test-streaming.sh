#!/bin/bash

# Test the streaming API endpoints

API_URL="http://localhost:3000"

echo "=== Testing Streaming Anonymization API ==="
echo ""

# Test 1: Stream text anonymization
echo "Test 1: Stream text anonymization with progress"
echo "---"
curl -X POST "$API_URL/api/stream/anonymize" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is Sarah Johnson and I work at Acme Corporation. You can reach me at sarah.johnson@acme.com or call me at (555) 123-4567. I live at 456 Oak Avenue, Los Angeles, CA 90001. My employee ID is EMP-2024-001 and I started on January 15, 2020. For emergency contact, please reach out to Michael Johnson at (555) 987-6543.",
    "provider": "ollama"
  }' \
  --no-buffer

echo ""
echo ""
echo "---"

# Test 2: Stream document anonymization
echo "Test 2: Stream document anonymization"
echo "Creating test document..."

cat > /tmp/test-stream.txt << 'EOF'
CONFIDENTIAL EMPLOYEE RECORD

Employee Name: Robert Anderson
Email: robert.anderson@techcorp.com
Phone: (555) 234-5678
Address: 789 Pine Street, San Francisco, CA 94102
SSN: 987-65-4321
Employee ID: EMP-2024-042

Employment Information:
Started at TechCorp Inc. on March 10, 2019
Department: Engineering
Position: Senior Software Engineer

Contact Information:
Emergency Contact: Jennifer Anderson (555) 876-5432
Personal Email: rob.anderson@email.com

Benefits:
Health Insurance: Policy #HC-123456
401k Account: #401K-789012

Salary Information:
Current Salary: $125,000/year
Last Review: June 15, 2024
Next Review: December 15, 2024

Performance Notes:
Excellent performance in Q1 2024
Led successful project delivery
Recommended for promotion consideration
EOF

echo "Test document created"
echo "---"

curl -X POST "$API_URL/api/stream/document" \
  -F "file=@/tmp/test-stream.txt" \
  -F "provider=ollama" \
  --no-buffer

# Cleanup
rm -f /tmp/test-stream.txt

echo ""
echo ""
echo "=== Tests Complete ==="
echo ""
echo "For integration examples, see STREAMING_API.md"

