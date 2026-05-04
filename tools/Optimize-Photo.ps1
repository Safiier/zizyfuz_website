param(
  [Parameter(Mandatory = $true)]
  [string] $Source,

  [Parameter(Mandatory = $true)]
  [string] $Target,

  [int] $MaxSide = 2200,

  [long] $Quality = 86
)

Add-Type -AssemblyName System.Drawing

$targetDirectory = Split-Path -Parent $Target
if ($targetDirectory -and -not (Test-Path -LiteralPath $targetDirectory)) {
  New-Item -ItemType Directory -Path $targetDirectory | Out-Null
}

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  $Quality
)

$image = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source))
$ratio = [Math]::Min($MaxSide / $image.Width, $MaxSide / $image.Height)
if ($ratio -gt 1) {
  $ratio = 1
}

$newWidth = [Math]::Max(1, [int]($image.Width * $ratio))
$newHeight = [Math]::Max(1, [int]($image.Height * $ratio))
$bitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)

$bitmap.Save((Join-Path (Get-Location) $Target), $encoder, $encoderParameters)

$graphics.Dispose()
$bitmap.Dispose()
$image.Dispose()

Write-Host "Optimized image written to $Target"
