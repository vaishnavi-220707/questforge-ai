$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$outDir = 'C:\SEC\screenshots'
$tmpDir = 'C:\SEC\.tmp-chrome'

$routes = @(
    @{ Name = '01-home'; Path = '/' },
    @{ Name = '02-about'; Path = '/about' },
    @{ Name = '03-scholarships'; Path = '/scholarships' },
    @{ Name = '04-scholarship-detail'; Path = '/scholarships/merit-tech-2026' },
    @{ Name = '05-upload'; Path = '/upload' },
    @{ Name = '06-analysis'; Path = '/analysis' },
    @{ Name = '07-audit-results'; Path = '/audit-results/demo-audit-1' },
    @{ Name = '08-dashboard'; Path = '/dashboard' },
    @{ Name = '09-report'; Path = '/report/demo-audit-1' },
    @{ Name = '10-privacy'; Path = '/privacy' },
    @{ Name = '11-terms'; Path = '/terms' },
    @{ Name = '12-cookies'; Path = '/cookies' },
    @{ Name = '13-contact'; Path = '/contact' },
    @{ Name = '14-not-found'; Path = '/route-that-does-not-exist' }
)

Write-Host "Capturing Desktop viewports (1440x900)..."
foreach ($r in $routes) {
    $outFile = "$outDir\desktop-$($r.Name).png"
    $url = "http://localhost:5173$($r.Path)"
    Write-Host "Capturing Desktop: $($r.Name) -> $url"
    $args = @(
        '--headless',
        "--screenshot=$outFile",
        "--window-size=1440,900",
        "--user-data-dir=$tmpDir",
        '--virtual-time-budget=2000',
        '--hide-scrollbars',
        $url
    )
    Start-Process $chromePath -ArgumentList $args -Wait
}

Write-Host "Capturing Tablet viewports (768x1024)..."
$tabletRoutes = @('01-home', '05-upload', '08-dashboard', '07-audit-results')
foreach ($r in $routes | Where-Object { $tabletRoutes -contains $_.Name }) {
    $outFile = "$outDir\tablet-$($r.Name).png"
    $url = "http://localhost:5173$($r.Path)"
    Write-Host "Capturing Tablet: $($r.Name) -> $url"
    $args = @(
        '--headless',
        "--screenshot=$outFile",
        "--window-size=768,1024",
        "--user-data-dir=$tmpDir",
        '--virtual-time-budget=2000',
        '--hide-scrollbars',
        $url
    )
    Start-Process $chromePath -ArgumentList $args -Wait
}

Write-Host "Capturing Mobile viewports (390x844)..."
$mobileRoutes = @('01-home', '05-upload', '08-dashboard', '07-audit-results', '09-report')
foreach ($r in $routes | Where-Object { $mobileRoutes -contains $_.Name }) {
    $outFile = "$outDir\mobile-$($r.Name).png"
    $url = "http://localhost:5173$($r.Path)"
    Write-Host "Capturing Mobile: $($r.Name) -> $url"
    $args = @(
        '--headless',
        "--screenshot=$outFile",
        "--window-size=390,844",
        "--user-data-dir=$tmpDir",
        '--virtual-time-budget=2000',
        '--hide-scrollbars',
        $url
    )
    Start-Process $chromePath -ArgumentList $args -Wait
}

Write-Host "All screenshots successfully captured."
