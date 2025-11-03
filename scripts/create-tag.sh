#!/bin/bash

# Create Git Tag Helper Script
# Interactive script to create version tags

echo "🏷️  Git Tag Creator"
echo "==================="
echo ""

# Show current version (from package.json if exists)
if [ -f "package.json" ]; then
  current_version=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
  echo "📦 Current version in package.json: $current_version"
  echo ""
fi

# Ask for tag type
echo "Select version type:"
echo "1) Major (v1.0.0 → v2.0.0) - Breaking changes"
echo "2) Minor (v1.0.0 → v1.1.0) - New features"
echo "3) Patch (v1.0.0 → v1.0.1) - Bug fixes"
echo "4) Custom - Enter version manually"
echo ""
read -p "Enter type (1-4): " type_choice

# Get latest tag
latest_tag=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$latest_tag" ]; then
  echo "ℹ️  No existing tags found. Starting from v1.0.0"
  latest_major=1
  latest_minor=0
  latest_patch=0
else
  echo "📋 Latest tag: $latest_tag"
  # Extract version numbers
  version_part=$(echo "$latest_tag" | sed 's/v//')
  latest_major=$(echo "$version_part" | cut -d'.' -f1)
  latest_minor=$(echo "$version_part" | cut -d'.' -f2)
  latest_patch=$(echo "$version_part" | cut -d'.' -f3)
fi

# Calculate new version
case $type_choice in
  1)
    new_major=$((latest_major + 1))
    new_minor=0
    new_patch=0
    new_version="v$new_major.$new_minor.$new_patch"
    ;;
  2)
    new_major=$latest_major
    new_minor=$((latest_minor + 1))
    new_patch=0
    new_version="v$new_major.$new_minor.$new_patch"
    ;;
  3)
    new_major=$latest_major
    new_minor=$latest_minor
    new_patch=$((latest_patch + 1))
    new_version="v$new_major.$new_minor.$new_patch"
    ;;
  4)
    echo ""
    read -p "Enter version (format: v1.0.0): " new_version
    if [[ ! "$new_version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "❌ Invalid version format. Use format: v1.0.0"
      exit 1
    fi
    ;;
  *)
    echo "Invalid choice. Using patch version."
    new_major=$latest_major
    new_minor=$latest_minor
    new_patch=$((latest_patch + 1))
    new_version="v$new_major.$new_minor.$new_patch"
    ;;
esac

# Ask for tag message
echo ""
read -p "Enter tag message (optional): " tag_message

if [ -z "$tag_message" ]; then
  tag_message="Release $new_version"
fi

# Show tag info
echo ""
echo "📋 Tag details:"
echo "Version: $new_version"
echo "Message: $tag_message"
echo ""

# Ask for confirmation
read -p "Create tag? (y/n): " confirm

if [ "$confirm" != "y" ]; then
  echo "❌ Tag creation cancelled."
  exit 1
fi

# Create tag
echo ""
echo "🏷️  Creating tag..."
git tag -a "$new_version" -m "$tag_message"

if [ $? -eq 0 ]; then
  echo "✅ Tag created successfully!"
  echo ""
  
  # Ask to push
  read -p "Push tag to GitHub? (y/n): " push_confirm
  
  if [ "$push_confirm" = "y" ]; then
    echo ""
    echo "🚀 Pushing tag..."
    git push origin "$new_version"
    
    if [ $? -eq 0 ]; then
      echo "✅ Tag pushed successfully!"
      echo ""
      echo "🔗 View on GitHub:"
      echo "https://github.com/ton-apicha/asic-repair-manager-pro/releases/tag/$new_version"
    else
      echo "❌ Failed to push tag."
    fi
  fi
else
  echo "❌ Failed to create tag."
  exit 1
fi

