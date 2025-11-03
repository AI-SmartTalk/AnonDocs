#!/bin/bash

# Test the document anonymization API endpoint

API_URL="http://localhost:3000/api/document"

echo "=== Testing Document Anonymization API ==="
echo ""

# Create a test text file
echo "Creating test document..."
cat > /tmp/test-anon.txt << 'EOF'
CONFIDENTIAL EMPLOYEE RECORD

Employee Name: Sarah Johnson
Email: sarah.johnson@company.com
Phone: (555) 123-4567
Address: 456 Oak Avenue, Los Angeles, CA 90001
SSN: 123-45-6789
Employee ID: EMP-2024-001

Employment History:
Started at Acme Corporation on January 15, 2020
Previous employer: Tech Solutions Inc.

Contact Information:
Emergency Contact: Michael Johnson (555) 987-6543
Personal Email: sarah.j@email.com

Salary Information:
Current Salary: $85,000/year
Last Review: March 1, 2024
EOF

echo "Test file created: /tmp/test-anon.txt"
echo ""

# Test document upload
echo "Test: Uploading and anonymizing text document"
curl -X POST "$API_URL" \
  -F "file=@/tmp/test-anon.txt" \
  -F "provider=openai"

echo ""
echo ""

# Cleanup
rm -f /tmp/test-anon.txt
echo "Test complete. Cleaned up test file."

