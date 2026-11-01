Add-Type -AssemblyName System.Drawing

$baseDir = "frontend/src/assets"
$outDir = "frontend/public/assets/dresses"
$outDirDist = "frontend/dist/assets/dresses"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}
if (-not (Test-Path $outDirDist)) {
    New-Item -ItemType Directory -Path $outDirDist -Force | Out-Null
}

$logoPath = "frontend/src/assets/images/unibridal-logo-full-transparent.png"
if (-not (Test-Path $logoPath)) {
    $logoPath = "frontend/src/assets/logo.png"
}
$logoImg = [System.Drawing.Image]::FromFile((Resolve-Path $logoPath))

$baseFiles = @(
    "card1_elysian.jpg",
    "card2_celeste.jpg",
    "card3_lumiere.jpg",
    "card4_monet.jpg",
    "card5_aurora.jpg",
    "card6_seraphina.jpg",
    "card6_tiered_princess.jpg",
    "card7_vivienne.jpg",
    "card8_juliette.jpg",
    "card8_lace_dream.jpg",
    "card9_genevieve.jpg",
    "card9_mannequin_atelier.jpg",
    "hero_bride.jpg",
    "lace_detail.jpg",
    "about_atelier_hero.jpg"
)

# Pre-load base images
$baseImages = @()
foreach ($file in $baseFiles) {
    $p = Join-Path $baseDir $file
    if (Test-Path $p) {
        $baseImages += [System.Drawing.Image]::FromFile((Resolve-Path $p))
    }
}

Write-Output "Loaded $($baseImages.Count) base bridal images."

$targetW = 760
$targetH = 1000

for ($i = 1; $i -le 50; $i++) {
    $numStr = $i.ToString("D2")
    $code = "UB-" + $i.ToString("D3")
    
    # Select base image by rotation
    $baseIndex = ($i - 1) % $baseImages.Count
    $base = $baseImages[$baseIndex]
    
    $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Calculate crop region with slight shifting for variation
    $aspect = $targetW / $targetH
    $shiftStep = ($i % 3)
    
    $srcW = $base.Width
    $srcH = [int]($base.Width / $aspect)
    if ($srcH -gt $base.Height) {
        $srcH = $base.Height
        $srcW = [int]($base.Height * $aspect)
    }
    
    $offsetX = [int](($base.Width - $srcW) / 2)
    $offsetY = [int](($base.Height - $srcH) * (0.15 + 0.1 * $shiftStep))
    if ($offsetY + $srcH -gt $base.Height) {
        $offsetY = $base.Height - $srcH
    }
    if ($offsetY -lt 0) { $offsetY = 0 }

    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
    $g.DrawImage($base, $destRect, $offsetX, $offsetY, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Subtle color tint based on collection tone
    $tintIndex = $i % 4
    $tintColor = switch ($tintIndex) {
        0 { [System.Drawing.Color]::FromArgb(18, 230, 160, 175) } # Rose Blush
        1 { [System.Drawing.Color]::FromArgb(16, 235, 210, 165) } # Champagne Gold
        2 { [System.Drawing.Color]::FromArgb(14, 255, 250, 245) } # Pearl Pure
        3 { [System.Drawing.Color]::FromArgb(20, 215, 190, 170) } # Antique Atelier
    }
    $tintBrush = New-Object System.Drawing.SolidBrush($tintColor)
    $g.FillRectangle($tintBrush, $destRect)
    $tintBrush.Dispose()
    
    # Bottom vignette gradient for readability
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, ($targetH - 180))),
        (New-Object System.Drawing.Point(0, $targetH)),
        [System.Drawing.Color]::FromArgb(0, 20, 15, 15),
        [System.Drawing.Color]::FromArgb(180, 20, 15, 15)
    )
    $gradRect = New-Object System.Drawing.Rectangle(0, ($targetH - 180), $targetW, 180)
    $g.FillRectangle($gradBrush, $gradRect)
    $gradBrush.Dispose()
    
    # TOP-RIGHT LUXURY LOGO BADGE
    $logoW = 150
    $logoH = [int]($logoImg.Height * ($logoW / $logoImg.Width))
    $badgeX = $targetW - $logoW - 28
    $badgeY = 24
    
    # Glass pill background for logo
    $pillX = $badgeX - 12
    $pillY = $badgeY - 8
    $pillW = $logoW + 24
    $pillH = $logoH + 16
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215, 255, 252, 250))
    $pillPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 186, 122, 131), 1.2)
    
    # Draw pill with rounded corners (using fill and draw)
    $pillRect = New-Object System.Drawing.Rectangle($pillX, $pillY, $pillW, $pillH)
    $g.FillRectangle($pillBrush, $pillRect)
    $g.DrawRectangle($pillPen, $pillRect)
    $pillBrush.Dispose()
    $pillPen.Dispose()
    
    # Draw Logo image
    $logoRect = New-Object System.Drawing.Rectangle($badgeX, $badgeY, $logoW, $logoH)
    $g.DrawImage($logoImg, $logoRect)
    
    # TOP-LEFT VIP BADGE
    $vipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 44, 37, 35))
    $vipPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 230, 218, 200), 1)
    $vipRect = New-Object System.Drawing.Rectangle(24, 24, 130, 30)
    $g.FillRectangle($vipBrush, $vipRect)
    $g.DrawRectangle($vipPen, $vipRect)
    $vipBrush.Dispose()
    $vipPen.Dispose()
    
    $vipFont = New-Object System.Drawing.Font("Arial", 9.5, [System.Drawing.FontStyle]::Bold)
    $vipTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 230, 218, 200))
    $g.DrawString("HAUTE COUTURE", $vipFont, $vipTextBrush, 32, 31)
    $vipFont.Dispose()
    $vipTextBrush.Dispose()
    
    # BOTTOM WATERMARK TEXT
    $botFont = New-Object System.Drawing.Font("Georgia", 11, [System.Drawing.FontStyle]::Regular)
    $botBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 250, 245))
    $g.DrawString("$code  *  UNIBRIDAL ATELIER 2026", $botFont, $botBrush, 28, ($targetH - 42))
    $botFont.Dispose()
    $botBrush.Dispose()
    
    # Save image to public and dist
    $savePath1 = Join-Path $outDir "dress_$numStr.jpg"
    $savePath2 = Join-Path $outDirDist "dress_$numStr.jpg"
    
    $bmp.Save($savePath1, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp.Save($savePath2, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $g.Dispose()
    $bmp.Dispose()
}

# Cleanup base images
foreach ($img in $baseImages) { $img.Dispose() }
$logoImg.Dispose()

Write-Output "Successfully generated all 50 dress images with UniBridal logo in $outDir"

