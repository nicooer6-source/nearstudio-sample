from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "public/assets/allancordero-source-1a87b09"
OLD_BASE = "/demo/allancordero-site/"
NEW_BASE = "/sample/assets/allancordero-source-1a87b09/"


for path in ROOT.rglob("*"):
    if path.is_file() and path.suffix.lower() in {".html", ".css", ".js", ".json", ".svg"}:
        source = path.read_text()
        if OLD_BASE in source:
            path.write_text(source.replace(OLD_BASE, NEW_BASE))


patches = {
    "_astro/IguanaStage.astro_astro_type_script_index_0_lang.C8xbamEf.js": (
        "EAT_BURST:.45};function",
        "EAT_BURST:.45};globalThis.__ALLAN_STAGE_CONFIGS__={...(globalThis.__ALLAN_STAGE_CONFIGS__||{}),iguana:o};function",
    ),
    "_astro/PortraitStage.astro_astro_type_script_index_0_lang.BKCpbpiW.js": (
        "FADE_NEAR:.9},ke=",
        "FADE_NEAR:.9};globalThis.__ALLAN_STAGE_CONFIGS__={...(globalThis.__ALLAN_STAGE_CONFIGS__||{}),portrait:t};const ke=",
    ),
    "_astro/HorseStage.astro_astro_type_script_index_0_lang.B1PGDu9A.js": (
        "HOVER_FOLLOW:.3};function",
        "HOVER_FOLLOW:.3};globalThis.__ALLAN_STAGE_CONFIGS__={...(globalThis.__ALLAN_STAGE_CONFIGS__||{}),horse:t};function",
    ),
}

for relative_path, (marker, replacement) in patches.items():
    path = ROOT / relative_path
    source = path.read_text()
    if "__ALLAN_STAGE_CONFIGS__" not in source:
        if marker not in source:
            raise SystemExit(f"Patch marker missing: {relative_path}")
        path.write_text(source.replace(marker, replacement, 1))


isolation_style = """<style id="nearstudio-stage-isolation">
html,body,.sections,.track{width:100%;height:100%;overflow:hidden!important}
body.gallery-stage .track{transform:none!important;will-change:auto!important}
body.gallery-stage .panel{display:none!important}
body.gallery-stage--hero #inicio,
body.gallery-stage--portrait #estudio,
body.gallery-stage--horse .panel--light{display:flex!important;position:fixed!important;inset:0!important;width:100%!important;height:100%!important;z-index:1!important;overflow:hidden!important}
body.gallery-stage--portrait #estudio{align-items:center!important;justify-content:center!important}
body.gallery-stage:not(.gallery-stage--hero) .hd-menu,
body.gallery-stage:not(.gallery-stage--hero) .menu-panel{display:none!important}
body.gallery-stage canvas{transition:filter .18s ease,transform .18s ease}
</style>"""

