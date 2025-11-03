#!/bin/bash

# Interactive Git Commit Script
# This script helps you create commits with proper format

echo "📝 Git Commit Helper"
echo "==================="
echo ""

# Show current status
echo "📊 Current status:"
git status --short
echo ""

# Ask for commit type
echo "Select commit type:"
echo "1) feat - New feature"
echo "2) fix - Bug fix"
echo "3) refactor - Code refactoring"
echo "4) docs - Documentation"
echo "5) style - Code style"
echo "6) test - Test changes"
echo "7) chore - Maintenance"
echo ""
read -p "Enter type (1-7): " type_choice

case $type_choice in
  1) type="feat" ;;
  2) type="fix" ;;
  3) type="refactor" ;;
  4) type="docs" ;;
  5) type="style" ;;
  6) type="test" ;;
  7) type="chore" ;;
  *) echo "Invalid choice. Using 'feat' as default."; type="feat" ;;
esac

# Ask for subject
echo ""
read -p "Enter commit subject (what you did): " subject

# Ask for body (optional)
echo ""
read -p "Enter commit body (optional, press Enter to skip): " body

# Ask for auto-push
echo ""
read -p "Push to GitHub after commit? (y/n): " auto_push

# Build commit message
if [ -z "$body" ]; then
  commit_message="$type: $subject"
else
  commit_message="$type: $subject

$body"
fi

# Show commit message
echo ""
echo "📋 Commit message:"
echo "$commit_message"
echo ""
read -p "Proceed with commit? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Commit cancelled."
  exit 1
fi

# Stage all changes
echo ""
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Committing..."
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
  echo "✅ Commit successful!"
  
  if [ "$auto_push" = "y" ]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    current_branch=$(git branch --show-current)
    git push origin "$current_branch"
    
    if [ $? -eq 0 ]; then
      echo "✅ Push successful!"
    else
      echo "❌ Push failed. Please check your connection and try again."
    fi
  fi
else
  echo "❌ Commit failed. Please check pre-commit hooks errors above."
  exit 1
fi

