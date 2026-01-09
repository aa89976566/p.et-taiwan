#!/bin/bash

# 前端快速提交腳本
# 使用方法: ./前端提交.sh "你的提交訊息"

echo "🚀 前端代碼提交流程"
echo "===================="

# 檢查是否有提交訊息
if [ -z "$1" ]; then
    echo "❌ 請提供提交訊息"
    echo "使用方法: ./前端提交.sh \"你的提交訊息\""
    exit 1
fi

COMMIT_MSG="前端: $1"

echo ""
echo "📥 步驟 1/4: 拉取最新代碼..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "⚠️  拉取失敗，可能有衝突。請先解決衝突後再試。"
    exit 1
fi

echo ""
echo "📋 步驟 2/4: 檢查修改狀態..."
git status --short

echo ""
echo "➕ 步驟 3/4: 添加所有更改..."
git add .

echo ""
echo "💾 步驟 4/4: 提交更改..."
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 提交成功！"
    echo ""
    echo "📤 是否要推送到 GitHub? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo ""
        echo "📤 正在推送到 GitHub..."
        git push origin main
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 完成！代碼已成功推送到 GitHub"
        else
            echo ""
            echo "❌ 推送失敗，請檢查網路連接或認證設定"
        fi
    else
        echo ""
        echo "💡 提示: 使用 'git push origin main' 手動推送"
    fi
else
    echo ""
    echo "❌ 提交失敗"
    exit 1
fi
