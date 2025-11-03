# Interactive Git Commit Script (PowerShell)
# This script helps you create commits with proper format

Write-Host "📝 Git Commit Helper" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Show current status
Write-Host "📊 Current status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Ask for commit type
Write-Host "Select commit type:"
Write-Host "1) feat - New feature"
Write-Host "2) fix - Bug fix"
Write-Host "3) refactor - Code refactoring"
Write-Host "4) docs - Documentation"
Write-Host "5) style - Code style"
Write-Host "6) test - Test changes"
Write-Host "7) chore - Maintenance"
Write-Host ""
$typeChoice = Read-Host "Enter type (1-7)"

$type = switch ($typeChoice) {
    "1" { "feat" }
    "2" { "fix" }
    "3" { "refactor" }
    "4" { "docs" }
    "5" { "style" }
    "6" { "test" }
    "7" { "chore" }
    default { 
        Write-Host "Invalid choice. Using 'feat' as default." -ForegroundColor Yellow
        "feat"
    }
}

# Ask for subject
Write-Host ""
$subject = Read-Host "Enter commit subject (what you did)"

# Ask for body (optional)
Write-Host ""
$body = Read-Host "Enter commit body (optional, press Enter to skip)"

# Ask for auto-push
Write-Host ""
$autoPush = Read-Host "Push to GitHub after commit? (y/n)"

# Build commit message
if ([string]::IsNullOrWhiteSpace($body)) {
    $commitMessage = "$type`: $subject"
} else {
    $commitMessage = "$type`: $subject`n`n$body"
}

# Show commit message
Write-Host ""
Write-Host "📋 Commit message:" -ForegroundColor Green
Write-Host $commitMessage
Write-Host ""
$confirm = Read-Host "Proceed with commit? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Commit cancelled." -ForegroundColor Red
    exit 1
}

# Stage all changes
Write-Host ""
Write-Host "📦 Staging files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
    
    if ($autoPush -eq "y") {
        Write-Host ""
        Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
        $currentBranch = git branch --show-current
        git push origin $currentBranch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Push failed. Please check your connection and try again." -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Commit failed. Please check pre-commit hooks errors above." -ForegroundColor Red
    exit 1
}

