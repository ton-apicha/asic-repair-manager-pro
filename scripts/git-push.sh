#!/bin/bash

# Git Push Helper Script
# Push current branch to GitHub

echo "🚀 Git Push Helper"
echo "=================="
echo ""

# Get current branch
current_branch=$(git branch --show-current)

if [ -z "$current_branch" ]; then
  echo "❌ Error: Not in a Git repository or no branch found."
  exit 1
fi

echo " Branch: $current_branch"
echo ""

# Check if there are commits to push
if ! git log origin/$current_branch..HEAD --oneline | grep -q .; then
  echo "ℹ️  No commits to push."
  exit 0
fi

# Show commits to be pushed
echo "📋 Commits to push:"
git log origin/$current_branch..HEAD --oneline
echo ""

# Ask for confirmation
read -p "Push to GitHub? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Push cancelled."
  exit 1
fi

# Push
echo ""
echo "🚀 Pushing to GitHub..."
git push origin "$current_branch"

if [ $? -eq 0 ]; then
  echo "✅ Push successful!"
  echo ""
  echo "🔗 View on GitHub:"
  echo "https://github.com/ton-apicha/asic-repair-manager-pro/tree/$current_branch"
else
  echo "❌ Push failed. Please check your connection and try again."
  exit 1
fi

