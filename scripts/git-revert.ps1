# Git Revert Helper Script (PowerShell)
# Interactive script to revert commits

Write-Host "↩️  Git Revert Helper" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# Show recent commits
Write-Host "📋 Recent commits:" -ForegroundColor Yellow
git log --oneline -10
Write-Host ""

# Ask which commit to revert
$commitInput = Read-Host "Enter commit hash to revert (or '1' for last commit)"

if ($commitInput -eq "1") {
    $commitHash = git log -1 --format="%H"
    $commitMsg = git log -1 --format="%s"
} else {
    $commitHash = $commitInput
    $commitMsg = git log -1 --format="%s" $commitHash
}

# Check if commit exists
$commitExists = git cat-file -e $commitHash 2>$null
if (-not $commitExists) {
    Write-Host "❌ Error: Commit not found." -ForegroundColor Red
    exit 1
}

# Show commit details
Write-Host ""
Write-Host "📋 Commit to revert:" -ForegroundColor Yellow
Write-Host "Hash: $commitHash"
Write-Host "Message: $commitMsg"
Write-Host ""

# Check if already pushed
$pushedBranches = git branch -r --contains $commitHash 2>$null

if (-not [string]::IsNullOrWhiteSpace($pushedBranches)) {
    Write-Host "⚠️  This commit has been pushed to GitHub." -ForegroundColor Yellow
    Write-Host "Will use 'git revert' to create a new commit."
    $revertMethod = "revert"
} else {
    Write-Host "ℹ️  This commit has not been pushed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Select revert method:"
    Write-Host "1) Reset --soft (keep changes, uncommit)"
    Write-Host "2) Reset --mixed (keep changes, unstage)"
    Write-Host "3) Reset --hard (discard all changes)"
    Write-Host "4) Revert (create new commit)"
    Write-Host ""
    $methodChoice = Read-Host "Enter method (1-4)"
    
    $revertMethod = switch ($methodChoice) {
        "1" { "reset-soft" }
        "2" { "reset-mixed" }
        "3" { "reset-hard" }
        "4" { "revert" }
        default { 
            Write-Host "Invalid choice. Using 'revert' as default." -ForegroundColor Yellow
            "revert"
        }
    }
}

# Ask for confirmation
Write-Host ""
$confirm = Read-Host "Proceed with revert? (y/n)"

if ($confirm -ne "y") {
    Write-Host "❌ Revert cancelled." -ForegroundColor Red
    exit 1
}

# Execute revert
Write-Host ""
switch ($revertMethod) {
    "reset-soft" {
        Write-Host "↩️  Resetting (soft)..." -ForegroundColor Yellow
        git reset --soft "${commitHash}^"
        Write-Host "✅ Reset successful! Changes are staged." -ForegroundColor Green
    }
    "reset-mixed" {
        Write-Host "↩️  Resetting (mixed)..." -ForegroundColor Yellow
        git reset "${commitHash}^"
        Write-Host "✅ Reset successful! Changes are in working directory." -ForegroundColor Green
    }
    "reset-hard" {
        Write-Host "⚠️  Resetting (hard) - ALL CHANGES WILL BE LOST!" -ForegroundColor Red
        $sure = Read-Host "Are you absolutely sure? (yes/no)"
        if ($sure -eq "yes") {
            git reset --hard "${commitHash}^"
            Write-Host "✅ Reset successful! All changes discarded." -ForegroundColor Green
        } else {
            Write-Host "❌ Revert cancelled." -ForegroundColor Red
            exit 1
        }
    }
    "revert" {
        Write-Host "↩️  Reverting commit..." -ForegroundColor Yellow
        git revert $commitHash --no-edit
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Revert successful!" -ForegroundColor Green
            Write-Host ""
            $pushConfirm = Read-Host "Push to GitHub? (y/n)"
            if ($pushConfirm -eq "y") {
                $currentBranch = git branch --show-current
                git push origin $currentBranch
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Push successful!" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "❌ Revert failed. There may be conflicts." -ForegroundColor Red
            Write-Host "Please resolve conflicts and run: git revert --continue"
        }
    }
}

