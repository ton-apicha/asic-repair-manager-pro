# Git Create Branch Helper Script (PowerShell)
# Interactive script to create new branches

Write-Host "🌿 Git Branch Creator" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Show current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Ask for branch type
Write-Host "Select branch type:"
Write-Host "1) feature - New feature"
Write-Host "2) fix - Bug fix"
Write-Host "3) hotfix - Urgent production fix"
Write-Host ""
$typeChoice = Read-Host "Enter type (1-3)"

$branchPrefix = switch ($typeChoice) {
    "1" { "feature" }
    "2" { "fix" }
    "3" { "hotfix" }
    default { 
        Write-Host "Invalid choice. Using 'feature' as default." -ForegroundColor Yellow
        "feature"
    }
}

# Ask for branch name
Write-Host ""
$branchName = Read-Host "Enter branch name (e.g., work-order-detail)"

# Validate branch name (no spaces, lowercase)
$branchName = $branchName.ToLower().Replace(" ", "-")

# Full branch name
$fullBranchName = "$branchPrefix/$branchName"

# Check if branch already exists
$branchExists = git show-ref --verify --quiet "refs/heads/$fullBranchName"
if ($branchExists) {
    Write-Host "❌ Error: Branch '$fullBranchName' already exists." -ForegroundColor Red
    $switchConfirm = Read-Host "Switch to existing branch? (y/n)"
    if ($switchConfirm -eq "y") {
        git checkout $fullBranchName
        Write-Host "✅ Switched to '$fullBranchName'" -ForegroundColor Green
    }
    exit 1
}

# Show branch info
Write-Host ""
Write-Host "📋 Branch details:" -ForegroundColor Yellow
Write-Host "Type: $branchPrefix"
Write-Host "Name: $branchName"
Write-Host "Full name: $fullBranchName"
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Create branch '$fullBranchName'? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Branch creation cancelled." -ForegroundColor Red
    exit 1
}

# Create and switch to branch
Write-Host ""
Write-Host "🌿 Creating branch..." -ForegroundColor Yellow
git checkout -b $fullBranchName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Branch created and switched!" -ForegroundColor Green
    Write-Host "📍 Current branch: $fullBranchName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Make your changes"
    Write-Host "2. Commit: git commit -m 'feat: add feature'"
    Write-Host "3. Push: git push origin $fullBranchName"
} else {
    Write-Host "❌ Failed to create branch." -ForegroundColor Red
    exit 1
}

