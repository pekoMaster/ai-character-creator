# sync_holo.ps1
param (
    [switch]$Resync # 用於第一次同步或修復錯誤
)

$Source = "h:\OneDrive\RB\TRPG\HoloFantasy"
$Dest = "holofantasy_drive:"

# 檢查 Remote 是否存在
$remotes = rclone listremotes
if ($remotes -notcontains "holofantasy_drive:") {
    Write-Host "錯誤: 找不到名為 'holofantasy_drive' 的 remote 設定。" -ForegroundColor Red
    Write-Host "請先執行 'rclone config' 並建立名為 'holofantasy_drive' 的 Google Drive remote。"
    exit 1
}

$ArgsList = @(
    "bisync",
    "`"$Source`"",
    "`"$Dest`"",
    "--create-empty-src-dirs",
    "--compare", "size,modtime,checksum",
    "--verbose",
    "--fix-case",
    "--non-interactive", # 禁止互動提示，自動接受預設值
    "--conflict-resolve", "newer", # 衝突時自動保留較新的檔案
    "--exclude", "sync_holo.ps1", # 排除自己，避免被誤刪或同步
    "--exclude", ".*" # 排除隱藏檔 (如 .git, .gemini)
)

if ($Resync) {
    $ArgsList += "--resync"
    Write-Host "注意: 正在執行強制重新同步 (--resync)..." -ForegroundColor Yellow
}

# 執行指令
$Command = "rclone " + ($ArgsList -join " ")
Write-Host "正在執行: $Command"
Invoke-Expression $Command
