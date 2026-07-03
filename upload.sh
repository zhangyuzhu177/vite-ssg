#!/bin/bash

# 七牛云配置
AK="YO6sRouk-x9NhEJZJ7ameodax-zWlObe6EqfHQK9"
SK="YR0NMZRcdPsXpNDXYzLDGWUHy0UVWjnqDpQXfLv0"
BUCKET="youzan-fansquan"
CDN_BASE="https://youzan.myfans.cc/web_view_dist"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="${SCRIPT_DIR}/dist"

# 检查 dist 目录是否存在
if [ ! -d "$DIST_DIR" ]; then
    echo "错误：dist 目录不存在，请先运行 'npm run build'"
    exit 1
fi

# 检查 assets 和 fonts 目录是否存在
if [ ! -d "$DIST_DIR/assets" ] && [ ! -d "$DIST_DIR/fonts" ]; then
    echo "错误：dist/assets 和 dist/fonts 目录都不存在"
    exit 1
fi

# 替换 CSS 和 JS 文件中的路径为 CDN 路径
echo "替换 CSS 和 JS 文件中的路径为 CDN 路径..."
for file in "$DIST_DIR/assets"/*.css "$DIST_DIR/assets"/*.js; do
    if [ -f "$file" ]; then
        # 替换 /web_view_dist/ 为 CDN 路径（处理 url() 中的路径，包括带引号和不带引号的情况）
        perl -pi -e "s|url\\(\"/web_view_dist/|url\\(\"${CDN_BASE}/|g" "$file"
        perl -pi -e "s|url\\('/web_view_dist/|url\\('${CDN_BASE}/|g" "$file"
        perl -pi -e "s|url\\(/web_view_dist/|url\\(${CDN_BASE}/|g" "$file"
        perl -pi -e "s|/web_view_dist/assets/|${CDN_BASE}/assets/|g" "$file"
        echo "处理：$file"
    fi
done

# 配置 qshell 账号
echo "配置七牛云账号..."
qshell account "$AK" "$SK" "default"

# 上传到 web_view_dist/ 目录
PREFIX="web_view_dist/"
echo "开始上传到七牛云 bucket: $BUCKET, 目录：$PREFIX"

# 处理 assets 目录
if [ -d "$DIST_DIR/assets" ]; then
    echo "上传 assets 目录..."
    for file in "$DIST_DIR/assets"/*; do
        if [ -f "$file" ]; then
            FILE_NAME=$(basename "$file")
            KEY="${PREFIX}assets/${FILE_NAME}"
            echo "上传：$file => $KEY"
            qshell rput --overwrite "$BUCKET" "$KEY" "$file"
        fi
    done
fi

# 处理 fonts 目录
if [ -d "$DIST_DIR/fonts" ]; then
    echo "上传 fonts 目录..."
    for file in "$DIST_DIR/fonts"/*; do
        if [ -f "$file" ]; then
            FILE_NAME=$(basename "$file")
            KEY="${PREFIX}fonts/${FILE_NAME}"
            echo "上传：$file => $KEY"
            qshell rput --overwrite "$BUCKET" "$KEY" "$file"
        fi
    done
fi

# 处理 logo.png
if [ -f "$DIST_DIR/logo.png" ]; then
    echo "上传 logo.png..."
    KEY="${PREFIX}logo.png"
    echo "上传：$DIST_DIR/logo.png => $KEY"
    qshell rput --overwrite "$BUCKET" "$KEY" "$DIST_DIR/logo.png"
fi

echo "上传完成！"
