# Skill Vault: local skill inventory and backup for a Windows migration.
# Reads SKILL.md files in common CLI/agent locations. Does not modify installations.
# The backup ZIP contains skill folders only, not agent config files or credentials.
param(
    [string]$OutputDirectory = $PSScriptRoot,
    [switch]$ScanOnly
)

$ErrorActionPreference = 'Stop'
if (-not $OutputDirectory) { $OutputDirectory = (Get-Location).Path }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$userHome = [Environment]::GetFolderPath('UserProfile')
$workingDirectory = (Get-Location).Path

# Add custom OMP skills.customDirectories or nonstandard agent paths here if used.
$AdditionalRoots = @()
$roots = @(
    @{ provider = 'omp'; path = (Join-Path $userHome '.omp\agent\skills') },
    @{ provider = 'omp-managed'; path = (Join-Path $userHome '.omp\agent\managed-skills') },
    @{ provider = 'omp-profiles'; path = (Join-Path $userHome '.omp\profiles') },
    @{ provider = 'omp-plugins'; path = (Join-Path $userHome '.omp\plugins') },
    @{ provider = 'claude'; path = (Join-Path $userHome '.claude\skills') },
    @{ provider = 'claude-plugins'; path = (Join-Path $userHome '.claude\plugins') },
    @{ provider = 'codex'; path = (Join-Path $userHome '.codex\skills') },
    @{ provider = 'codex-plugins'; path = (Join-Path $userHome '.codex\plugins') },
    @{ provider = 'agents'; path = (Join-Path $userHome '.agents\skills') },
    @{ provider = 'agent'; path = (Join-Path $userHome '.agent\skills') },
    @{ provider = 'gemini'; path = (Join-Path $userHome '.gemini\skills') },
    @{ provider = 'antigravity'; path = (Join-Path $userHome '.antigravity\skills') },
    @{ provider = 'opencode'; path = (Join-Path $userHome '.config\opencode\skills') },
    @{ provider = 'pi'; path = (Join-Path $userHome '.pi\agent\skills') },
    @{ provider = 'project-omp'; path = (Join-Path $workingDirectory '.omp\skills') },
    @{ provider = 'project-claude'; path = (Join-Path $workingDirectory '.claude\skills') },
    @{ provider = 'project-codex'; path = (Join-Path $workingDirectory '.codex\skills') },
    @{ provider = 'project-agents'; path = (Join-Path $workingDirectory '.agents\skills') },
    @{ provider = 'project-agent'; path = (Join-Path $workingDirectory '.agent\skills') },
    @{ provider = 'project-github'; path = (Join-Path $workingDirectory '.github\skills') },
    @{ provider = 'project-gemini'; path = (Join-Path $workingDirectory '.gemini\skills') }
)
foreach ($customRoot in $AdditionalRoots) {
    $roots += @{ provider = 'custom'; path = $customRoot }
}

$seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
$skills = New-Object 'System.Collections.Generic.List[object]'
foreach ($root in $roots) {
    if (-not (Test-Path -LiteralPath $root.path -PathType Container)) { continue }
    Write-Host ('Scanning [{0}] {1}' -f $root.provider, $root.path)
    $candidateFiles = @(Get-ChildItem -LiteralPath $root.path -Filter SKILL.md -File -Recurse -Force -ErrorAction SilentlyContinue)
    foreach ($file in $candidateFiles) {
        if ($file.FullName -match '[\\/](node_modules|\.git|\.venv|__pycache__)[\\/]') { continue }
        if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
        if (-not $seen.Add($file.FullName)) { continue }

        $skillName = $file.Directory.Name
        $lines = @(Get-Content -LiteralPath $file.FullName -TotalCount 35 -ErrorAction SilentlyContinue)
        foreach ($line in $lines) {
            if ($line -match '^name\s*:\s*["'']?([^"''#]+)') {
                $candidateName = $matches[1].Trim()
                if ($candidateName) { $skillName = $candidateName }
                break
            }
        }
        $skills.Add([pscustomobject]@{
            name = $skillName
            provider = $root.provider
            path = $file.Directory.FullName
            skillFile = $file.FullName
            sourceRoot = $root.path
        })
    }
}

$records = @($skills | Sort-Object name, path)
$report = [ordered]@{
    schema = 'skill-vault-scan/1'
    scannedAt = (Get-Date).ToString('o')
    machine = $env:COMPUTERNAME
    skillCount = $records.Count
    skills = $records
    notes = 'Paths describe this machine. Agent configuration, MCPs, API keys, and plugin settings are NOT included.'
}
$manifestPath = Join-Path $OutputDirectory 'skill-vault-scan.json'
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host ('Found {0} skill folders. JSON: {1}' -f $records.Count, $manifestPath)

if (-not $ScanOnly) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $stage = Join-Path $OutputDirectory ('skill-vault-stage-' + $stamp)
    $zipPath = Join-Path $OutputDirectory ('skill-vault-backup-' + $stamp + '.zip')
    New-Item -ItemType Directory -Path $stage -Force | Out-Null
    $skipped = New-Object 'System.Collections.Generic.List[string]'
    try {
        Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $stage 'skill-vault-scan.json')
        for ($i = 0; $i -lt $records.Count; $i++) {
            $record = $records[$i]
            $safeProvider = [Regex]::Replace($record.provider, '[^A-Za-z0-9._-]', '_')
            $safeName = [Regex]::Replace($record.name, '[^A-Za-z0-9._-]', '_')
            $folder = ('{0:D3}_{1}_{2}' -f ($i + 1), $safeProvider, $safeName)
            $destRoot = Join-Path $stage ('skills\' + $folder)
            New-Item -ItemType Directory -Path $destRoot -Force | Out-Null
            $sourceRoot = $record.path.TrimEnd('\', '/')
            $allFiles = @(Get-ChildItem -LiteralPath $record.path -File -Recurse -Force -ErrorAction SilentlyContinue)
            foreach ($file in $allFiles) {
                $relative = $file.FullName.Substring($sourceRoot.Length).TrimStart('\', '/')
                if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                    $skipped.Add($file.FullName); continue
                }
                if ($relative -match '(^|[\\/])(node_modules|\.git|\.venv|__pycache__)([\\/]|$)') {
                    $skipped.Add($file.FullName); continue
                }
                if ($file.Name -match '(?i)(^\.env($|\.)|credential|secret|token|api[_-]?key|^id_rsa$|^id_ed25519$)') {
                    $skipped.Add($file.FullName); continue
                }
                if ($file.Length -gt 25MB) {
                    $skipped.Add($file.FullName); continue
                }
                $target = Join-Path $destRoot $relative
                $parentDir = Split-Path $target -Parent
                New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
                Copy-Item -LiteralPath $file.FullName -Destination $target -Force
            }
        }
        if ($skipped.Count -gt 0) {
            $skipped | Set-Content -LiteralPath (Join-Path $stage 'skipped-files.txt') -Encoding UTF8
        }
        Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -CompressionLevel Optimal -Force
        Write-Host ('Backup ZIP: {0}' -f $zipPath)
        Write-Host ('Files excluded by basic safety/size filters: {0}' -f $skipped.Count)
    }
    finally {
        if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
    }
}
Write-Host 'Review the scan report and ZIP before moving or sharing. Never share private credentials.'
