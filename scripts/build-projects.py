"""Render the curated project cards and case studies into the static homepage."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://github.com/Debayan-CyberX/'
SYMBOLS = {
    'shield': '<path d="M60 14 94 28v28c0 23-34 43-34 43S26 79 26 56V28Z"/><path d="m43 56 12 12 24-28"/><circle cx="60" cy="58" r="48" opacity=".25"/>',
    'document': '<rect x="30" y="16" width="60" height="87" rx="2"/><path d="M43 38h34M43 49h24M43 61h34M43 72h16"/><circle cx="77" cy="84" r="15"/><path d="m70 84 5 5 10-11"/>',
    'mail': '<rect x="15" y="30" width="90" height="64" rx="2"/><path d="m15 32 45 35 45-35M15 94l32-35M105 94 73 59"/><path d="M44 16h32M51 8h18" opacity=".5"/>',
    'network': '<rect x="15" y="18" width="90" height="19"/><rect x="25" y="47" width="70" height="19"/><rect x="35" y="76" width="50" height="19"/><path d="M60 37v10M60 66v10M60 95v16"/><circle cx="24" cy="27" r="2"/><circle cx="34" cy="56" r="2"/><circle cx="44" cy="85" r="2"/>',
    'water': '<path d="M60 10S28 50 28 71a32 32 0 0 0 64 0C92 50 60 10 60 10Z"/><path d="M10 94c13-9 20 9 34 0s20 9 34 0 20 9 32 0M10 108c13-9 20 9 34 0s20 9 34 0 20 9 32 0"/>',
    'book': '<path d="M60 32C44 20 27 19 12 24v68c17-5 33-3 48 8 15-11 31-13 48-8V24c-15-5-32-4-48 8Zm0 0v68"/><path d="M25 41c9-1 17 1 24 5M25 55c9-1 17 1 24 5M25 69c9-1 17 1 24 5M71 46c7-4 15-6 24-5M71 60c7-4 15-6 24-5M71 74c7-4 15-6 24-5"/>',
}


def link(url, label):
    return f'<a href="{escape(url)}" target="_blank" rel="noopener noreferrer">{escape(label)}</a>'


def render(projects):
    cards, dialogs, repositories = [], [], []
    for number, project in enumerate(projects, 1):
        pid = project['id']
        name = escape(project['name'])
        source = BASE + project['repo']
        tags = ''.join(f'<span>{escape(tag)}</span>' for tag in project['stack'])
        actions = f'<button type="button" data-open-case="case-{pid}" aria-haspopup="dialog">Case study</button>'
        actions += link(source, 'Source code')
        demo = link(project['demo'], 'Live demo') if project.get('demo') else ''
        cards.append(f'''<article class="project-card" id="project-{pid}">
  <div class="project-art" style="--project-scene:url('secret-pathways-assets/generated/{project['scene']}')" aria-hidden="true">
    <span class="project-no">0{number} / 06</span><span class="project-seal jp">{project['jp']}</span>
    <svg class="project-emblem" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.2">{SYMBOLS[project['symbol']]}</svg>
    <span class="project-art-label">{' · '.join(project['path'])}</span>
  </div>
  <div class="project-content"><span class="project-category">{escape(project['category'])}</span><h3>{name}</h3>
    <p class="project-description">{escape(project['description'])}</p>
    <div class="project-stack">{tags}</div><p class="project-status">{escape(project['status'])}</p>
    <div class="project-actions">{actions}{demo}</div>
  </div></article>''')
        sections = ''.join(f'<section><h3>{title}</h3><p>{escape(project[key])}</p></section>' for title, key in [
            ('Problem & intended user', 'problem'), ('My implementation', 'role'),
            ('Decision & tradeoff', 'decision'), ('Current boundaries', 'limitations')])
        figure = ''
        if pid in ('tcp', 'inbox'):
            figure = f'<figure class="case-figure"><img src="image/{pid}-live-preview.png" width="1280" height="800" loading="lazy" alt="Actual {name} interface"><figcaption>Actual application interface. Open the live demo to explore it.</figcaption></figure>'
        steps = ''.join(f'<li>{escape(step)}</li>' for step in project['walkthrough'])
        dialogs.append(f'''<dialog class="case-dialog" id="case-{pid}" aria-labelledby="case-title-{pid}">
  <div class="case-header"><span>Project dossier · 0{number} / 06</span><button type="button" class="case-close" data-close-case aria-label="Close {name} case study">&times;</button></div>
  <div class="case-body"><span class="project-category">{escape(project['category'])}</span><h2 id="case-title-{pid}">{name}</h2><p>{escape(project['description'])}</p>
    <div class="case-meta">{tags}</div><div class="case-grid">{sections}</div>{figure}
    <section class="case-walkthrough"><h3>Follow the workflow</h3><ol>{steps}</ol></section>
    <p class="case-validation">{escape(project['validation'])}</p><div class="project-actions">{link(source, 'Source code')}{link(source+'/'+project['validation_path'], 'Implementation & validation')}{demo}</div>
  </div></dialog>''')
        repositories.append(f'<article class="github-repo-card"><a class="github-repo-name" href="{source}" target="_blank" rel="noopener noreferrer">{name}</a><p class="github-repo-desc">{escape(project["description"])}</p><div class="github-repo-meta"><span>{escape(project["stack"][0])}</span><span>Public repository</span></div></article>')
    tabs = ''.join(f'<button type="button" role="tab" id="rack-tab-{project["id"]}" aria-controls="project-{project["id"]}" aria-selected="{str(number == 0).lower()}" tabindex="{0 if number == 0 else -1}" data-rack-index="{number}"><span>0{number + 1}</span>{escape(project["name"])}</button>' for number, project in enumerate(projects))
    rack = f'''<div class="project-rack" id="projectRack">
  <div class="rack-experience" hidden>
    <div class="rack-heading"><span><i></i> THE PROJECT COLLECTION</span><span class="rack-caption">Cedar · Vermilion · Moonlight</span></div>
    <div class="rack-stage" id="rackStage" role="group" aria-label="Interactive wooden project plaques">
      <div class="rack-mist" aria-hidden="true"></div>
      <span class="rack-inscription jp" aria-hidden="true">探求と創造</span>
      <button class="rack-arrow rack-previous" type="button" aria-label="Previous project">←</button>
      <button class="rack-arrow rack-next" type="button" aria-label="Next project">→</button>
      <div class="rack-stage-footer"><span id="rackCounter" aria-hidden="true">01 / 06</span><span>Drag to explore <i>·</i> Select a plaque</span></div>
    </div>
    <div class="rack-tabs" role="tablist" aria-label="Choose a project">{tabs}</div>
    <p class="rack-screen-reader" id="rackAnnouncement" role="status" aria-live="polite" aria-atomic="true"></p>
  </div>
  <div class="featured-grid rack-details">{''.join(cards)}</div>
</div>'''
    return rack, '\n'.join(dialogs), '\n'.join(repositories)


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
    print('Rendered six project cards, case studies, and accurate repository fallbacks.')
