#!/bin/bash

# Git Revert Helper Script
# Interactive script to revert commits

echo "↩️  Git Revert Helper"
echo "===================="
echo ""

# Show recent commits
echo "📋 Recent commits:"
git log --oneline -10
echo ""

# Ask which commit to revert
read -p "Enter commit hash to revert (or '1' for last commit): " commit_input

if [ "$commit_input" = "1" ]; then
  commit_hash=$(git log -1 --format="%H")
  commit_msg=$(git log -1 --format="%s")
else
  commit_hash="$commit_input"
  commit_msg=$(git log -1 --format="%s" "$commit_hash")
fi

# Check if commit exists
if ! git cat-file -e "$commit_hash" 2>/dev/null; then
  echo "❌ Error: Commit not found."
  exit 1
fi

# Show commit details
echo ""
echo "📋 Commit to revert:"
echo "Hash: $commit_hash"
echo "Message: $commit_msg"
echo ""

# Check if already pushed
if git branch -r --contains "$commit_hash" | grep -q .; then
  echo "⚠️  This commit has been pushed to GitHub."
  echo "Will use 'git revert' to create a new commit."
  revert_method="revert"
else
  echo "ℹ️  This commit has not been pushed."
  echo ""
  echo "Select revert method:"
  echo "1) Reset --soft (keep changes, uncommit)"
  echo "2) Reset --mixed (keep changes, unstage)"
  echo "3) Reset --hard (discard all changes)"
  echo "4) Revert (create new commit)"
  echo ""
  read -p "Enter method (1-4): " method_choice
  
  case $method_choice in
    1) revert_method="reset-soft" ;;
    2) revert_method="reset-mixed" ;;
    3) revert_method="reset-hard" ;;
    4) revert_method="revert" ;;
    *) echo "Invalid choice. Using 'revert' as default."; revert_method="revert" ;;
  esac
fi

# Ask for confirmation
echo ""
read -p "Proceed with revert? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Revert cancelled."
  exit 1
fi

# Execute revert
echo ""
case $revert_method in
  reset-soft)
    echo "↩️  Resetting (soft)..."
    git reset --soft "$commit_hash"^
    echo "✅ Reset successful! Changes are staged."
    ;;
  reset-mixed)
    echo "↩️  Resetting (mixed)..."
    git reset "$commit_hash"^
    echo "✅ Reset successful! Changes are in working directory."
    ;;
  reset-hard)
    echo "⚠️  Resetting (hard) - ALL CHANGES WILL BE LOST!"
    read -p "Are you absolutely sure? (yes/no): " sure
    if [ "$sure" = "yes" ]; then
      git reset --hard "$commit_hash"^
      echo "✅ Reset successful! All changes discarded."
    else
      echo "❌ Revert cancelled."
      exit 1
    fi
    ;;
  revert)
    echo "↩️  Reverting commit..."
    git revert "$commit_hash" --no-edit
    if [ $? -eq 0 ]; then
      echo "✅ Revert successful!"
      echo ""
      read -p "Push to GitHub? (y/n): " push_confirm
      if [ "$push_confirm" = "y" ]; then
        current_branch=$(git branch --show-current)
        git push origin "$current_branch"
        if [ $? -eq 0 ]; then
          echo "✅ Push successful!"
        fi
      fi
    else
      echo "❌ Revert failed. There may be conflicts."
      echo "Please resolve conflicts and run: git revert --continue"
    fi
    ;;
esac

