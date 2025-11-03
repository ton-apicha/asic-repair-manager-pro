# Git Workflow Guide

คู่มือการใช้งาน Git สำหรับโปรเจค ASIC Repair Pro

## 📋 สารบัญ

1. [Daily Workflow](#daily-workflow)
2. [Branching Strategy](#branching-strategy)
3. [Commit Message Format](#commit-message-format)
4. [How to Commit](#how-to-commit)
5. [How to Push](#how-to-push)
6. [How to Revert](#how-to-revert)
7. [How to Create Branches](#how-to-create-branches)
8. [How to Merge Branches](#how-to-merge-branches)
9. [How to Create Tags](#how-to-create-tags)
10. [VS Code Git Integration](#vs-code-git-integration)

---

## Daily Workflow

### 1. เริ่มทำงานใหม่

```bash
# ตรวจสอบว่าอยู่ใน branch main
git checkout main

# ดึงข้อมูลล่าสุดจาก GitHub
git pull origin main

# สร้าง branch ใหม่สำหรับงานที่ทำ
git checkout -b feature/work-order-detail
```

### 2. ทำงานและ commit

```bash
# ดูสถานะการเปลี่ยนแปลง
git status

# เพิ่มไฟล์ที่เปลี่ยนแปลง
git add .

# หรือเพิ่มเฉพาะไฟล์ที่ต้องการ
git add frontend/src/pages/WorkOrdersPage.tsx

# Commit (pre-commit hooks จะรันทดสอบอัตโนมัติ)
git commit -m "feat: add work order list page with DataGrid"
```

### 3. Push ไป GitHub

```bash
# Push branch ไป GitHub
git push origin feature/work-order-detail

# หรือใช้ auto-push (ดูใน Helper Scripts)
npm run git:push
```

### 4. Merge กลับ main

```bash
# กลับไป main
git checkout main

# ดึงข้อมูลล่าสุด
git pull origin main

# Merge branch ที่ทำเสร็จแล้ว
git merge feature/work-order-detail

# Push ไป GitHub
git push origin main

# ลบ branch ที่ไม่ใช้แล้ว
git branch -d feature/work-order-detail
```

---

## Branching Strategy

### Main Branches

- **`main`**: โค้ดที่พร้อมใช้งานจริง (Production-ready)
  - ควร merge เฉพาะเมื่อทำงานเสร็จและทดสอบแล้ว
  - ไม่ควร commit ตรงๆ ใน main

### Feature Branches

- **Naming**: `feature/description`
- **Examples**: 
  - `feature/work-order-reception`
  - `feature/customer-management`
  - `feature/dashboard-analytics`

**Workflow:**
```bash
# สร้าง branch
git checkout -b feature/work-order-detail

# ทำงาน...
# Commit...

# Merge กลับ main
git checkout main
git merge feature/work-order-detail
git push origin main
```

### Fix Branches

- **Naming**: `fix/description`
- **Examples**:
  - `fix/wo-id-generation`
  - `fix/login-validation`
  - `fix/dashboard-loading`

**Workflow:** เหมือน feature branches

### Hotfix Branches

- **Naming**: `hotfix/description`
- **Examples**: `hotfix/critical-bug`
- **ใช้เมื่อ:** ต้องแก้ไขด่วนใน production

**Workflow:**
```bash
# สร้างจาก main
git checkout main
git checkout -b hotfix/critical-bug

# แก้ไข...
# Commit...
# Merge และ Tag
git checkout main
git merge hotfix/critical-bug
git tag -a v1.0.1 -m "Hotfix: critical bug fix"
git push origin main --tags
```

---

## Commit Message Format

### Format

```
<type>: <subject>

[optional body]
```

### Types

- `feat`: เพิ่มฟีเจอร์ใหม่
- `fix`: แก้ไขบั๊ก
- `refactor`: ปรับปรุงโค้ด (ไม่เปลี่ยนการทำงาน)
- `docs`: แก้ไขเอกสาร
- `style`: แก้ไขรูปแบบ (formatting, spacing)
- `test`: เพิ่ม/แก้ไข tests
- `chore`: งานบำรุงรักษา (dependencies, config)

### Examples

```bash
# Feature
git commit -m "feat: add work order reception system"

# Bug fix
git commit -m "fix: resolve WO_ID generation sequence bug"

# Refactor
git commit -m "refactor: improve customer service structure"

# Documentation
git commit -m "docs: update GIT_WORKFLOW.md with revert guide"

# Style
git commit -m "style: format code with prettier"

# Test
git commit -m "test: add unit tests for WorkOrderController"

# Chore
git commit -m "chore: update dependencies"
```

**ดูรายละเอียดเพิ่มเติมใน:** [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md)

---

## How to Commit

### วิธีที่ 1: ใช้ VS Code (แนะนำ)

1. เปิด Source Control panel (Ctrl+Shift+G)
2. ดูไฟล์ที่เปลี่ยนแปลง
3. คลิก + เพื่อ stage ไฟล์
4. พิมพ์ commit message
5. คลิก ✓ เพื่อ commit
6. Pre-commit hooks จะรันทดสอบอัตโนมัติ

### วิธีที่ 2: ใช้ Command Line

```bash
# ดูสถานะ
git status

# เพิ่มไฟล์ทั้งหมด
git add .

# หรือเพิ่มเฉพาะไฟล์ที่ต้องการ
git add frontend/src/pages/WorkOrdersPage.tsx

# Commit
git commit -m "feat: add work order list page"
```

### วิธีที่ 3: ใช้ Helper Script

```bash
npm run git:commit
```

---

## How to Push

### วิธีที่ 1: ใช้ VS Code

1. หลังจาก commit แล้ว
2. คลิก ... ที่ Source Control panel
3. เลือก "Push"

### วิธีที่ 2: ใช้ Command Line

```bash
# Push branch ปัจจุบัน
git push origin <branch-name>

# Push branch ปัจจุบัน (auto-detect)
git push

# Push และตั้ง upstream
git push -u origin <branch-name>
```

### วิธีที่ 3: ใช้ Helper Script

```bash
npm run git:push
```

---

## How to Revert

**ดูรายละเอียดเพิ่มเติมใน:** [REVERT_GUIDE.md](./REVERT_GUIDE.md)

### Revert Last Commit (ยังไม่ได้ push)

```bash
# ย้อนกลับ commit ล่าสุด (เก็บการเปลี่ยนแปลง)
git reset --soft HEAD~1

# ย้อนกลับ commit ล่าสุด (ลบการเปลี่ยนแปลง)
git reset --hard HEAD~1
```

### Revert Last Commit (push แล้ว)

```bash
# สร้าง commit ใหม่ที่ย้อนกลับการเปลี่ยนแปลง
git revert HEAD

# Push
git push origin main
```

### Revert Specific Commit

```bash
# ดู commit history
git log --oneline

# Revert commit ที่ต้องการ
git revert <commit-hash>

# Push
git push origin main
```

---

## How to Create Branches

### วิธีที่ 1: ใช้ VS Code

1. คลิก branch name ที่左下角
2. เลือก "Create new branch"
3. ตั้งชื่อ branch (เช่น `feature/work-order-detail`)
4. Enter

### วิธีที่ 2: ใช้ Command Line

```bash
# สร้าง branch ใหม่
git checkout -b feature/work-order-detail

# หรือสร้าง branch โดยไม่ switch
git branch feature/work-order-detail

# Switch ไป branch
git checkout feature/work-order-detail
```

### วิธีที่ 3: ใช้ Helper Script

```bash
npm run git:branch
```

---

## How to Merge Branches

### Merge Feature Branch into Main

```bash
# กลับไป main
git checkout main

# ดึงข้อมูลล่าสุด
git pull origin main

# Merge branch
git merge feature/work-order-detail

# Push
git push origin main

# ลบ branch ที่ไม่ใช้แล้ว
git branch -d feature/work-order-detail
git push origin --delete feature/work-order-detail
```

### Merge ใน VS Code

1. Switch ไป main branch
2. คลิก ... ที่ Source Control
3. เลือก "Merge Branch"
4. เลือก branch ที่ต้องการ merge

---

## How to Create Tags

### Create Version Tag

```bash
# สร้าง tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag ไป GitHub
git push origin v1.0.0

# หรือ push all tags
git push origin --tags
```

### ใช้ Helper Script

```bash
npm run git:tag
```

### View Tags

```bash
# ดูรายการ tags
git tag

# ดู tag details
git show v1.0.0
```

### Delete Tag

```bash
# ลบ tag ใน local
git tag -d v1.0.0

# ลบ tag ใน GitHub
git push origin --delete v1.0.0
```

---

## VS Code Git Integration

### Recommended Extensions

1. **GitLens** - ดู commit history และ blame
2. **GitHub Pull Requests** - จัดการ Pull Requests
3. **Git Graph** - ดู branch graph แบบ visual

### Settings

ไฟล์ `.vscode/settings.json` จะตั้งค่า Git ให้เหมาะสมแล้ว:
- Auto fetch
- Confirmation settings
- Source control settings

### Keyboard Shortcuts

- **Ctrl+Shift+G**: เปิด Source Control panel
- **Ctrl+K, Ctrl+S**: ดู keyboard shortcuts

### Common Tasks in VS Code

1. **Commit:**
   - เปิด Source Control (Ctrl+Shift+G)
   - Stage files (+)
   - พิมพ์ commit message
   - Commit (✓)

2. **Push:**
   - หลังจาก commit
   - คลิก ... → Push

3. **View History:**
   - คลิกขวาที่ไฟล์ → "Open Timeline"
   - หรือใช้ GitLens extension

4. **Compare Changes:**
   - คลิกไฟล์ใน Source Control
   - ดู diff

---

## Troubleshooting

### Pre-commit Hooks Failed

ถ้า pre-commit hooks fail (เช่น TypeScript errors):

1. แก้ไข errors ที่แสดง
2. Commit อีกครั้ง

### Merge Conflicts

ถ้ามี merge conflicts:

1. VS Code จะแสดง conflict markers
2. แก้ไข conflicts
3. Stage files
4. Commit

### Can't Push

```bash
# ดึงข้อมูลล่าสุดก่อน
git pull origin main

# แก้ไข conflicts ถ้ามี
# แล้ว push อีกครั้ง
git push origin main
```

---

## Best Practices

1. ✅ Commit บ่อยๆ (ทุกครั้งที่ทำงานเสร็จ)
2. ✅ ใช้ commit message ที่ชัดเจน
3. ✅ สร้าง branch สำหรับงานใหม่
4. ✅ Test ก่อน commit (pre-commit hooks จะช่วย)
5. ✅ Push ไป GitHub ทุกครั้งที่ commit
6. ✅ ไม่ commit ไฟล์ .env หรือ node_modules
7. ✅ Review code ก่อน merge
8. ✅ สร้าง tag เมื่อ release ใหม่

---

## Quick Reference

```bash
# Daily commands
git status                    # ดูสถานะ
git add .                     # เพิ่มไฟล์ทั้งหมด
git commit -m "message"       # Commit
git push                      # Push

# Branching
git checkout -b feature/xxx    # สร้าง branch ใหม่
git checkout main             # กลับไป main
git merge feature/xxx         # Merge branch

# Tags
git tag -a v1.0.0 -m "msg"   # สร้าง tag
git push origin --tags        # Push tags

# Revert
git revert HEAD               # Revert last commit
git reset --soft HEAD~1       # Undo commit (keep changes)
```

---

## Need Help?

- ดูรายละเอียดเพิ่มเติมใน:
  - [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md)
  - [REVERT_GUIDE.md](./REVERT_GUIDE.md)
- GitHub Repository: https://github.com/ton-apicha/asic-repair-manager-pro

