"""Render editable editorial fragments; retain the original foreground and scene anchors."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
page = ROOT / 'index.html'
html = page.read_text(encoding='utf8')


def section_content(section_id, fragment, start_marker):
    global html
    start = html.index(start_marker, html.index(f'id="{section_id}"'))
    end = html.index('</section>', start)
    html = html[:start] + (ROOT / f'src/sections/{fragment}.html').read_text(encoding='utf8') + '\n' + html[end:]


section_content('gate', 'journal', '  <div class="sec-head"')
section_content('lessons', 'arsenal', '  <div class="sec-head"')
section_content('eternity', 'contact', '  <div class="contact-composition"' if 'class="contact-composition"' in html else '  <div class="eyebrow"')

for name in ('workshop', 'archive'):
    marker = f'<!-- BEGIN {name.upper()} -->'
    content = (ROOT / f'src/sections/{name}.html').read_text(encoding='utf8')
    block = f'{marker}\n{content}\n<!-- END {name.upper()} -->\n'
    if marker in html:
        html = re.sub(rf'{marker}[\s\S]*?<!-- END {name.upper()} -->\n?', lambda _: block, html)
    else:
        anchor = '<!-- ============================================================ chapter IV -->'
        html = html.replace(anchor, block+'\n'+anchor, 1)

footer = (ROOT / 'src/sections/footer.html').read_text(encoding='utf8')
html = re.sub(r'<footer class="foot"[\s\S]*?</footer>\n*', lambda _: footer.rstrip()+'\n\n', html, count=1)
page.write_text(html, encoding='utf8', newline='\n')
print('Rendered journal, arsenal, workshop, archive, contact, and footer.')
