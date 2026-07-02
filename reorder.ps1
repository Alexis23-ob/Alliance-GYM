$html = [System.IO.File]::ReadAllText("C:\Users\tlaca\OneDrive\Escritorio\sitio\index.html", [System.Text.Encoding]::UTF8)

$sections = @{
    "hero" = "<!-- Hero Section -->"
    "gallery" = "<!-- Gallery & Zonas"
    "equipment" = "<!-- Equipment Section -->"
    "coaches" = "<!-- Coaches & Appointments"
    "info" = "<!-- Info Section (Promotions"
    "reviews" = "<!-- Opiniones"
    "memberships" = "<!-- Membership Section"
    "location" = "<!-- Location Section -->"
}
$footer_marker = "<!-- REORGANIZED FOOTER"

$indices = @{}
foreach ($key in $sections.Keys) {
    $marker = $sections[$key]
    $idx = $html.IndexOf($marker)
    if ($idx -lt 0) { Write-Host "NOT FOUND: $marker" }
    $indices[$key] = $idx
}
$footer_idx = $html.IndexOf($footer_marker)

$markersList = @()
foreach ($key in $indices.Keys) {
    $markersList += [PSCustomObject]@{Name=$key; Index=$indices[$key]}
}
$markersList += [PSCustomObject]@{Name="footer"; Index=$footer_idx}
$markersList = $markersList | Sort-Object Index

$blocks = @{}
for ($i=0; $i -lt $markersList.Length - 1; $i++) {
    $name = $markersList[$i].Name
    $start = $markersList[$i].Index
    $end = $markersList[$i+1].Index
    $blocks[$name] = $html.Substring($start, $end - $start)
}

$header_end = $markersList[0].Index
$header_block = $html.Substring(0, $header_end)
$footer_and_rest = $html.Substring($footer_idx)

$new_order = @("hero", "gallery", "equipment", "coaches", "info", "reviews", "memberships", "location")

$new_html = $header_block
foreach ($name in $new_order) {
    $new_html += $blocks[$name]
}
$new_html += $footer_and_rest

[System.IO.File]::WriteAllText("C:\Users\tlaca\OneDrive\Escritorio\sitio\index.html", $new_html, [System.Text.Encoding]::UTF8)
Write-Host "Reordering done."
