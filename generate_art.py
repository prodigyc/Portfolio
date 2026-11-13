from pathlib import Path
from random import Random
import math
out=Path(__file__).parent/'assets/projects';out.mkdir(parents=True,exist_ok=True)
themes={
'aurix': ('#041a1e','#063b3d','#65ffcf','#1f8191','ANDROID / FORENSICS'),
'red-team': ('#15051d','#451139','#ff4b85','#a55aff','OFFENSIVE / LAB'),
'forensics-case': ('#051524','#122f58','#6be8ff','#3b73d5','EVIDENCE / RECOVERY'),
'playpath': ('#111821','#2b4452','#e2ff86','#82b8a8','GOVERNANCE / DESIGN'),
'network': ('#080e24','#16215e','#7ed6ff','#4053ed','SECURE / NETWORK'),
'analytics': ('#061c19','#0d4934','#c5ff4f','#46b3a2','DATA / FORECAST'),
'deadzone': ('#24090c','#631a19','#ffb14a','#ff472c','DIGITAL / COMMERCE'),
'risk': ('#25130b','#4b2c1d','#ffda70','#e77a3f','THREAT / MODELING'),
}
def L(a,b,extra=''):return f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" {extra}/>'
for j,(name,(dark,mid,neon,other,sub)) in enumerate(themes.items()):
 r=Random(81+j)
 parts=[f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs>
 <radialGradient id="bg" cx="70%" cy="55%" r="90%"><stop stop-color="{mid}"/><stop offset=".65" stop-color="{dark}"/><stop offset="1" stop-color="#030509"/></radialGradient>
 <linearGradient id="ink" x2="1" y2="1"><stop stop-color="{neon}" stop-opacity=".85"/><stop offset="1" stop-color="{other}" stop-opacity=".05"/></linearGradient>
 <linearGradient id="glass" x2="1" y2="1"><stop stop-color="{neon}" stop-opacity=".27"/><stop offset=".45" stop-color="{mid}" stop-opacity=".15"/><stop offset="1" stop-color="{other}" stop-opacity=".28"/></linearGradient>
 <filter id="glow"><feGaussianBlur stdDeviation="16"/></filter><filter id="soft"><feGaussianBlur stdDeviation="50"/></filter>
 <pattern id="grid" width="85" height="85" patternUnits="userSpaceOnUse"><path d="M85 0H0V85" stroke="{neon}" stroke-opacity=".08" fill="none"/></pattern></defs>
 <rect width="1600" height="1000" fill="url(#bg)"/><rect width="1600" height="1000" fill="url(#grid)"/>
 <circle cx="1150" cy="440" r="370" fill="{other}" opacity=".18" filter="url(#soft)"/>
 <g stroke="{neon}" opacity=".11"><path d="M0 770L1600 200M0 810L1600 240M0 850L1600 280M0 890L1600 320"/></g>
 <g fill="{neon}" font-family="monospace" font-size="15" opacity=".6"><text x="80" y="87">CASE FILE / {j+1:02d}</text><text x="1270" y="87">AMER_2026</text><text x="80" y="915">{sub}</text><text x="1190" y="915">SECURE // 0{j+1}X</text></g>
 <g stroke="{neon}" opacity=".45"><path d="M90 110V145H125M1510 110V145H1475M90 890V855H125M1510 890V855H1475" fill="none" stroke-width="2"/></g>''']
 # points of lights/stars
 for i in range(110):
  x=r.randint(80,1520);y=r.randint(120,870);radius=r.choice([1,1,1,2,3]);opacity=r.choice(['.17','.25','.35','.52'])
  parts.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{neon}" opacity="{opacity}"/>')
 if name=='aurix':
  parts.append(f'''<g transform="translate(765 120) rotate(-15 235 385)">
  <rect x="40" y="6" rx="58" width="460" height="790" stroke="{neon}" stroke-width="20" opacity=".29" fill="none" filter="url(#glow)"/>
  <rect x="40" y="6" rx="56" width="460" height="790" fill="url(#glass)" stroke="{neon}" stroke-width="4"/>
  <rect x="60" y="24" rx="37" width="420" height="754" fill="{dark}" stroke="{neon}" stroke-opacity=".35"/>
  <rect x="196" y="40" rx="8" width="149" height="16" fill="{other}" opacity=".6"/>
  <circle cx="269" cy="377" r="151" fill="none" stroke="{neon}" opacity=".27" stroke-width="2"/>
  <path d="M270 245c-112 28-122 95-110 176M270 245c112 28 122 95 110 176M171 364c69 32 129 32 199 0M185 410c60-20 110-25 172 0" fill="none" stroke="{neon}" opacity=".9" stroke-width="5"/>
  <path d="M202 490l67 52 69-52" fill="none" stroke="{other}" stroke-width="9"/>
  <text x="269" y="644" text-anchor="middle" fill="{neon}" font-size="32" font-family="monospace">ARTIFACTS_13</text><text x="269" y="685" text-anchor="middle" fill="white" opacity=".6" font-size="18" font-family="monospace">SHA256 VERIFIED</text>
  </g>''')
  for i in range(5):parts.append(f'<circle cx="960" cy="505" r="{220+i*86}" stroke="{neon}" stroke-width="2" fill="none" opacity="{.18-i*.024:.3f}" stroke-dasharray="{25+i*7} {29+i*6}"/>')
 elif name=='red-team':
  for i in range(8):
   parts.append(f'<circle cx="955" cy="480" r="{80+i*60}" fill="none" stroke="{neon}" stroke-width="{2 if i<3 else 1}" stroke-dasharray="{20+i*3} {18+i*4}" opacity="{.75-i*.07:.3f}"/>')
  parts.append(f'''<g fill="none" stroke="{other}" stroke-width="3" opacity=".95"><path d="M955 80V880M535 480h840" stroke-dasharray="11 20"/><path d="M700 280l510 400M1210 280L700 680" opacity=".27"/></g>
  <rect x="250" y="220" width="810" height="390" rx="8" fill="{dark}" stroke="{neon}" opacity=".9"/>
  <g font-family="monospace" font-size="31" fill="{neon}"><text x="297" y="303">$ nmap -sV target.lab</text><text x="297" y="362" fill="white" opacity=".85">PORT  STATE  SERVICE</text><text x="297" y="422">22/tcp  open   ssh</text><text x="297" y="482">80/tcp  open   http</text><text x="297" y="542">$ access_granted_</text></g>''')
 elif name=='forensics-case':
  for i in range(6):
   x=300+i*110;y=570-i*45
   parts.append(f'<g transform="translate({x} {y}) skewY(-19)"><rect width="620" height="235" fill="{mid}" fill-opacity=".47" stroke="{neon}" stroke-width="3" stroke-opacity="{.16+i*.12:.3f}"/><path d="M60 40H520M60 76H290M60 117H490" stroke="{neon}" stroke-opacity=".38" stroke-width="10"/></g>')
  parts.append(f'<circle cx="1160" cy="460" r="210" fill="none" stroke="{neon}" stroke-width="14" opacity=".75"/><path d="M1318 608l205 209" stroke="{neon}" stroke-width="39" opacity=".85"/><text x="970" y="467" fill="{neon}" font-size="35" font-family="monospace">EVIDENCE</text>')
 elif name=='playpath':
  for row in range(3):
   for col in range(4):
    x=430+col*240+row*50;y=220+row*188
    points=' '.join(f'{x+95*math.cos(a*math.pi/3):.1f},{y+95*math.sin(a*math.pi/3):.1f}' for a in range(6))
    parts.append(f'<polygon points="{points}" fill="{mid}" fill-opacity=".36" stroke="{neon}" stroke-opacity="{.18+r.random()*.53:.3f}" stroke-width="3"/>')
    parts.append(f'<text x="{x}" y="{y+10}" text-anchor="middle" fill="{neon}" opacity=".9" font-size="28" font-family="monospace">{["GOV","ID","PRO","DET","RES","REC"][((row*4+col)%6)]}</text>')
  parts.append(f'<circle cx="900" cy="505" r="355" stroke="{neon}" fill="none" stroke-dasharray="7 26" opacity=".25" stroke-width="4"/>')
 elif name=='network':
  nodes=[]
  for i in range(65):
   x=r.randint(330,1400);y=r.randint(190,790);nodes.append((x,y))
  for i,(x,y) in enumerate(nodes):
   for j in range(i):
    x2,y2=nodes[j];d=((x-x2)**2+(y-y2)**2)**.5
    if d<230 and r.random()>.32:parts.append(L((x,y),(x2,y2),f'stroke="{other}" stroke-opacity="{.12+r.random()*.35:.2f}" stroke-width="2"'))
  for i,(x,y) in enumerate(nodes):
   parts.append(f'<circle cx="{x}" cy="{y}" r="{9 if i%6 else 22}" fill="{neon}" fill-opacity="{.4 if i%6 else .82}" stroke="{other}" stroke-width="3"/>')
  parts.append(f'<g stroke="{neon}" opacity=".6" fill="none"><circle cx="870" cy="490" r="240" stroke-dasharray="9 24"/><circle cx="870" cy="490" r="300"/></g>')
 elif name=='analytics':
  for i in range(11):
   x=350+i*103;height=int(100+600*math.exp(-((i-7)**2)/25)+r.randint(-95,90))
   y=795-height
   parts.append(f'<rect x="{x}" y="{y}" width="55" height="{height}" fill="url(#glass)" stroke="{neon}" stroke-width="3" stroke-opacity=".7"/>')
   parts.append(f'<path d="M{x} {y}l35 -29h55l-35 29" fill="{other}" opacity=".7"/><path d="M{x+55} {y}l35 -29v{height}l-35 29" fill="{other}" opacity=".3"/>')
  parts.append(f'<path d="M320 667C520 420 600 650 785 370S1100 280 1440 168" stroke="{neon}" stroke-width="9" fill="none"/><path d="M320 667C520 420 600 650 785 370S1100 280 1440 168" stroke="{neon}" stroke-width="20" fill="none" opacity=".32" filter="url(#glow)"/>')
 elif name=='deadzone':
  for i in range(11):
   x=360+i*97;y=210+(i%3)*78
   parts.append(f'<path d="M{x} {y+350}l145 -83 0 -185 -145 83z" fill="{other}" fill-opacity=".16" stroke="{neon}" stroke-opacity=".47" stroke-width="4"/><path d="M{x} {y+350}l-150 -80V85l150 80" fill="{other}" fill-opacity=".2" stroke="{neon}" stroke-opacity=".45" stroke-width="3"/>')
  parts.append(f'<text x="470" y="590" fill="{neon}" font-weight="900" letter-spacing="-16" font-size="180" font-family="sans-serif" opacity=".85">DEAD</text><text x="740" y="740" fill="#fff" font-weight="900" letter-spacing="-14" font-size="160" font-family="sans-serif" opacity=".6">ZONE</text>')
 elif name=='risk':
  for i in range(7):parts.append(f'<circle cx="990" cy="480" r="{95+i*69}" fill="none" stroke="{neon}" stroke-width="{2 if i%2 else 4}" opacity="{.57-.06*i:.2f}" stroke-dasharray="{30+i*6} {25+i*4}"/>')
  parts.append(f'<path d="M990 205L1270 710H710Z" fill="{other}" fill-opacity=".16" stroke="{neon}" stroke-width="14"/><path d="M990 340v215" stroke="{neon}" stroke-width="29"/><circle cx="990" cy="620" r="20" fill="{neon}"/><g font-family="monospace" fill="{neon}" font-size="29" opacity=".8"><text x="190" y="310">THREAT LEVEL: MODELLED</text><text x="190" y="361">STRIDE / DREAD</text><text x="190" y="410">SIMULATION READY</text></g>')
 parts.append('</svg>')
 (out/(name+'.svg')).write_text('\n'.join(parts))
 print(name,(out/(name+'.svg')).stat().st_size)
