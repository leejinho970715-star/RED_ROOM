# Render the existing red/black pixel R brand as vector and native bitmap icons.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskDist = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../dist'))
$taskRows = @('111110','110011','110011','111110','111100','110110','110011','110011')
$taskCells = @()
for ($y = 0; $y -lt $taskRows.Count; $y++) {
  for ($x = 0; $x -lt $taskRows[$y].Length; $x++) {
    if ($taskRows[$y][$x] -eq '1') { $taskCells += ,@(($x + 4), ($y + 3)) }
  }
}
$taskCells += ,@(12,12)
$taskRects = ($taskCells | ForEach-Object { '<rect x="{0}" y="{1}" width="1" height="1"/>' -f $_[0],$_[1] }) -join ''
$taskSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><title>RED ROOM</title><rect width="16" height="16" rx="3" fill="#ff354a"/><g fill="#0c0d11" shape-rendering="crispEdges">' + $taskRects + '</g></svg>'
[System.IO.File]::WriteAllText((Join-Path $taskDist 'favicon.svg'), $taskSvg, [System.Text.UTF8Encoding]::new($false))
foreach ($taskSize in @(32,180)) {
  $taskBitmap = [System.Drawing.Bitmap]::new($taskSize,$taskSize)
  $taskGraphics = [System.Drawing.Graphics]::FromImage($taskBitmap)
  $taskScale = $taskSize / 16.0
  $taskGraphics.ScaleTransform($taskScale,$taskScale)
  $taskGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $taskShape = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $taskShape.AddArc(0,0,6,6,180,90)
  $taskShape.AddArc(10,0,6,6,270,90)
  $taskShape.AddArc(10,10,6,6,0,90)
  $taskShape.AddArc(0,10,6,6,90,90)
  $taskShape.CloseFigure()
  $taskRed = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#ff354a'))
  $taskInk = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#0c0d11'))
  $taskGraphics.FillPath($taskRed,$taskShape)
  $taskGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  foreach ($taskCell in $taskCells) { $taskGraphics.FillRectangle($taskInk,[single]$taskCell[0],[single]$taskCell[1],[single]1,[single]1) }
  $taskName = if ($taskSize -eq 32) { 'favicon-32.png' } else { 'apple-touch-icon.png' }
  $taskBitmap.Save((Join-Path $taskDist $taskName),[System.Drawing.Imaging.ImageFormat]::Png)
  $taskInk.Dispose(); $taskRed.Dispose(); $taskShape.Dispose(); $taskGraphics.Dispose(); $taskBitmap.Dispose()
}
# ICO directory with a lossless PNG entry (32-bit alpha).
$taskPng = [System.IO.File]::ReadAllBytes((Join-Path $taskDist 'favicon-32.png'))
$taskStream = [System.IO.File]::Create((Join-Path $taskDist 'favicon.ico'))
$taskWriter = [System.IO.BinaryWriter]::new($taskStream)
$taskWriter.Write([uint16]0); $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]1)
$taskWriter.Write([byte]32); $taskWriter.Write([byte]32); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0)
$taskWriter.Write([uint16]1); $taskWriter.Write([uint16]32)
$taskWriter.Write([uint32]$taskPng.Length); $taskWriter.Write([uint32]22); $taskWriter.Write($taskPng)
$taskWriter.Dispose()
