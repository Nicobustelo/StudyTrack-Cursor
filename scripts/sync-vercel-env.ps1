param(
  [string]$EnvFile = ".env.local",
  [string]$Scope = "nicolas-bustelos-projects",
  [string[]]$Targets = @("production", "development")
)

function Parse-EnvFile {
  param([string]$Path)
  $vars = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $key = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      $vars[$key] = $value
    }
  }
  return $vars
}

$vars = Parse-EnvFile -Path $EnvFile
$results = @()

foreach ($key in ($vars.Keys | Sort-Object)) {
  $value = $vars[$key]
  foreach ($target in $Targets) {
    $escapedValue = $value.Replace('"', '\"')
    $command = "vercel env add $key $target --value ""$escapedValue"" --yes --force --scope $Scope --non-interactive <nul"
    $output = cmd /c $command 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
      $results += "FAIL $key $target :: $output"
    } else {
      $results += "OK $key $target"
    }
  }
}

$results | ForEach-Object { Write-Output $_ }