control_script = """<script>
(()=>{
  const stage=document.body.dataset.galleryStage;
  let current={};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)));
  const color=(v,fallback)=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):fallback;
  const rgb=(hex)=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
  const mix=(a,b,t)=>{const x=rgb(a),y=rgb(b);return '#'+x.map((n,i)=>Math.round(n+(y[i]-n)*t).toString(16).padStart(2,'0')).join('')};
  const apply=()=>{
    const p=current||{};
    const root=document.documentElement;
    const bg=color(p.backgroundColor,stage==='horse'?'#f4f4f2':'#0a0a0a');
    const ink=color(p.inkColor,stage==='horse'?'#0a0a0a':'#f4f4f2');
    const accent=color(p.accentColor,'#60ce8b');
    root.style.setProperty('--bg',stage==='horse'?ink:bg);
    root.style.setProperty('--ink',stage==='horse'?bg:ink);
    root.style.setProperty('--green',accent);
    root.style.setProperty('--green-rgb',rgb(accent).join(','));
    root.style.setProperty('--grain',String(clamp(p.grain??0.05,0,0.2)));
    const target=stage==='hero'?document.querySelector('#inicio'):stage==='portrait'?document.querySelector('#estudio'):document.querySelector('.panel--light');
    if(target) target.style.filter=`contrast(${clamp(p.contrast??1,.6,1.8)})`;
    const selector=stage==='hero'?'#fig':stage==='portrait'?'.pt-canvas':'#horse-fig';
    const canvas=document.querySelector(selector);
    if(canvas){canvas.style.transform=`scale(${clamp(p.sceneScale??1,.7,1.35)})`;canvas.style.transformOrigin='50% 50%'}
    const cfg=globalThis.__ALLAN_STAGE_CONFIGS__||{};
    if(stage==='hero'&&cfg.iguana){
      cfg.iguana.CELL=clamp(p.cellSize??12,6,20);
      cfg.iguana.CELL_NARROW=clamp((p.cellSize??12)/2,3,10);
      cfg.iguana.INK=accent;cfg.iguana.DIM=mix(bg,accent,.46);cfg.iguana.FAINT=mix(bg,accent,.22);
      cfg.iguana.MAX_SPEED=1.85*clamp(p.motionSpeed??1,.35,2.2);
      cfg.iguana.TURN_RATE=2.5*clamp(p.motionSpeed??1,.35,2.2);
      cfg.iguana.CRUMB_MAX=Math.round(clamp(p.foodCount??5,1,12));
    }
    if(stage==='portrait'&&cfg.portrait){
      cfg.portrait.CELL_FAR=clamp(p.cellFar??7,3,14);
      cfg.portrait.CELL_NEAR=clamp(p.cellNear??3.5,1.5,8);
      cfg.portrait.PULL=clamp(p.pull??2,.2,6);
      cfg.portrait.RANGE=clamp(p.pointerRange??420,100,800);
      cfg.portrait.CONTRAST=clamp(p.portraitContrast??2.2,.8,4);
      cfg.portrait.INK=rgb(accent);
      cfg.portrait.DOT=clamp(p.dotSize??.5,.2,1);
    }
    if(stage==='horse'&&cfg.horse){
      cfg.horse.CELL=clamp(p.cellSize??6,3,12);
      cfg.horse.CELL_SM=clamp((p.cellSize??6)*2/3,2,8);
      cfg.horse.INK=ink;cfg.horse.DIM=mix(bg,ink,.62);cfg.horse.FAINT=mix(bg,ink,.30);
      cfg.horse.FPS=16*clamp(p.motionSpeed??1,.25,2.5);
      cfg.horse.HOVER_RADIUS=clamp(p.hoverRadius??30,8,80);
      cfg.horse.HOVER_AMP=clamp(p.hoverStrength??7,0,18);
    }
    document.querySelectorAll('video').forEach(video=>{video.playbackRate=clamp(p.motionSpeed??1,.25,2.5)});
    dispatchEvent(new Event('resize'));
  };
  addEventListener('message',event=>{
    if(event.origin!==location.origin||event.data?.type!=='nearstudio:allan-config'||event.data.stage!==stage)return;
    current=event.data.parameters||{};apply();
  });
  addEventListener('click',event=>{
    const anchor=event.target.closest?.('a');
    if(anchor&&anchor.href.startsWith(location.origin+'/sample/assets/allancordero-source-1a87b09/')) event.preventDefault();
  });
  addEventListener('DOMContentLoaded',()=>{
    apply();
    setTimeout(()=>{
      apply();
      const panel=stage==='hero'?document.querySelector('#inicio'):stage==='portrait'?document.querySelector('#estudio'):document.querySelector('.panel--light');
      if(panel) dispatchEvent(new CustomEvent('snap:section',{detail:{panel}}));
      parent.postMessage({type:'nearstudio:allan-ready',stage},location.origin);
    },120);
  });
})();
</script>"""

base = (ROOT / "index.html").read_text()
for stage in ("hero", "portrait", "horse"):
    source = base.replace(
        "<body>",
        f'<body class="gallery-stage gallery-stage--{stage}" data-gallery-stage="{stage}">',
        1,
    )
    source = source.replace("</head>", isolation_style + "</head>", 1)
    source = source.replace("</body>", control_script + "</body>", 1)
    (ROOT / f"{stage}.html").write_text(source)
