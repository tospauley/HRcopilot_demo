# Safe Unicode File Editor for PowerShell
# Prevents accidental file deletions when editing files with special characters
# Usage: .\safe-unicode-edit.ps1 -File "path\to\file.tsx" -BackupDir "backups"

param(
    [Parameter(Mandatory=$true)]
    [string]$File,
    
    [string]$BackupDir = ".\backups",
    
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [string]$Content
)

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Generate timestamp for backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDir "$(Split-Path $File -Leaf).$timestamp.backup"

function Backup-File {
    param([string]$SourceFile)
    
    if (Test-Path $SourceFile) {
        $fileSize = (Get-Item $SourceFile).Length
        Write-Host "Backing up $SourceFile ($fileSize bytes) to $backupFile" -ForegroundColor Yellow
        
        # Create backup with UTF-8 encoding
        Get-Content $SourceFile -Encoding UTF8 | Set-Content $backupFile -Encoding UTF8
        
        if (Test-Path $backupFile) {
            $backupSize = (Get-Item $backupFile).Length
            Write-Host "Backup created: $backupFile ($backupSize bytes)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Failed to create backup!" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "Source file does not exist: $SourceFile" -ForegroundColor Red
        return $false
    }
}

function Restore-Backup {
    param([string]$TargetFile)
    
    if (Test-Path $backupFile) {
        Write-Host "Restoring from backup: $backupFile" -ForegroundColor Yellow
        Get-Content $backupFile -Encoding UTF8 | Set-Content $TargetFile -Encoding UTF8
        
        if (Test-Path $TargetFile) {
            $restoredSize = (Get-Item $TargetFile).Length
            Write-Host "Restored: $TargetFile ($restoredSize bytes)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Failed to restore!" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "No backup found to restore from" -ForegroundColor Red
        return $false
    }
}

function Edit-File {
    param([string]$TargetFile, [string]$NewContent)
    
    # Always backup before editing
    if (-not (Backup-File -SourceFile $TargetFile)) {
        return $false
    }
    
    try {
        Write-Host "Editing $TargetFile with UTF-8 encoding" -ForegroundColor Yellow
        
        # Write content with UTF-8 encoding
        $NewContent | Set-Content $TargetFile -Encoding UTF8 -Force
        
        if (Test-Path $TargetFile) {
            $newSize = (Get-Item $TargetFile).Length
            Write-Host "File updated: $TargetFile ($newSize bytes)" -ForegroundColor Green
            
            # Verify the file is not empty
            if ($newSize -eq 0) {
                Write-Host "WARNING: File is 0 bytes! Restoring from backup..." -ForegroundColor Red
                Restore-Backup -TargetFile $TargetFile
                return $false
            }
            
            return $true
        } else {
            Write-Host "File disappeared after edit! Restoring..." -ForegroundColor Red
            Restore-Backup -TargetFile $TargetFile
            return $false
        }
    } catch {
        Write-Host "Error editing file: $_" -ForegroundColor Red
        Write-Host "Restoring from backup..." -ForegroundColor Yellow
        Restore-Backup -TargetFile $TargetFile
        return $false
    }
}

function Verify-File {
    param([string]$TargetFile)
    
    if (Test-Path $TargetFile) {
        $fileSize = (Get-Item $TargetFile).Length
        $content = Get-Content $TargetFile -Encoding UTF8 -Raw
        
        Write-Host "File: $TargetFile" -ForegroundColor Cyan
        Write-Host "Size: $fileSize bytes" -ForegroundColor Cyan
        
        # Check for Unicode characters
        $unicodeChars = [regex]::Matches($content, '[^\u0000-\u007F]')
        if ($unicodeChars.Count -gt 0) {
            Write-Host "Contains $($unicodeChars.Count) Unicode characters" -ForegroundColor Green
            foreach ($match in $unicodeChars | Select-Object -First 5) {
                Write-Host "  Char: '$($match.Value)' (U+$([Convert]::ToString([int][char]$match.Value, 16).PadLeft(4, '0')))" -ForegroundColor Gray
            }
        } else {
            Write-Host "No Unicode characters found" -ForegroundColor Yellow
        }
        
        return $true
    } else {
        Write-Host "File not found: $TargetFile" -ForegroundColor Red
        return $false
    }
}

# Main execution
switch ($Action.ToLower()) {
    "backup" {
        Backup-File -SourceFile $File
    }
    "edit" {
        if (-not $Content) {
            Write-Host "Error: -Content parameter required for edit action" -ForegroundColor Red
            exit 1
        }
        Edit-File -TargetFile $File -NewContent $Content
    }
    "restore" {
        Restore-Backup -TargetFile $File
    }
    "verify" {
        Verify-File -TargetFile $File
    }
    default {
        Write-Host "Invalid action. Use: backup, edit, restore, or verify" -ForegroundColor Red
        Write-Host "Example: .\safe-unicode-edit.ps1 -File 'demoData.ts' -Action verify" -ForegroundColor Yellow
        Write-Host "Example: .\safe-unicode-edit.ps1 -File 'demoData.ts' -Action edit -Content 'export const DEMO_DATA = \"test\"'" -ForegroundColor Yellow
    }
}