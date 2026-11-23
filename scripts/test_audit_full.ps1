$body = '{"scholarshipId":"merit-tech-2026","documents":[{"fileName":"identity_proof.pdf","category":"identity_proof","extractedText":"Name: Rahul Sharma, DOB: 15-08-2002, ID: ABCDE1234F"},{"fileName":"income_certificate.pdf","category":"income_certificate","extractedText":"Name: Rahul Sharma, Annual Income: Rs. 180000"},{"fileName":"academic_marksheet.pdf","category":"academic_marksheet","extractedText":"Student: Rahul Sharma, Percentage: 86.4%, Year: 2023-24"},{"fileName":"institution_certificate.pdf","category":"institution_certificate","extractedText":"Student: Rahul Sharma, Institution: State Engineering College"}]}'

try {
    $resp = Invoke-RestMethod -Method POST -Uri 'http://localhost:5000/api/audit/run' -ContentType 'application/json' -Body $body
    $resp | ConvertTo-Json -Depth 6
} catch {
    Write-Host "Error: $_"
}
