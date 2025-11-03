# Revert Guide

คู่มือการย้อนกลับ (Revert) เมื่อเกิดบั๊กหรือพัฒนาไปผิดทาง

## 📋 สารบัญ

1. [When to Revert](#when-to-revert)
2. [View Commit History](#view-commit-history)
3. [Revert Last Commit (Not Pushed)](#revert-last-commit-not-pushed)
4. [Revert Last Commit (Pushed)](#revert-last-commit-pushed)
5. [Revert Specific Commit](#revert-specific-commit)
6. [Revert Merge](#revert-merge)
7. [View What Changed](#view-what-changed)
8. [Best Practices](#best-practices)

---

## When to Revert

### ✅ ควร Revert เมื่อ:

- ✅ Commit แล้วพบบั๊ก
- ✅ พัฒนาไปผิดทาง
- ✅ ต้องการย้อนกลับไป commit ก่อนหน้า
- ✅ ต้องการดูโค้ดก่อนหน้าเพื่อเปรียบเทียบ

### ❌ ไม่ควร Revert เมื่อ:

- ❌ ยังไม่ได้ commit (ใช้ `git checkout` หรือ `git restore` แทน)
- ❌ ต้องการแก้ไขต่อ (ใช้ `git commit --amend` แทน)
- ❌ ต้องการแก้ไขเฉพาะบางส่วน (ใช้ `git reset` แทน)

---

## View Commit History

### วิธีที่ 1: ใช้ VS Code

1. เปิด Source Control panel (Ctrl+Shift+G)
2. คลิก "..." → "View History"
3. หรือใช้ GitLens extension

### วิธีที่ 2: ใช้ Command Line

```bash
# ดู commit history แบบสั้น
git log --oneline

# ดู commit history แบบละเอียด
git log

# ดู commit history พร้อม graph
git log --oneline --graph --all

# ดู commit history ล่าสุด 10 commit
git log --oneline -10
```

### วิธีที่ 3: ใช้ GitHub

1. ไปที่ https://github.com/ton-apicha/asic-repair-manager-pro
2. คลิก "Commits"
3. ดู commit history

---

## Revert Last Commit (Not Pushed)

### Scenario: Commit แล้วยังไม่ได้ push ไป GitHub

### Option 1: Keep Changes (แนะนำ)

```bash
# ย้อนกลับ commit แต่เก็บการเปลี่ยนแปลง
git reset --soft HEAD~1

# ผลลัพธ์:
# - Commit ถูกยกเลิก
# - ไฟล์ยังอยู่ใน staging area (พร้อม commit)
# - สามารถแก้ไขและ commit ใหม่ได้
```

### Option 2: Keep Changes (Unstaged)

```bash
# ย้อนกลับ commit แต่เก็บการเปลี่ยนแปลง (unstage)
git reset HEAD~1

# หรือ
git reset --mixed HEAD~1

# ผลลัพธ์:
# - Commit ถูกยกเลิก
# - ไฟล์อยู่ใน working directory (ไม่ใช่ staging)
# - ต้อง git add อีกครั้ง
```

### Option 3: Discard Changes (ระวัง!)

```bash
# ย้อนกลับ commit และลบการเปลี่ยนแปลงทั้งหมด
git reset --hard HEAD~1

# ⚠️ คำเตือน: การเปลี่ยนแปลงจะหายไปทั้งหมด!
# ใช้เฉพาะเมื่อแน่ใจว่าต้องการลบจริงๆ
```

---

## Revert Last Commit (Pushed)

### Scenario: Commit แล้ว push ไป GitHub แล้ว

### วิธีที่ 1: Revert (แนะนำ)

```bash
# สร้าง commit ใหม่ที่ย้อนกลับการเปลี่ยนแปลง
git revert HEAD

# เปิด editor เพื่อแก้ไข commit message
# หรือใช้:
git revert HEAD --no-edit

# Push
git push origin main
```

**ข้อดี:**
- เก็บ commit history ไว้
- ปลอดภัย (ไม่ rewrite history)
- ทำงานได้ดีกับ team

### วิธีที่ 2: Reset + Force Push (ระวัง!)

```bash
# ย้อนกลับ commit
git reset --hard HEAD~1

# Force push (⚠️ ระวัง! จะ rewrite history)
git push origin main --force

# ⚠️ คำเตือน: 
# - ใช้เฉพาะเมื่อทำงานคนเดียว
# - ห้ามใช้ถ้ามีคนอื่น pull ไปแล้ว
```

---

## Revert Specific Commit

### Step 1: ดู Commit History

```bash
git log --oneline
```

Output:
```
a1b2c3d feat: add work order detail page
d4e5f6g feat: add customer quick add
g7h8i9j fix: resolve WO_ID generation bug
j0k1l2m feat: initial work order reception system
```

### Step 2: Revert Commit ที่ต้องการ

```bash
# Revert commit d4e5f6g
git revert d4e5f6g

# หรือ revert หลาย commit
git revert d4e5f6g g7h8i9j
```

### Step 3: Push

```bash
git push origin main
```

---

## Revert Merge

### Scenario: Merge branch แล้วต้องการ revert

```bash
# Revert merge commit
git revert -m 1 <merge-commit-hash>

# -m 1 หมายถึง revert ไป main branch (parent 1)
```

### Example

```bash
# ดู merge commit
git log --oneline --graph

# Output:
# *   a1b2c3d Merge branch 'feature/work-order-detail'
# |\
# | * d4e5f6g feat: add work order detail page
# | * g7h8i9j feat: add work order timeline
# * | j0k1l2m fix: resolve dashboard bug
# |/
# * k3l4m5n feat: add work order list

# Revert merge
git revert -m 1 a1b2c3d

# Push
git push origin main
```

---

## View What Changed

### ดูการเปลี่ยนแปลงใน Commit

```bash
# ดูการเปลี่ยนแปลงใน commit ล่าสุด
git show HEAD

# ดูการเปลี่ยนแปลงใน commit ใดๆ
git show <commit-hash>

# ดูการเปลี่ยนแปลงแบบสั้น
git show --stat <commit-hash>
```

### เปรียบเทียบระหว่าง Commits

```bash
# เปรียบเทียบ commit 2 commit
git diff <commit-1> <commit-2>

# เปรียบเทียบ commit กับ working directory
git diff <commit-hash>

# เปรียบเทียบ commit กับ staging area
git diff --staged
```

### ดูไฟล์ที่เปลี่ยนแปลง

```bash
# ดูไฟล์ที่เปลี่ยนใน commit
git show --name-only <commit-hash>

# ดูไฟล์ที่เปลี่ยนระหว่าง commits
git diff --name-only <commit-1> <commit-2>
```

---

## Best Practices

### ✅ Do

- ✅ ใช้ `git revert` เมื่อ push ไป GitHub แล้ว
- ✅ ใช้ `git reset --soft` เมื่อยังไม่ได้ push (เก็บ changes)
- ✅ ดู commit history ก่อน revert
- ✅ Backup ก่อน revert (สร้าง branch)
- ✅ Test หลัง revert
- ✅ Commit และ push หลัง revert

### ❌ Don't

- ❌ ใช้ `git reset --hard` เมื่อ push แล้ว (ใช้ revert แทน)
- ❌ Force push เมื่อมีคนอื่นทำงานด้วย
- ❌ Revert โดยไม่ดู commit history
- ❌ Revert หลาย commit พร้อมกันโดยไม่ตรวจสอบ

---

## Step-by-Step Revert Process

### Scenario: Commit แล้วพบบั๊ก ต้องการย้อนกลับ

```bash
# 1. ดู commit history
git log --oneline -5

# 2. ตรวจสอบว่า commit นี้ push ไปแล้วหรือยัง
git log origin/main..HEAD

# 3a. ถ้ายังไม่ได้ push
git reset --soft HEAD~1
# แก้ไขโค้ด
git commit -m "fix: correct implementation"

# 3b. ถ้า push ไปแล้ว
git revert HEAD
git push origin main
```

---

## Common Scenarios

### Scenario 1: Commit ผิด branch

```bash
# 1. ดู commit ที่ต้องการย้อนกลับ
git log --oneline

# 2. จำ commit hash

# 3. กลับไป branch ที่ถูกต้อง
git checkout main

# 4. Cherry-pick commit
git cherry-pick <commit-hash>

# 5. กลับไป branch ผิด
git checkout feature/xxx

# 6. Reset
git reset --hard HEAD~1
```

### Scenario 2: Commit message ผิด

```bash
# แก้ไข commit message ล่าสุด
git commit --amend -m "feat: correct commit message"

# ถ้ายังไม่ได้ push
git push origin main

# ถ้า push ไปแล้ว (ต้อง force push)
git push origin main --force
```

### Scenario 3: Commit ไฟล์ที่ไม่ต้องการ

```bash
# 1. ย้อนกลับ commit
git reset --soft HEAD~1

# 2. Unstage ไฟล์ที่ไม่ต้องการ
git reset HEAD <unwanted-file>

# 3. Commit อีกครั้ง
git commit -m "feat: add feature (without unwanted files)"
```

---

## Helper Script

### ใช้ Helper Script

```bash
# Interactive revert script
npm run git:revert
```

Script จะ:
1. แสดง commit history ล่าสุด
2. ให้เลือก commit ที่ต้องการ revert
3. ยืนยันก่อน revert
4. Revert และ push

---

## Troubleshooting

### Revert มี Conflicts

```bash
# 1. Revert
git revert <commit-hash>

# 2. แก้ไข conflicts
# เปิดไฟล์ที่มี conflicts
# แก้ไข conflicts

# 3. Stage files
git add .

# 4. Continue revert
git revert --continue

# หรือยกเลิก
git revert --abort
```

### Revert หลาย Commit

```bash
# Revert range (ไม่รวม commit แรก)
git revert <oldest-commit>^..<newest-commit>

# หรือ revert ทีละ commit (จากใหม่ไปเก่า)
git revert <newest-commit>
git revert <middle-commit>
git revert <oldest-commit>
```

---

## Quick Reference

```bash
# View history
git log --oneline

# Revert last commit (not pushed)
git reset --soft HEAD~1      # Keep changes
git reset --hard HEAD~1      # Discard changes

# Revert last commit (pushed)
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Revert merge
git revert -m 1 <merge-commit-hash>

# View changes
git show <commit-hash>
git diff <commit-1> <commit-2>
```

---

## Need Help?

- ดู workflow guide: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
- ดู commit convention: [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md)
- GitHub Repository: https://github.com/ton-apicha/asic-repair-manager-pro

