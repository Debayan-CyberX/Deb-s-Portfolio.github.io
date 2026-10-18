"""Render the editorial exhibition and evidence-backed dossiers from project data."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://github.com/Debayan-CyberX/'


def link(url, label):
    return f'<a href="{escape(url)}" target="_blank" rel="noopener noreferrer">{escape(label)}</a>'


def render(projects):
    cards, dialogs, repositories = [], [], []
    for number, project in enumerate(projects, 1):
        pid = project['id']
        name = escape(project['name'])
        source = BASE + project['repo']
        tags = ''.join(f'<span>{escape(tag)}</span>' for tag in project['stack'])
        demo = link(project['demo'], 'Live project ↗') if project.get('demo') else ''
        actions = f'<button type="button" data-open-case="case-{pid}" aria-haspopup="dialog" aria-label="Read dossier: {name}">Read dossier</button>'
        actions += link(source, 'Source code') + demo
        preview = f'<img src="{escape(project["preview"])}" width="1440" height="960" loading="lazy" decoding="async" alt="{name}: actual application landing page">'
        feature = pid in ('aegis', 'inbox')
        cards.append(f'''<article class="project-card {'project-feature' if feature else 'project-note-row'}" id="project-{pid}">
  <div class="project-art"><button type="button" class="project-preview-button" data-open-case="case-{pid}" aria-label="Explore {name}">{preview}<span>Explore project ↗</span></button></div>
  <div class="project-content"><div class="project-kicker"><span class="editorial-label jp" lang="ja">作品 {number:02d} / 06</span><span class="project-category">{escape(project['category'])}</span></div>
    <h3>{name}</h3><p class="project-description">{escape(project['editorial'])}</p>
    <div class="project-stack">{tags}</div><p class="project-status">{escape(project['status'])}</p>
    <div class="project-actions">{actions}</div>
  </div></article>''')
        flow = ''.join(f'<li><span>{i:02d}</span><b>{escape(node)}</b></li>' for i, node in enumerate(project['architecture'], 1))
        steps = ''.join(f'<li>{escape(step)}</li>' for step in project['walkthrough'])
        gallery = f'<figure class="case-figure">{preview}<figcaption>Actual application landing page. {link(project["preview"], "View full image ↗")}</figcaption></figure>'
        if pid in ('inbox', 'tcp'):
            gallery += f'<figure class="case-figure"><img src="image/{pid}-live-preview.png" width="1280" height="800" loading="lazy" alt="Actual {name} interface"><figcaption>Application interface, captured from a running preview. {link(f"image/{pid}-live-preview.png", "View full image ↗")}</figcaption></figure>'
        sections = ''.join(f'<section class="dossier-section"><h3><span>{n:02d}</span>{title}</h3><p>{escape(project[key])}</p></section>' for n, title, key in [(1, 'The problem', 'problem'), (2, 'My implementation', 'role')])
        next_pid = projects[number % len(projects)]['id']
        next_name = escape(projects[number % len(projects)]['name'])
        dialogs.append(f'''<dialog class="case-dialog" id="case-{pid}" aria-labelledby="case-title-{pid}">
  <div class="case-header"><span>DIGITAL KYOTO / DOSSIER {number:02d}</span><button type="button" class="case-close" data-close-case aria-label="Close {name} case study">×</button></div>
  <div class="case-body"><header class="dossier-opening"><span class="project-category">{escape(project['category'])}</span><h2 id="case-title-{pid}">{name}</h2><p>{escape(project['description'])}</p><div class="case-meta">{tags}</div><div class="project-actions">{link(source, 'Source code')}{demo}</div></header>
    <div class="case-grid">{sections}</div>
    <section class="dossier-section"><h3><span>03</span>Architecture</h3><ol class="architecture-flow" aria-label="Application architecture">{flow}</ol><p class="architecture-caption">{escape(project['architecture_note'])}</p></section>
    <div class="case-grid"><section class="dossier-section"><h3><span>04</span>Engineering decision</h3><p>{escape(project['decision'])}</p></section><section class="dossier-section"><h3><span>05</span>Security &amp; reliability</h3><p>{escape(project['security'])}</p></section></div>
    <section class="case-walkthrough"><h3>Follow the workflow</h3><div data-case-stepper="{pid}"></div><ol class="walkthrough-fallback">{steps}</ol></section>
    <section class="dossier-section"><h3><span>06</span>Product gallery</h3>{gallery}</section>
    <section class="dossier-section dossier-status"><h3><span>07</span>Results &amp; current boundaries</h3><p>{escape(project['limitations'])}</p><p class="case-validation">{escape(project['validation'])}</p></section>
    <section class="dossier-section"><h3><span>08</span>Explore the work</h3><div class="project-actions">{link(source, 'Source code')}{link(source+'/'+project['validation_path'], 'Implementation & validation')}{demo}</div></section>
    <button type="button" class="next-dossier" data-next-case="case-{next_pid}"><span>CONTINUE THE EXHIBITION</span><b>{next_name} ↗</b></button>
  </div></dialog>''')
        repositories.append(f'<article class="github-repo-card"><a class="github-repo-name" href="{source}" target="_blank" rel="noopener noreferrer">{name} ↗</a><p class="github-repo-desc">{escape(project["description"])}</p><div class="github-repo-meta"><span>{escape(project["stack"][0])}</span><span>Public source</span></div></article>')
    order = [2, 0, 1, 3, 4, 5]
    return '\n'.join(cards[i] for i in order), '\n'.join(dialogs), '\n'.join(repositories)


def replace_block(html, name, content):
    pattern = rf'<!-- BEGIN {name} -->[\s\S]*?<!-- END {name} -->'
    replacement = f'<!-- BEGIN {name} -->\n{content}\n<!-- END {name} -->'
    html, count = re.subn(pattern, lambda _: replacement, html)
    if count != 1:
        raise ValueError(f'Expected exactly one {name} block, found {count}')
    return html


if __name__ == '__main__':
    projects = json.loads((ROOT / 'data/projects.json').read_text(encoding='utf-8'))
    page = ROOT / 'index.html'
    html = page.read_text(encoding='utf-8')
    for name, content in zip(('PROJECT_CARDS', 'PROJECT_CASES', 'PROJECT_REPOSITORIES'), render(projects)):
        html = replace_block(html, name, content)
    page.write_text(html, encoding='utf-8', newline='\n')
    print('Rendered six editorial project features, dossiers, and source links.')
