
# Read keys from .env.example (the file where the user placed them)
$source = Get-Content 'C:\SEC\.env.example'

function Get-EnvValue([string]$key, [string[]]$lines) {
    $line = $lines | Where-Object { $_ -match "^$key=" }
    if ($line) { return ($line -split '=', 2)[1] }
    return ''
}

$geminiKey   = Get-EnvValue 'GEMINI_API_KEY' $source
$groqKey     = Get-EnvValue 'GROQ_API_KEY' $source
$nvidiaKey   = Get-EnvValue 'NVIDIA_API_KEY' $source
$nvidiaUrl   = Get-EnvValue 'NVIDIA_BASE_URL' $source
$geminiModel = Get-EnvValue 'GEMINI_MODEL' $source
$groqModel   = Get-EnvValue 'GROQ_MODEL' $source
$nvidiaModel = Get-EnvValue 'NVIDIA_MODEL' $source

# Build the new server/.env content
$lines = @(
    "NODE_ENV=development",
    "PORT=5000",
    "CLIENT_URL=http://localhost:5173",
    "",
    "AI_PRIMARY_PROVIDER=gemini",
    "AI_FAILOVER_ENABLED=true",
    "AI_REQUEST_TIMEOUT_MS=30000",
    "AI_MAX_RETRIES=1",
    "",
    "GEMINI_API_KEY=$geminiKey",
    "GEMINI_MODEL=$geminiModel",
    "",
    "GROQ_API_KEY=$groqKey",
    "GROQ_MODEL=$groqModel",
    "",
    "NVIDIA_API_KEY=$nvidiaKey",
    "NVIDIA_BASE_URL=$nvidiaUrl",
    "NVIDIA_MODEL=$nvidiaModel",
    "",
    "SUPABASE_URL=",
    "SUPABASE_ANON_KEY=",
    "",
    "MAX_FILE_SIZE_MB=10",
    "ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png"
)

$lines | Set-Content -Path 'C:\SEC\server\.env' -Encoding UTF8

# Report detection status only (never values)
Write-Host "GEMINI_API_KEY detected:  $(if ($geminiKey -ne '') { 'YES' } else { 'NO (empty)' })"
Write-Host "GROQ_API_KEY detected:    $(if ($groqKey -ne '') { 'YES' } else { 'NO (empty)' })"
Write-Host "NVIDIA_API_KEY detected:  $(if ($nvidiaKey -ne '') { 'YES' } else { 'NO (empty)' })"
Write-Host "NVIDIA_BASE_URL set:      $(if ($nvidiaUrl -ne '') { 'YES' } else { 'NO (empty)' })"
Write-Host "Written to C:\SEC\server\.env"
