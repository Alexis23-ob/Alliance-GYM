$files = @(
    "c:\Users\tlaca\OneDrive\Escritorio\sitio\index.html",
    "c:\Users\tlaca\OneDrive\Escritorio\sitio\nosotros.html",
    "c:\Users\tlaca\OneDrive\Escritorio\sitio\maquinaria.html",
    "c:\Users\tlaca\OneDrive\Escritorio\sitio\reglamento.html",
    "c:\Users\tlaca\OneDrive\Escritorio\sitio\empleos.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

        # 1. Remove "Mi Cuenta" nav items
        $content = [regex]::Replace($content, '(?s)<li class="mobile-only">\s*<a href="#" onclick="openAuthModal\(\)">\s*<i class="fas fa-user-circle"></i> Mi Cuenta</a>\s*</li>', '')
        $content = [regex]::Replace($content, '(?s)<div class="nav-auth-buttons main-nav-buttons">.*?</div>', '')

        # 2. Update Memberships buttons to link to WhatsApp
        $content = [regex]::Replace($content, 'openCheckoutWizard\([^)]+\)', "window.open('https://wa.me/525567659004?text=%C2%A1Hola!%20Me%20interesa%20adquirir%20esta%20membres%C3%ADa.', '_blank')")

        # 3. Remove Dashboards and Modals (from CLIENT DASHBOARD to Email Prompt Modal)
        $content = [regex]::Replace($content, '(?s)<!-- CLIENT DASHBOARD VIEW \(Oculto por defecto\) -->.*?<!-- PANELLUM & SWIPER CDN -->', '<!-- PANELLUM & SWIPER CDN -->')

        # 4. Remove scripts
        $scripts = @(
            'js/points.js',
            'js/reviews.js',
            'js/staff.js',
            'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
            'js/supabase-client.js',
            'js/users_db.js',
            'js/auth.js',
            'js/appointments.js',
            'js/rewards.js'
        )
        foreach ($script in $scripts) {
            $pattern = '<script src="[^"]*' + [regex]::Escape($script) + '[^"]*"></script>\s*'
            $content = [regex]::Replace($content, $pattern, '')
        }

        # 5. Remove the Email Prompt Modal
        $content = [regex]::Replace($content, '(?s)<!-- Email Prompt Modal for Temp Users -->.*?</div>\s*</div>', '')

        # 6. Remove dash-drawer-overlay
        $content = [regex]::Replace($content, '<div id="dash-drawer-overlay" class="dash-drawer-overlay" onclick="closeDashboardDrawer\(\)"></div>', '')

        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Cleaned $file"
    }
}
