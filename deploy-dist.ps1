# 构建并推送 dist 到新分支的 PowerShell 脚本
# 用法: .\deploy-dist.ps1 [分支名] [BASE_URL]
# 示例: .\deploy-dist.ps1 dist /music-player/

param(
    [string]$BranchName = "dist",
    [string]$BaseUrl = "/music-player/"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 构建并推送到分支: $BranchName" -ForegroundColor Cyan
Write-Host "📁 部署路径: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 保存当前分支
$CurrentBranch = git branch --show-current
Write-Host "📌 当前分支: $CurrentBranch" -ForegroundColor Yellow

# 安装依赖（如果需要）
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    npm ci
}

# 构建项目
Write-Host "🔨 开始构建..." -ForegroundColor Yellow
$env:BASE_URL = $BaseUrl
npm run build

# 检查 dist 目录
if (-not (Test-Path "dist")) {
    Write-Host "❌ 错误: dist 目录不存在" -ForegroundColor Red
    exit 1
}

# 创建临时分支
Write-Host "🌿 创建临时分支: temp-dist-branch" -ForegroundColor Yellow
git checkout --orphan temp-dist-branch

# 添加 dist 内容到根目录
Write-Host "📂 添加 dist 文件..." -ForegroundColor Yellow
git rm -rf .
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# 添加 .gitignore 排除不需要的文件
@"
node_modules/
.gitignore
deploy-dist.sh
deploy-dist.ps1
src/
public/
*.md
*.json
!manifest.json
index.html
vite.config.js
.github/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

# 添加所有文件
git add -A

# 提交
Write-Host "💾 提交更改..." -ForegroundColor Yellow
$DateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "deploy: build output from $CurrentBranch ($DateStr)"

# 删除远程旧分支（如果存在）
$RemoteExists = git ls-remote --heads origin $BranchName
if ($RemoteExists) {
    Write-Host "🗑️  删除远程旧分支: $BranchName" -ForegroundColor Yellow
    git push origin --delete $BranchName
}

# 删除本地旧分支（如果存在）
$LocalExists = git branch --list $BranchName
if ($LocalExists) {
    Write-Host "🗑️  删除本地旧分支: $BranchName" -ForegroundColor Yellow
    git branch -D $BranchName
}

# 重命名为目标分支
Write-Host "🏷️  重命名为: $BranchName" -ForegroundColor Yellow
git branch -m $BranchName

# 推送到远程
Write-Host "📤 推送到远程..." -ForegroundColor Yellow
git push -u origin $BranchName --force

# 切回原分支
Write-Host "🔙 切回原分支: $CurrentBranch" -ForegroundColor Yellow
git checkout $CurrentBranch

# 清理临时分支
git branch -D $BranchName 2>$null

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 完成！已推送到分支: $BranchName" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
