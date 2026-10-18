"""Original vector plates: project workflows, not screenshots or generated imagery."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'image' / 'project-plates'
OUT.mkdir(parents=True, exist_ok=True)
INK, PAPER, MUTED, RED, GOLD = '#10191a', '#e4e4d6', '#81928d', '#cf4c3a', '#c4aa75'


def text(x, y, value, size=15, color=MUTED, extra=''):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" {extra}>{escape(value)}</text>'


def path(d, color=PAPER, width=2, extra=''):
    return f'<path d="{d}" stroke="{color}" stroke-width="{width}" fill="none" {extra}/>'


def circle(x, y, radius=6, color=RED, extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{color}" {extra}/>'


def box(x, y, w, h, label, color=MUTED):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" stroke="{color}" fill="{INK}"/>' + text(x+w/2, y+h/2+5, label, 15, PAPER, 'text-anchor="middle"')


def diagram(pid):
    if pid == 'aegis':
        s = path('M130 260H480V405H880', MUTED)
        for i in range(5):
            x=150+i*60
            s += path(f'M{x} 216V304', RED, 2)+circle(x,260,5)+text(x,335,'FAIL',11,RED,'text-anchor="middle"')
        s += circle(480,260,9,GOLD)+text(480,210,'SUCCESS',13,GOLD,'text-anchor="middle"')
        s += box(600,370,130,70,'INCIDENT',RED)+circle(880,405,10,PAPER)
        s += text(130,175,'01 / EVENT WINDOW',13)+text(770,458,'EVIDENCE → AUDIT',13)
        s += path('M130 360H450M130 367V353M450 367V353',MUTED,1)
        return s+text(290,390,'CORRELATION',13,MUTED,'text-anchor="middle"')
    if pid == 'trishield':
        s=''
        for i,(title,sub) in enumerate([('01 / STRUCTURE','Identifier checks'),('02 / FORENSICS','Image signals'),('03 / INTEGRITY','Audit chain')]):
            x=125+i*270
            s+=f'<rect x="{x}" y="195" width="215" height="255" stroke="{MUTED}" fill="none"/>'
            s+=text(x+20,225,title,13,GOLD)+text(x+20,426,sub,15,PAPER)
            if i==0:
                for j in range(5): s+=path(f'M{x+26} {270+j*19}h{140 if j%2==0 else 90}',PAPER,2)
                s+=path(f'm{x+140} 357 12 12 22-28',RED,3)
            elif i==1:
                for a in range(6):
                    for b in range(5):
                        s+=f'<rect x="{x+28+a*26}" y="{262+b*23}" width="21" height="18" fill="{RED if (a-3)**2+(b-2)**2<4 else MUTED}" opacity="{.7 if (a+b)%2 else .3}"/>'
            else:
                for j in range(3):
                    s+=box(x+32,258+j*40,150,28,['hash(document)','hash(previous)','verify(chain)'][j])
            if i<2: s+=path(f'M{x+215} 328h55',RED,2)
        return s
    if pid == 'inbox':
        s=''
        for i in range(4):
            s+=path(f'M140 {220+i*48}h200',MUTED,1)+circle(145,220+i*48,3,RED)+text(170,208+i*48,['NEW THREAD','CONTEXT','OPPORTUNITY','NEXT ACTION'][i],12)
        s+=path('M340 292H435V385H505',RED,2)+box(505,350,155,70,'REVIEW DRAFT',GOLD)
        s+=path('M660 385H745V290H860',PAPER,2)+circle(745,385,7,GOLD)
        s+=text(725,435,'HUMAN APPROVAL',13,GOLD)+text(860,270,'SEND',15,PAPER,'text-anchor="middle"')
        return s+text(140,160,'CONVERSATION → OPPORTUNITY',13,GOLD)
    if pid == 'tcp':
        s=''
        for i,(label,w) in enumerate([('APPLICATION',300),('TRANSPORT',440),('INTERNET',580),('NETWORK',720)]):
            x=(1020-w)/2; y=170+i*79
            s+=f'<rect x="{x}" y="{y}" width="{w}" height="54" fill="none" stroke="{PAPER if i==0 else MUTED}"/>'
            s+=text(x+20,y+33,f'0{i+1}',13,RED)+text(x+w-20,y+33,label,14,PAPER,'text-anchor="end"')
            if i:s+=path(f'M{x+72} {y}v54',RED,2)
        return s+text(510,535,'PAYLOAD + HEADERS / LAYER BY LAYER',13,GOLD,'text-anchor="middle"')
    if pid == 'drain':
        s=''
        for i in range(7):
            s+=path(f'M{125+i*120} 170v330',MUTED,1,extra='opacity=".3"')
        for i in range(5):s+=path(f'M125 {170+i*80}h760',MUTED,1,extra='opacity=".3"')
        s+=path('M150 450 280 380 390 400 500 300 630 315 760 205 855 225',RED,3)
        for x,y,r,c in [(280,380,9,MUTED),(500,300,16,RED),(630,315,10,GOLD),(760,205,7,PAPER)]:
            s+=circle(x,y,r,c)+f'<circle cx="{x}" cy="{y}" r="{r+13}" fill="none" stroke="{c}" opacity=".5"/>'
        s+=box(545,185,142,50,'PRIORITY 01',RED)+path('M545 235 510 280',RED,1)
        return s+text(145,535,'SCHEMATIC MAP / SYNTHETIC TELEMETRY',13)
    s=''
    for i,(label,status) in enumerate([('SEARCH','Title · Author · Genre'),('DISCOVER','Catalog · Details · Map'),('RESERVE','Student · Book · Expiry')]):
        x=145+i*265
        s+=f'<rect x="{x}" y="170" width="210" height="310" rx="12" fill="none" stroke="{PAPER if i==1 else MUTED}"/>'
        s+=path(f'M{x+75} 188h60',MUTED,2)+text(x+22,240,label,15,GOLD)
        for j in range(3):
            s+=f'<rect x="{x+22}" y="{267+j*52}" width="24" height="34" fill="none" stroke="{RED if j==1 else MUTED}"/>'
            s+=path(f'M{x+60} {278+j*52}h115M{x+60} {290+j*52}h75',MUTED,1)
        s+=text(x+105,514,status,12,MUTED,'text-anchor="middle"')
    return s


projects=json.loads((ROOT/'data/projects.json').read_text(encoding='utf-8'))
for i,p in enumerate(projects,1):
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="760" viewBox="0 0 1020 760">
<rect width="1020" height="760" fill="{INK}"/>
<g font-family="monospace" font-weight="400">
<rect x="26" y="26" width="968" height="708" stroke="{MUTED}" opacity=".4" fill="none"/>
{path('M58 105H962M58 580H962',MUTED,1)}
{text(58,76,'DEBAYAN LAHIRY / SELECTED WORK',14,PAPER)}
{text(962,76,f'PLATE 0{i} / 06',14,GOLD,'text-anchor="end"')}
{diagram(p['id'])}
{text(60,620,p['category'].split(' · ')[0].upper(),13,GOLD)}
{text(60,684,p['name'],49,PAPER,'font-family="Georgia,serif"')}
{text(962,698,'WORKFLOW STUDY',12,MUTED,'text-anchor="end"')}
</g></svg>'''
    (OUT/f"{p['id']}.svg").write_text(svg,encoding='utf-8',newline='\n')

# Typeset identity pass: no external logo, avatar, model, or texture.
for side in ['front','back']:
    lines = [('DEBAYAN',180,62),('LAHIRY',254,62),('CYBERSECURITY',345,19),('& SOFTWARE ENGINEERING',377,17)] if side=='front' else [('BUILD.',180,58),('INSPECT.',254,58),('UNDERSTAND.',328,46),('Selected work / 2026',440,19)]
    content=''.join(text(58,y,t,n,PAPER,'font-family="Georgia,serif"' if n>40 else '') for t,y,n in lines)
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900"><rect width="640" height="900" fill="{INK}"/><g font-family="monospace"><rect x="26" y="26" width="588" height="848" fill="none" stroke="{GOLD}"/>{path("M58 105H582M58 745H582",MUTED,1)}{text(58,80,"INDEPENDENT BUILDER / MUMBAI",17,GOLD)}{content}{path("M58 540H500M58 564H420M58 588H540M58 612H380",MUTED,1)}{text(58,798,"SECURITY · SYSTEMS · SOFTWARE",17,GOLD)}{text(58,834,"DEBAYAN-CYBERX / GITHUB",16,PAPER)}<rect x="560" y="155" width="5" height="320" fill="{RED}"/></g></svg>'
    (OUT/f'identity-{side}.svg').write_text(svg,encoding='utf-8',newline='\n')
print('Built six original workflow plates and two identity-pass faces.')
