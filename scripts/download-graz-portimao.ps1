# Descargar imágenes de GRAZ y PORTIMAO automáticamente

$images = @(
    @{ url = 'https://gruposdm.com/79417-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'; name = 'sillon-ergonomico-graz-blanco-negro-1.jpg' }
    @{ url = 'https://gruposdm.com/79418-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'; name = 'sillon-ergonomico-graz-blanco-negro-2.jpg' }
    @{ url = 'https://gruposdm.com/79419-large_default/sillon-de-oficina-graz-blanco-alto-malla-y-tejido-negro.jpg'; name = 'sillon-ergonomico-graz-blanco-negro-3.jpg' }
    @{ url = 'https://gruposdm.com/79401-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg'; name = 'sillon-gaming-portimao-amarillo-negro-1.jpg' }
    @{ url = 'https://gruposdm.com/79402-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg'; name = 'sillon-gaming-portimao-amarillo-negro-2.jpg' }
    @{ url = 'https://gruposdm.com/79403-large_default/sillon-gaming-portimao-amarillo-y-negro.jpg'; name = 'sillon-gaming-portimao-amarillo-negro-3.jpg' }
)

$outputDir = "public\imagenes\productos"

Write-Host ""
Write-Host "Descargando 6 imagenes automaticamente" -ForegroundColor Cyan
Write-Host ""

foreach ($img in $images) {
    $outputPath = Join-Path $outputDir $img.name
    
    try {
        Write-Host "Descargando $($img.name)..." -NoNewline
        
        Invoke-WebRequest -Uri $img.url -OutFile $outputPath -UserAgent "Mozilla/5.0" -Headers @{ "Referer" = "https://gruposdm.com/" } -TimeoutSec 30
        
        $size = [math]::Round((Get-Item $outputPath).Length / 1KB, 0)
        Write-Host " OK ($size KB)" -ForegroundColor Green
        
        Start-Sleep -Milliseconds 500
    }
    catch {
        Write-Host " ERROR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Descarga completada" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos descargados:"
Get-ChildItem $outputDir -Filter "*graz*.jpg"
Get-ChildItem $outputDir -Filter "*portimao*.jpg"
