# Create Git Tag Helper Script (PowerShell)
# Interactive script to create version tags

Write-Host "🏷️  Git Tag Creator" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Show current version (from package.json if exists)
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.version) {
        Write-Host "📦 Current version in package.json: $($packageJson.version)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Ask for tag type
Write-Host "Select version type:"
Write-Host "1) Major (v1.0.0 → v2.0.0) - Breaking changes"
Write-Host "2) Minor (v1.0.0 → v1.1.0) - New features"
Write-Host "3) Patch (v1.0.0 → v1.0.1) - Bug fixes"
Write-Host "4) Custom - Enter version manually"
Write-Host ""
$typeChoice = Read-Host "Enter type (1-4)"

# Get latest tag
$latestTag = git describe --tags --abbrev=0 2>$null

if ([string]::IsNullOrWhiteSpace($latestTag)) {
    Write-Host "ℹ️  No existing tags found. Starting from v1.0.0" -ForegroundColor Yellow
    $latestMajor = 1
    $latestMinor = 0
    $latestPatch = 0
} else {
    Write-Host "📋 Latest tag: $latestTag" -ForegroundColor Yellow
    # Extract version numbers
    $versionPart = $latestTag -replace 'v', ''
    $versionParts = $versionPart -split '\.'
    $latestMajor = [int]$versionParts[0]
    $latestMinor = [int]$versionParts[1]
    $latestPatch = [int]$versionParts[2]
}

# Calculate new version
switch ($typeChoice) {
    "1" {
        $newMajor = $latestMajor + 1
        $newMinor = 0
        $newPatch = 0
        $newVersion = "v$newMajor.$newMinor.$newPatch"
    }
    "2" {
        $newMajor = $latestMajor
        $newMinor = $latestMinor + 1
        $newPatch = 0
        $newVersion = "v$newMajor.$newMinor.$newPatch"
    }
    "3" {
        $newMajor = $latestMajor
        $newMinor = $latestMinor
        $newPatch = $latestPatch + 1
        $newVersion = "v$newMajor.$newMinor.$newPatch"
    }
    "4" {
        Write-Host ""
        $newVersion = Read-Host "Enter version (format: v1.0.0)"
        if ($newVersion -notmatch '^v\d+\.\d+\.\d+$') {
            Write-Host "❌ Invalid version format. Use format: v1.0.0" -ForegroundColor Red
            exit 1
        }
    }
    default {
        Write-Host "Invalid choice. Using patch version." -ForegroundColor Yellow
        $newMajor = $latestMajor
        $newMinor = $latestMinor
        $newPatch = $latestPatch + 1
        $newVersion = "v$newMajor.$newMinor.$newPatch"
    }
}

# Ask for tag message
Write-Host ""
$tagMessage = Read-Host "Enter tag message (optional)"

if ([string]::IsNullOrWhiteSpace($tagMessage)) {
    $tagMessage = "Release $newVersion"
}

# Show tag info
Write-Host ""
Write-Host "📋 Tag details:" -ForegroundColor Yellow
Write-Host "Version: $newVersion"
Write-Host "Message: $tagMessage"
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Create tag? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Tag creation cancelled." -ForegroundColor Red
    exit 1
}

# Create tag
Write-Host ""
Write-Host "🏷️  Creating tag..." -ForegroundColor Yellow
git tag -a $newVersion -m $tagMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tag created successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Ask to push
    $pushConfirm = Read-Host "Push tag to GitHub? (y/n)"
    
    if ($pushConfirm -eq "y") {
        Write-Host ""
        Write-Host "🚀 Pushing tag..." -ForegroundColor Yellow
        git push origin $newVersion
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tag pushed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🔗 View on GitHub:" -ForegroundColor Cyan
            Write-Host "https://github.com/ton-apicha/asic-repair-manager-pro/releases/tag/$newVersion"
        } else {
            Write-Host "❌ Failed to push tag." -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Failed to create tag." -ForegroundColor Red
    exit 1
}

