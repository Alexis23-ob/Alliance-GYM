import re
import os

def clean_html(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Remove "Mi Cuenta" nav items
    html = re.sub(r'<li class="mobile-only">\s*<a href="#" onclick="openAuthModal\(\)">\s*<i class="fas fa-user-circle"></i> Mi Cuenta</a>\s*</li>', '', html)
    html = re.sub(r'<div class="nav-auth-buttons main-nav-buttons">.*?</div>', '', html, flags=re.DOTALL)

    # 2. Update Memberships buttons to link to WhatsApp instead of openCheckoutWizard
    html = re.sub(r'openCheckoutWizard\([^)]+\)', "window.open('https://wa.me/525567659004?text=%C2%A1Hola!%20Me%20interesa%20adquirir%20esta%20membres%C3%ADa.', '_blank')", html)

    # 3. Remove Dashboards and Modals (from CLIENT DASHBOARD to Email Prompt Modal)
    html = re.sub(r'<!-- CLIENT DASHBOARD VIEW \(Oculto por defecto\) -->.*?<!-- PANELLUM & SWIPER CDN -->', '<!-- PANELLUM & SWIPER CDN -->', html, flags=re.DOTALL)
    
    # Let's remove SYSTEM MODULES scripts that are for auth
    scripts_to_remove = [
        'js/points.js',
        'js/reviews.js',
        'js/staff.js',
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'js/supabase-client.js',
        'js/users_db.js',
        'js/auth.js',
        'js/appointments.js',
        'js/rewards.js'
    ]
    for script in scripts_to_remove:
        pattern = r'<script src="[^"]*' + re.escape(script) + r'[^"]*"></script>\s*'
        html = re.sub(pattern, '', html)

    # Remove the Email Prompt Modal
    html = re.sub(r'<!-- Email Prompt Modal for Temp Users -->.*?</div>\s*</div>', '', html, flags=re.DOTALL)

    # Remove dash-drawer-overlay
    html = re.sub(r'<div id="dash-drawer-overlay" class="dash-drawer-overlay" onclick="closeDashboardDrawer\(\)"></div>', '', html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Cleaned {filepath}")

clean_html('c:/Users/tlaca/OneDrive/Escritorio/sitio/index.html')
clean_html('c:/Users/tlaca/OneDrive/Escritorio/sitio/nosotros.html')
clean_html('c:/Users/tlaca/OneDrive/Escritorio/sitio/maquinaria.html')
clean_html('c:/Users/tlaca/OneDrive/Escritorio/sitio/reglamento.html')
clean_html('c:/Users/tlaca/OneDrive/Escritorio/sitio/empleos.html')
