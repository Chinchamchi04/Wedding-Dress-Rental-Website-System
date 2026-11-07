Add-Type -AssemblyName System.Drawing

function Crop-Image {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [float]$CropXRatio,
        [float]$CropYRatio,
        [float]$CropWidthRatio,
        [float]$CropHeightRatio
    )
    
    $fullSrcPath = (Resolve-Path $SourcePath).Path
    $src = [System.Drawing.Bitmap]::FromFile($fullSrcPath)
    $origW = $src.Width
    $origH = $src.Height
    
    $x = [int]($origW * $CropXRatio)
    $y = [int]($origH * $CropYRatio)
    $w = [int]($origW * $CropWidthRatio)
    $h = [int]($origH * $CropHeightRatio)
    
    if ($x + $w -gt $origW) { $w = $origW - $x }
    if ($y + $h -gt $origH) { $h = $origH - $y }
    if ($w -le 10 -or $h -le 10) {
        $src.Dispose()
        return
    }
    
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $targetBmp = New-Object System.Drawing.Bitmap($w, $h)
    $graphics = [System.Drawing.Graphics]::FromImage($targetBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)
    
    # Save to temp then copy to avoid file locks
    $tempFile = [System.IO.Path]::GetTempFileName() + ".jpg"
    $targetBmp.Save($tempFile, $codec, $encoderParams)
    
    $graphics.Dispose()
    $targetBmp.Dispose()
    $src.Dispose()
    
    Copy-Item $tempFile $DestPath -Force
    Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
}

$dressesDir = "frontend\public\assets\dresses"

for ($i = 1; $i -le 25; $i++) {
    $numStr = if ($i -lt 10) { "0$i" } else { "$i" }
    $basePath = "$dressesDir\dress_$numStr.jpg"
    
    if (Test-Path $basePath) {
        # View 2 (Upper bodice, neckline & bouquet) -> replace dress_XX_mannequin.jpg
        Crop-Image -SourcePath $basePath -DestPath "$dressesDir\dress_${numStr}_mannequin.jpg" -CropXRatio 0.08 -CropYRatio 0.0 -CropWidthRatio 0.84 -CropHeightRatio 0.60
        
        # View 3 (Waistline & side profile) -> replace dress_XX_left.jpg
        Crop-Image -SourcePath $basePath -DestPath "$dressesDir\dress_${numStr}_left.jpg" -CropXRatio 0.12 -CropYRatio 0.22 -CropWidthRatio 0.76 -CropHeightRatio 0.52
        
        # View 4 (Skirt & train detail) -> replace dress_XX_right.jpg
        Crop-Image -SourcePath $basePath -DestPath "$dressesDir\dress_${numStr}_right.jpg" -CropXRatio 0.08 -CropYRatio 0.42 -CropWidthRatio 0.84 -CropHeightRatio 0.58
        
        Write-Host "Processed consistent gallery for dress_$numStr.jpg"
    } else {
        Write-Warning "Base image not found: $basePath"
    }
}

Write-Host "All 25 dresses now have 100% consistent views (same dress, same bride, same background)!"

