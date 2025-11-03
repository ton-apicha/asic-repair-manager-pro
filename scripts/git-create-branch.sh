#!/bin/bash

# Git Create Branch Helper Script
# Interactive script to create new branches

echo "🌿 Git Branch Creator"
echo "==================="
echo ""

# Show current branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"
echo ""

# Ask for branch type
echo "Select branch type:"
echo "1) feature - New feature"
echo "2) fix - Bug fix"
echo "3) hotfix - Urgent production fix"
echo ""
read -p "Enter type (1-3): " type_choice

case $type_choice in
  1) branch_prefix="feature" ;;
  2) branch_prefix="fix" ;;
  3) branch_prefix="hotfix" ;;
  *) echo "Invalid choice. Using 'feature' as default."; branch_prefix="feature" ;;
esac

# Ask for branch name
echo ""
read -p "Enter branch name (e.g., work-order-detail): " branch_name

# Validate branch name (no spaces, lowercase)
branch_name=$(echo "$branch_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Full branch name
full_branch_name="$branch_prefix/$branch_name"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/"$full_branch_name"; then
  echo "❌ Error: Branch '$full_branch_name' already exists."
  read -p "Switch to existing branch? (y/n): " switch_confirm
  if [ "$switch_confirm" = "y" ]; then
    git checkout "$full_branch_name"
    echo "✅ Switched to '$full_branch_name'"
  fi
  exit 1
fi

# Show branch info
echo ""
echo "📋 Branch details:"
echo "Type: $branch_prefix"
echo "Name: $branch_name"
echo "Full name: $full_branch_name"
echo ""

# Ask for confirmation
read -p "Create branch '$full_branch_name'? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Branch creation cancelled."
  exit 1
fi

# Create and switch to branch
echo ""
echo "🌿 Creating branch..."
git checkout -b "$full_branch_name"

if [ $? -eq 0 ]; then
  echo "✅ Branch created and switched!"
  echo "📍 Current branch: $full_branch_name"
  echo ""
  echo "💡 Next steps:"
  echo "1. Make your changes"
  echo "2. Commit: git commit -m 'feat: add feature'"
  echo "3. Push: git push origin $full_branch_name"
else
  echo "❌ Failed to create branch."
  exit 1
fi

