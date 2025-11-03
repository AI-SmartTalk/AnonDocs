#!/bin/bash

# Test the anonymization API endpoint

API_URL="http://localhost:3000/api/anonymize"

echo "=== Testing Text Anonymization API ==="
echo ""

# Test 1: Simple text with PII
echo "Test 1: Simple text with personal information"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My name is John Smith and my email is john.smith@email.com. I live at 123 Main Street, New York, NY 10001. My phone number is (555) 123-4567."
  }'

echo ""
echo ""

# Test 2: Longer text that may need chunking
echo "Test 2: Longer text"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Dear hiring manager, my name is Jane Doe and I am writing to apply for the position at your company. I can be reached at jane.doe@example.com or by phone at 555-987-6543. I currently reside at 456 Oak Avenue, Los Angeles, CA 90001. I have been working at Acme Corporation since January 15, 2020, and I have gained extensive experience in my field. During my tenure at Acme Corporation, I have worked closely with clients such as Microsoft, Google, and Amazon Web Services. My direct supervisor, Michael Thompson, can be reached at m.thompson@acme.com or at his office number 555-444-3333. I have also collaborated with team members including Robert Davis (robert.davis@acme.com), Lisa Chen (lisa.chen@acme.com), and David Wilson (d.wilson@acme.com). My previous employment was at TechStart Inc., located at 789 Innovation Drive, San Francisco, CA 94105, where I worked from March 2018 to December 2019. My manager there was Jennifer Martinez, who can be contacted at jennifer.martinez@techstart.com or 415-555-7890. I graduated from Stanford University in June 2017 with a Bachelor'\''s degree in Computer Science. My student ID was 20170456 and my graduation date was June 15, 2017. My academic advisor was Professor William Anderson, whose email is w.anderson@stanford.edu. I also completed an internship at Facebook (now Meta) during the summer of 2016, working under the supervision of Emily Rodriguez (emily.rodriguez@meta.com). My personal references include my former colleague Mark Johnson (mark.johnson@gmail.com, 555-222-1111) and my mentor Dr. Patricia Lee (patricia.lee@university.edu, 650-555-9999). I am available for interviews any weekday after 2 PM Pacific Time. My current address is 456 Oak Avenue, Apartment 3B, Los Angeles, CA 90001, and I have lived there since August 2020. My lease expires on July 31, 2024. I can also be reached at my secondary email address j.doe.professional@outlook.com or my mobile phone 555-987-6543. In case of emergency, please contact my brother Tom Doe at tom.doe@email.com or 555-333-4444. I am excited about the opportunity to contribute to your organization and look forward to hearing from you soon."
  }'

echo ""
echo ""

# Test 3: With specific provider (if configured)
echo "Test 3: With specific provider"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Contact Sarah Johnson at sarah.j@company.com or call 555-111-2222",
    "provider": "openai"
  }'

echo ""
echo ""

# Test 4: Error case - empty text
echo "Test 4: Error case - empty text"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": ""
  }'

echo ""
echo ""
echo "=== Tests Complete ==="

