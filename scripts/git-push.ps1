# Git Push Helper Script (PowerShell)
# Push current branch to GitHub

Write-Host "🚀 Git Push Helper" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

# Get current branch
$currentBranch = git branch --show-current

if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Write-Host "❌ Error: Not in a Git repository or no branch found." -ForegroundColor Red
    exit 1
}

Write-Host " Branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Check if there are commits to push
$commitsToPush = git log "origin/$currentBranch..HEAD" --oneline 2>$null

if ([string]::IsNullOrWhiteSpace($commitsToPush)) {
    Write-Host "ℹ️  No commits to push." -ForegroundColor Yellow
    exit 0
}

# Show commits to be pushed
Write-Host "📋 Commits to push:" -ForegroundColor Yellow
Write-Host $commitsToPush
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Push to GitHub? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Push cancelled." -ForegroundColor Red
    exit 1
}

# Push
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 View on GitHub:" -ForegroundColor Cyan
    Write-Host "https://github.com/ton-apicha/asic-repair-manager-pro/tree/$currentBranch"
} else {
    Write-Host "❌ Push failed. Please check your connection and try again." -ForegroundColor Red
    exit 1
}

