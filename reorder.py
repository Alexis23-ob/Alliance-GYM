import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

sections = {
    'hero': '<!-- Hero Section -->',
    'gallery': '<!-- Gallery & Zonas Corporales Section -->',
    'equipment': '<!-- Equipment Section -->',
    'coaches': '<!-- Coaches & Appointments Section -->',
    'info': '<!-- Info Section (Promotions, Enrollment, Hours) -->',
    'reviews': '<!-- Opiniones & Reseñas Section (NEW) -->',
    'memberships': '<!-- Membership Section (NEW) -->',
    'location': '<!-- Location Section -->'
}

footer_marker = '<!-- REORGANIZED FOOTER'

indices = {}
for name, marker in sections.items():
    idx = html.find(marker)
    if idx == -1:
        print(f"NOT FOUND: {marker}")
    indices[name] = idx

footer_idx = html.find(footer_marker)
if footer_idx == -1:
    print("FOOTER NOT FOUND")

all_markers = [(name, idx) for name, idx in indices.items()]
all_markers.sort(key=lambda x: x[1])
all_markers.append(('footer', footer_idx))

blocks = {}
for i in range(len(all_markers)-1):
    name = all_markers[i][0]
    start = all_markers[i][1]
    end = all_markers[i+1][1]
    blocks[name] = html[start:end]

header_end = all_markers[0][1]
header_block = html[:header_end]

footer_and_rest = html[footer_idx:]

new_order = ['hero', 'gallery', 'equipment', 'coaches', 'info', 'reviews', 'memberships', 'location']

new_html = header_block
for name in new_order:
    new_html += blocks[name]
new_html += footer_and_rest

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Reordering done.")
