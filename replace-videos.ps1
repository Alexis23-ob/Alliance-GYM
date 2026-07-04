$html = Get-Content 'maquinaria.html' -Raw -Encoding UTF8
$html = $html -replace 'class="hls-video"\s+data-src="[^"]+"', 'class="local-video" src="videos/biceps-curl.mp4"'
Set-Content -Path 'maquinaria.html' -Value $html -Encoding UTF8
