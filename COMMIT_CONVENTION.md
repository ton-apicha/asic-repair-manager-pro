# Commit Message Convention

คู่มือการเขียน commit message ที่ถูกต้องและสม่ำเสมอ

## 📋 สารบัญ

1. [Format](#format)
2. [Types](#types)
3. [Subject](#subject)
4. [Body](#body)
5. [Footer](#footer)
6. [Examples](#examples)
7. [Best Practices](#best-practices)

---

## Format

```
<type>: <subject>

[optional body]

[optional footer]
```

### ตัวอย่าง

```
feat: add work order reception system

Implement work order creation with WO_ID generation (YYMMDDXXX format).
Includes customer and device quick add functionality.

Closes #123
```

---

## Types

### `feat` - New Feature

เพิ่มฟีเจอร์ใหม่

```bash
feat: add work order reception system
feat: implement customer quick add functionality
feat: add dashboard with real-time KPIs
```

### `fix` - Bug Fix

แก้ไขบั๊ก

```bash
fix: resolve WO_ID generation sequence bug
fix: correct customer search functionality
fix: handle null values in dashboard API
```

### `refactor` - Code Refactoring

ปรับปรุงโค้ดโดยไม่เปลี่ยนการทำงาน

```bash
refactor: improve customer service structure
refactor: reorganize component folder structure
refactor: extract common validation logic
```

### `docs` - Documentation

แก้ไขเอกสาร

```bash
docs: update README with setup instructions
docs: add GIT_WORKFLOW.md guide
docs: update API documentation
```

### `style` - Code Style

แก้ไขรูปแบบโค้ด (formatting, spacing, semicolons)

```bash
style: format code with prettier
style: fix indentation in WorkOrderController
style: remove unused imports
```

### `test` - Tests

เพิ่มหรือแก้ไข tests

```bash
test: add unit tests for WorkOrderController
test: add integration tests for customer API
test: fix flaky dashboard tests
```

### `chore` - Maintenance

งานบำรุงรักษา (dependencies, config, build)

```bash
chore: update dependencies
chore: configure pre-commit hooks
chore: update Docker configuration
```

---

## Subject

### Guidelines

1. **ใช้ภาษาอังกฤษ** (lowercase)
2. **ไม่ต้องใส่ period (.)** ที่ท้าย
3. **ใช้ imperative mood** (เหมือน "Add feature" ไม่ใช่ "Added feature")
4. **สั้นและกระชับ** (ไม่เกิน 50-72 characters)
5. **อธิบายว่า "ทำอะไร"** ไม่ใช่ "ทำไม"

### ✅ Good Examples

```
feat: add work order list page
fix: resolve type error in CustomerService
refactor: simplify authentication logic
docs: update deployment guide
```

### ❌ Bad Examples

```
feat: Added work order list page          # ใช้ past tense
fix: fixing type error                   # ไม่ชัดเจน
refactor: refactoring code                # ไม่บอกว่าทำอะไร
update README                             # ไม่มี type
```

---

## Body

### เมื่อไหร่ควรใช้ Body

- อธิบายเพิ่มเติมว่า "ทำอะไร" และ "ทำไม"
- ใช้เมื่อ subject ไม่พออธิบาย
- แยกด้วย blank line จาก subject

### Format

```
feat: add work order reception system

Implement work order creation with the following features:
- WO_ID generation with YYMMDDXXX format
- Customer quick add functionality
- Device quick add functionality
- Real-time validation
- Auto-push to GitHub after commit
```

---

## Footer

### Breaking Changes

```
feat: change API response format

BREAKING CHANGE: API now returns data in different structure.
Old format: { workOrder: {...} }
New format: { data: { workOrder: {...} } }
```

### Issue References

```
fix: resolve WO_ID generation bug

Fixes #123
Closes #456
Refs #789
```

---

## Examples

### Simple Commit

```bash
feat: add work order list page
```

### Commit with Body

```bash
feat: implement customer quick add

Add inline form for quickly creating customers during work order creation.
Includes real-time validation and error handling.
```

### Commit with Footer

```bash
fix: resolve WO_ID generation sequence bug

Fix issue where WO_ID sequence was not incrementing correctly when
multiple work orders were created on the same day.

Fixes #45
```

### Breaking Change

```bash
feat: refactor API response structure

BREAKING CHANGE: All API responses now follow new structure:
- Success: { success: true, data: {...} }
- Error: { success: false, error: {...} }

Migration guide available in docs/MIGRATION.md
```

### Multiple Changes

```bash
feat: add work order reception system

- Implement WO_ID generation (YYMMDDXXX format)
- Add customer quick add component
- Add device quick add component
- Create work order form with validation
- Update WorkOrdersPage with DataGrid
```

---

## Best Practices

### ✅ Do

- ✅ ใช้ type ที่เหมาะสม
- ✅ เขียน subject ให้ชัดเจน
- ✅ ใช้ภาษาอังกฤษ
- ✅ Commit บ่อยๆ (ทุก feature/bug fix)
- ✅ ใช้ body เมื่อจำเป็นต้องอธิบายเพิ่มเติม
- ✅ Reference issues เมื่อมี

### ❌ Don't

- ❌ ใช้ commit message ที่สั้นเกินไป ("update", "fix")
- ❌ ใช้ past tense ("Added", "Fixed")
- ❌ Commit หลายๆ เรื่องใน commit เดียว
- ❌ Commit ไฟล์ที่ยังทำงานไม่เสร็จ
- ❌ Commit ไฟล์ที่ไม่ได้เกี่ยวข้องกัน

---

## Commit Message Template

ใช้ template นี้เมื่อ commit:

```
<type>: <subject>

<what changed>
<why changed (if needed)>

<references (if any)>
```

### Example Template

```
feat: <subject>

<description of what was added>

<optional: closes #issue>
```

---

## Quick Reference

### Type Selection Guide

| Situation | Type |
|-----------|------|
| เพิ่มฟีเจอร์ใหม่ | `feat` |
| แก้ไขบั๊ก | `fix` |
| ปรับปรุงโค้ด | `refactor` |
| แก้ไขเอกสาร | `docs` |
| แก้ไขรูปแบบ | `style` |
| เพิ่ม/แก้ไข tests | `test` |
| อัพเดท dependencies | `chore` |

### Common Patterns

```bash
# Feature
feat: add <feature name>

# Bug fix
fix: resolve <bug description>

# Refactor
refactor: improve <component/service name>

# Documentation
docs: update <document name>

# Style
style: format <file/component name>

# Test
test: add tests for <component name>

# Chore
chore: update <dependency/config name>
```

---

## Tools

### VS Code

- ใช้ commit message template (`.gitmessage`)
- Auto-complete จาก history

### Command Line

```bash
# ใช้ template
git commit

# หรือระบุ message โดยตรง
git commit -m "feat: add work order reception system"
```

---

## Need Help?

- ดู workflow guide: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
- ดู revert guide: [REVERT_GUIDE.md](./REVERT_GUIDE.md)

