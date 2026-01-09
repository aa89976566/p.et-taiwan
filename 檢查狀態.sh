#!/bin/bash

# Git 狀態檢查腳本
# 快速查看當前修改狀態

echo "📊 Git 狀態檢查"
echo "================"
echo ""

echo "📋 當前分支:"
git branch --show-current
echo ""

echo "📝 修改的文件:"
git status --short
echo ""

echo "📈 未提交的更改統計:"
echo "新增/修改的行數:"
git diff --stat
echo ""

echo "🔍 最近 5 次提交記錄:"
git log --oneline -5
echo ""

echo "💡 提示:"
echo "  - 使用 './前端提交.sh \"訊息\"' 提交前端更改"
echo "  - 使用 './後台提交.sh \"訊息\"' 提交後台更改"
echo "  - 使用 'git diff' 查看詳細更改內容"
