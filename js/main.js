(function(){
  document.querySelectorAll('img[data-k]').forEach(i => i.src = K[i.dataset.k]);
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
  const ss = (a,b,v) => { const t = clamp((v-a)/(b-a)); return t*t*(3-2*t); };
  const lerp = (a,b,t) => a+(b-a)*t;

  /* ---------- site map ---------- */
  const MAP = [
    {id:'nosotros', name:'Nosotros', desc:'Una empresa de más de 27 años en el norte de México.', subs:[['quienes-somos','Quiénes somos'],['historia','Historia'],['mision-vision-valores','Misión, visión y valores']]},
    {id:'servicios-cap', name:'Servicios', desc:'Transporte de carga sencillo y full, y venta de equipo.', subs:[['servicios','Servicios'],['industrias','Industrias'],['cobertura','Cobertura'],['escala-operativa','Escala operativa']]},
    {id:'por-que-nosotros', name:'¿Por qué nosotros?', desc:'Control operativo en tiempo real y estándares auditables.', subs:[['lo-que-nos-diferencia','Lo que nos diferencia'],['rastreo-gps','Rastreo GPS 24/7'],['certificaciones','Certificaciones'],['testimonios','Clientes'],['empresas','Empresas que operan con nosotros']]},
    {id:'cultura-cap', name:'Cultura', desc:'Las personas que sostienen la operación.', subs:[['cultura','Cultura'],['nuestra-gente','Nuestra gente']]},
    {id:'bolsa-de-trabajo', name:'Bolsa de trabajo', desc:'¿Estás hecho para crecer?', subs:[['reclutamiento','Reclutamiento']]},
    {id:'trabajemos-juntos', name:'Trabajemos juntos', desc:'Que tu operación no se detenga.', subs:[['formulario','Formulario']]}
  ];
  const PH = c => '#' + c.id.replace('-cap','');
  $('#menu').innerHTML = MAP.map(c => `<div class="item"><a href="${PH(c)}" data-pgl="${c.id}">${c.name}</a><div class="fly"><div class="wide"><div><small>${c.name}</small><div class="big">${c.subs.map(s => `<a href="#${s[0]}">${s[1]}</a>`).join('')}</div></div><p>${c.desc}</p></div></div></div>`).join('');
  $('#mnav').innerHTML = MAP.map(c => `<details><summary>${c.name}</summary><div>${c.subs.map(s => `<a href="#${s[0]}">${s[1]}</a>`).join('')}</div></details>`).join('');
  $('#fcols').innerHTML = MAP.map(c => `<div><h4>${c.name}</h4>${c.subs.map(s => `<a href="#${s[0]}">${s[1]}</a>`).join('')}</div>`).join('');

  // flyout dim + close on click
  $$('#menu .item').forEach(it => {
    it.addEventListener('mouseenter', () => document.body.classList.add('flying'));
    it.addEventListener('mouseleave', () => document.body.classList.remove('flying'));
    it.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('flying'); a.blur(); $('#gnav').classList.add('flyoff'); }));
    it.addEventListener('mouseleave', () => $('#gnav').classList.remove('flyoff'));
  });
  const burger = $('#burger');
  burger.addEventListener('click', () => { const o = document.body.classList.toggle('mopen'); burger.setAttribute('aria-expanded', o); });
  $$('#mnav a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('mopen'); burger.setAttribute('aria-expanded', false); }));

  /* ---------- sub nav per chapter ---------- */
  const snav = $('#snav'), chname = $('#chname'), snl = $('#snavlinks'), tog = $('#tog');
  let curCh = -1;
  function setChapter(i){
    if (i === curCh) return; curCh = i;
    if (i < 0){ $('#snavtitle').href = '#inicio'; snl.innerHTML = `<a class="pill sm" href="#trabajemos-juntos">Cotizar</a>`; }
    else { const c = MAP[i]; $('#snavtitle').href = PH(c); snl.innerHTML = c.subs.map(s => `<a href="#${s[0]}" data-sub="${s[0]}">${s[1]}</a>`).join('') + `<a class="pill sm" href="#trabajemos-juntos">Cotizar</a>`; }
    snl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { snav.classList.remove('open'); tog.setAttribute('aria-expanded', false); }));
  }
  tog.addEventListener('click', () => { const o = snav.classList.toggle('open'); tog.setAttribute('aria-expanded', o); });
  const chEls = MAP.map(c => document.getElementById(c.id));
  const subEls = MAP.flatMap(c => c.subs.map(s => document.getElementById(s[0])));
  const lightSecs = $$('.sec-white, .sec-light');
  setChapter(-1);

  /* ---------- reveal + counters ---------- */
  const doneC = new WeakSet();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(el => {
      if (doneC.has(el)) return; doneC.add(el);
      const n = +el.dataset.count, t0 = performance.now();
      if (reduce){ el.textContent = n; return; }
      const tick = now => { const k = Math.min(1,(now-t0)/2000), e2 = 1-Math.pow(1-k,4); el.textContent = Math.round(n*e2); if (k<1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.unobserve(e.target);
  }), {threshold:.15});
  const watch = () => $$('.rv:not(.in)').forEach(el => io.observe(el));

  /* ---------- segmented helper ---------- */
  function seg(sel, labels, onPick){
    const el = $(sel);
    if (labels) el.innerHTML = labels.map((l,i) => `<button role="tab" aria-selected="${i===0}">${l}</button>`).join('');
    const bs = [...el.children];
    const pick = i => { bs.forEach((b,j) => { b.setAttribute('aria-selected', i===j); b.tabIndex = i===j?0:-1; }); onPick(i); };
    bs.forEach((b,i) => { b.addEventListener('click', () => pick(i)); b.addEventListener('keydown', e => { if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)){ e.preventDefault(); const d = (e.key==='ArrowRight'||e.key==='ArrowDown')?1:-1; const n=(i+d+bs.length)%bs.length; bs[n].focus(); pick(n); } }); });
    pick(0); return pick;
  }

  /* ---------- row paddles ---------- */
  $$('[data-row]').forEach(b => {
    const row = document.getElementById(b.dataset.row);
    const step = () => row.firstElementChild.offsetWidth + 22;
    b.addEventListener('click', () => row.scrollBy({left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth'}));
    const upd = () => { if (+b.dataset.dir < 0) b.disabled = row.scrollLeft < 10; else b.disabled = row.scrollLeft > row.scrollWidth - row.clientWidth - 10; };
    row.addEventListener('scroll', upd, {passive:true}); upd();
  });

  /* ---------- modal ---------- */
  const mdata = [
    {tag:'Transporte de carga', h:'Flota propia para cada carga', p:'Carga sencilla con caja seca de 53 pies, carga full con doble caja seca de 48 pies y planas full con doble plataforma para carga voluminosa o de dimensiones especiales. Flota propia y sin intermediarios desde nuestras bases en el norte de México y Laredo, Texas, con rastreo 24/7 y operadores capacitados.', f:[['100+','tractocamiones propios'],['300+','cajas secas y planas'],['98%','entregas a tiempo']], img:'9d85dc.jpg'},
    {tag:'Hechos para renovar', h:'Seminuevos', p:'Venta de tractocamiones, cajas secas y accesorios: equipo que conocemos por dentro, porque lo operamos todos los días.', f:[['Tractocamiones','','17be22.jpg','60% 50%'],['Cajas secas','','d3dd4e.jpg','70% 50%'],['Accesorios','','9d85dc.jpg','50% 60%']], sm:true, img:'228815.jpg'},
    {tag:'Transporte de carga', h:'Cajas Secas', p:'Configuración de doble caja seca de 48 pies para mover más volumen en cada viaje y optimizar el costo por tonelada, con la misma flota propia, rastreo 24/7 y operadores capacitados.', f:[['100+','tractocamiones propios'],['300+','cajas secas y planas'],['24/7','rastreo GPS']], img:'17be22.jpg'},
    {tag:'Transporte de carga', h:'Plataformas Full', p:'Configuración de doble plataforma para mover carga voluminosa, estructural o de dimensiones especiales en un solo viaje, con flota propia, rastreo 24/7 y operadores capacitados.', f:[['100+','tractocamiones propios'],['300+','cajas secas y planas'],['24/7','rastreo GPS']], img:'d3dd4e.jpg'}
  ];
  const modal = $('#modal'); let lastFocus;
  const openM = i => { const d = mdata[i]; lastFocus = document.activeElement; $('#mt').textContent = d.tag; $('#mh').textContent = d.h; $('#mp').textContent = d.p; $('#mf').classList.toggle('sm', !!d.sm); $('#mf').innerHTML = d.f.map(x => `<div${x[2]?` tabindex="0" data-img="${x[2]}" data-pos="${x[3]}"`:''}><b>${x[0]}</b>${x[1]?`<span>${x[1]}</span>`:''}</div>`).join(''); const mi = $('#mi'); mi.src = K[d.img]; mi.style.objectPosition = ''; const swap = (src,pos) => { if (mi.dataset.cur === src) return; mi.dataset.cur = src; mi.style.opacity = 0; setTimeout(() => { mi.src = K[src]; mi.style.objectPosition = pos || ''; mi.style.opacity = 1; }, 180); }; mi.dataset.cur = d.img; $$('#mf [data-img]').forEach(c => { const on = () => { $$('#mf [data-img]').forEach(x => x.classList.toggle('hot', x === c)); swap(c.dataset.img, c.dataset.pos); }; c.addEventListener('mouseenter', on); c.addEventListener('focus', on); c.addEventListener('click', on); }); $('#mf').onmouseleave = () => { $$('#mf [data-img]').forEach(x => x.classList.remove('hot')); swap(d.img, ''); }; modal.classList.add('open'); document.body.style.overflow = 'hidden'; $('#mx').focus(); };
  const closeM = () => { modal.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
  $$('[data-modal]').forEach(b => b.addEventListener('click', () => openM(+b.dataset.modal)));
  $('#mx').addEventListener('click', closeM);
  modal.addEventListener('click', e => { if (e.target === modal) closeM(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeM(); });


  /* aviso de privacidad */
  (function(){
    const pm = $('#pmodal'); let lf;
    const docs = {
      privacidad: {t:'Aviso de privacidad', m:'SEC-MX-PL014 · Rev. 05', imgs:['aviso.jpg'], alt:'Aviso de privacidad de Super Express La Chicharra S.A. de C.V.'},
      responsabilidad: {t:'Aviso de responsabilidad', m:'SEC-MX-PL016 · Reclutamiento · Octubre 2026', imgs:['resp1.jpg','resp2.jpg'], alt:'Aviso de responsabilidad sobre el uso de inteligencia artificial en el proceso de reclutamiento'}
    };
    const open = e => { if (e) e.preventDefault(); const d = docs[e.currentTarget.dataset.aviso] || docs.privacidad;
      $('#pmh').textContent = d.t; $('#pmmeta').textContent = d.m;
      $('#pmdocs').innerHTML = d.imgs.map((k,i) => `<img class="pmdoc" src="${K[k]}" alt="${d.alt}${d.imgs.length>1?', página '+(i+1):''}">`).join('');
      pm.querySelector('.box').scrollTop = 0; pm.scrollTop = 0;
      lf = document.activeElement; pm.classList.add('open'); document.body.style.overflow = 'hidden'; $('#pmx').focus(); };
    const close = () => { pm.classList.remove('open'); document.body.style.overflow = ''; if (lf) lf.focus(); };
    $$('[data-aviso]').forEach(a => a.addEventListener('click', open));
    $('#pmx').addEventListener('click', close);
    pm.addEventListener('click', e => { if (e.target === pm) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && pm.classList.contains('open')) close(); });
  })();
  /* ---------- industries ---------- */
  const inds = [
    ['Retail / Consumo','Ventanas de entrega estrictas en centros de distribución y anaqueles que no pueden quedarse vacíos.','d3dd4e.jpg','70%'],
    ['Automotriz','Producción continua donde un retraso detiene la línea.','9d85dc.jpg','50%'],
    ['Industrial / Metalmecánica','Carga pesada y plataformas para operaciones que no se detienen.','228815.jpg','40%'],
    ['Farmacéutica','Trazabilidad completa y cumplimiento documentado en cada traslado.','0b6a78.jpg','60%'],
    ['Tecnología / Electrónica','Seguridad, monitoreo 24/7 y cruces fronterizos con CTPAT.','17be22.jpg','55%']
  ];
  const ishow = $('#ishow');
  ishow.insertAdjacentHTML('afterbegin', inds.map(d => `<img src="${K[d[2]]}" style="object-position:${d[3]} center" alt="" loading="lazy">`).join(''));
  const iimgs = [...ishow.querySelectorAll('img')];
  let indI = 0, indTimer;
  const pickInd = seg('#indseg', inds.map(d => d[0]), i => {
    indI = i; iimgs.forEach((im,j) => im.classList.toggle('on', j===i));
    $('#itxt').innerHTML = `<div class="anim"><b>${inds[i][0]}</b><span>${inds[i][1]}</span></div>`;
    clearTimeout(indTimer); if (!reduce) indTimer = setTimeout(() => pickInd((indI+1)%inds.length), 6000);
  });

  /* ---------- coverage scrolly ---------- */
  const bases = [
    {name:'Monterrey', st:'Nuevo León', d:'Oficinas centrales y base principal. Desde aquí coordinamos la operación del norte.', x:51, y:40, ax:59.91, ay:80.57},
    {name:'Nuevo Laredo', st:'Tamaulipas', d:'Puerta al principal cruce comercial con Estados Unidos.', x:56.5, y:34.5, ax:63.9, ay:62.7},
    {name:'Laredo, TX', st:'Texas, EE. UU', d:'Presencia del otro lado de la frontera para operaciones de comercio exterior.', x:58, y:29.5, ax:65.5, ay:59.8},
    {name:'Chihuahua', st:'Chihuahua', d:'Cobertura para la industria manufacturera del centro-norte.', x:34.2, y:28.7, ax:26.06, ay:49.11},
    {name:'Cd. Juárez', st:'Chihuahua', d:'Conexión con el corredor maquilador y el cruce hacia El Paso.', x:29.4, y:14, ax:23.97, ay:15.49}
  ].map(b => ({...b, px:b.x*12.6, py:b.y*7.8}));
  $('#steps').innerHTML = bases.map((b,i) => `<div class="step"><span>0${i+1} de 05</span><b>${b.name}</b><p>${b.st}. ${b.d}</p></div>`).join('') +
    `<div class="step"><span>Capacidad. Infraestructura. Territorio.</span><b>Todo el norte, conectado.</b><p>Bases operando 24/7 donde la industria lo exige.</p></div>`;
  const curve = (A,B) => { const mx=(A.px+B.px)/2, my=(A.py+B.py)/2 - Math.hypot(B.px-A.px,B.py-A.py)*.18; return `M${A.px},${A.py} Q${mx},${my} ${B.px},${B.py}`; };
  const links = [[0,1],[1,2],[0,3],[3,4]];
  $('#mapSvg').innerHTML = links.map(([a,b]) => `<path class="route" data-to="${b}" d="${curve(bases[a],bases[b])}"/>`).join('') +
    bases.map((b,i) => { const left = i===0, dy = i===1 ? '1.15em' : (i===2 ? '-.25em' : '.35em'); return `<g class="pin"><circle class="halo" cx="${b.px}" cy="${b.py}"/><circle class="core" cx="${b.px}" cy="${b.py}"/><text x="${b.px}" y="${b.py}" dx="${left?'-.7em':'.7em'}" dy="${dy}" text-anchor="${left?'end':'start'}">${b.name}</text></g>`; }).join('');
  const routes = $$('#mapSvg .route'); routes.forEach(p => p.style.setProperty('--len', p.getTotalLength()));
  const pins = $$('#mapSvg .pin'), stepsEl = $$('.step'), zm = $('#zm');
  const setBase = i => {
    stepsEl.forEach((s,j) => s.classList.toggle('on', j===i));
    const all = i >= bases.length;
    pins.forEach((p,j) => p.classList.toggle('on', all || j===i));
    routes.forEach(r => r.classList.toggle('on', all || +r.dataset.to <= i));
    const zm = document.getElementById('zm');
    if (i < 0 || all){ zm.style.setProperty('--s', 1); zm.style.setProperty('--tx', 0); zm.style.setProperty('--ty', 0); return; }
    const S = 1, b = bases[i];
    const cl = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    zm.style.setProperty('--s', S);
    zm.style.setProperty('--tx', cl(50 - b.x*S, (1-S)*100, 0));
    zm.style.setProperty('--ty', cl(50 - b.y*S, (1-S)*100, 0));
  };
  let curBase = null, sbRaf = 0;
  const syncBase = () => {
    sbRaf = 0;
    const vis = stepsEl.filter(s => s.offsetParent);
    if (!vis.length) return;
    const mb = document.querySelector('.cov .mapbox');
    const r = mb ? mb.getBoundingClientRect() : null;
    const stacked = r && r.width > innerWidth * .8;
    const line = stacked ? r.bottom + (innerHeight - r.bottom) * .5 : innerHeight * .5;
    let k = -1;
    if (vis[0].getBoundingClientRect().top <= line) {
      let best = Infinity;
      vis.forEach(s => { const q = s.getBoundingClientRect(), d = Math.abs(q.top + q.height * .5 - line); if (d < best) { best = d; k = stepsEl.indexOf(s); } });
    }
    if (k !== curBase) { curBase = k; setBase(k); }
  };
  addEventListener('scroll', () => { if (!sbRaf) sbRaf = requestAnimationFrame(syncBase); }, {passive:true});
  addEventListener('resize', syncBase); addEventListener('hashchange', () => setTimeout(syncBase, 60));
  setBase(-1); syncBase();

  /* ---------- GPS ---------- */
  const ops = [
    {t:'Rastreo activo', pts:['Rastreo GPS activo 24/7','Monitoreo satelital continuo','Sistema anti-jammer'], cap:'Ubicación permanente.'},
    {t:'Supervisión operativa', pts:['Centro de control propio','Seguimiento en tiempo real','Alertas preventivas'], cap:'Monitoreo de operación.'},
    {t:'Integración tecnológica', pts:['Tecnología Samsara','Reportes automatizados','Trazabilidad completa'], cap:'Datos que respaldan decisiones.'}
  ];
  seg('#opsseg', ops.map(o => o.t), i => { $('#opsList').innerHTML = ops[i].pts.map(p => `<li>${p}</li>`).join(''); $('#opsCap').textContent = ops[i].cap; });
  const gps = $('#gps');
  const gb = bases.map(b => ({...b, gx:(b.x-22)/42*520, gy:(b.y-9)/36*340}));
  const gcurve = (a,b) => { const A=gb[a],B=gb[b],mx=(A.gx+B.gx)/2+(B.gy-A.gy)*.15,my=(A.gy+B.gy)/2-(B.gx-A.gx)*.15; return `M${A.gx},${A.gy} Q${mx},${my} ${B.gx},${B.gy}`; };
  let grid = ''; for (let x=0;x<=520;x+=40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="340"/>`; for (let y=0;y<=340;y+=40) grid += `<line x1="0" y1="${y}" x2="520" y2="${y}"/>`;
  const gl = [[0,1],[1,2],[0,3],[3,4],[0,2]];
  gps.innerHTML = `<g stroke="#1c1c1f">${grid}</g>` + gl.map(([a,b],i) => `<path id="gr${i}" d="${gcurve(a,b)}" fill="none" stroke="#4a4a4f" stroke-width="3" stroke-linecap="round"/>`).join('') +
    gb.map((b,i) => `<g><circle cx="${b.gx}" cy="${b.gy}" r="5" fill="#fff"/><text x="${i===0?b.gx-10:b.gx+10}" text-anchor="${i===0?'end':'start'}" y="${i===1?b.gy+18:(i===0?b.gy+16:b.gy-9)}" fill="#86868b" font-size="12" font-family="Kind Sans, sans-serif">${b.name}</text></g>`).join('') + '<g id="trucks"></g>';
  const units = [{id:'LC-2499',r:0,s:.045,o:.1,dir:1,dest:'Nuevo Laredo'},{id:'LC-1873',r:2,s:.028,o:.5,dir:1,dest:'Laredo, TX'},{id:'LC-0915',r:3,s:.035,o:.3,dir:-1,dest:'Chihuahua'},{id:'LC-2273',r:2,s:.03,o:.7,dir:-1,dest:'Monterrey'},{id:'LC-1402',r:4,s:.04,o:.6,dir:1,dest:'Laredo, TX'}];
  const tg = $('#trucks');
  tg.innerHTML = units.map(u => `<g style="cursor:pointer"><circle r="14" fill="#DD3224" opacity="0"/><circle r="6" fill="#DD3224" stroke="#fff" stroke-width="2"/><text y="-12" text-anchor="middle" fill="#fff" font-size="11" font-family="Kind Sans, sans-serif" opacity="0">${u.id}</text></g>`).join('');
  const tks = [...tg.children], paths = gl.map((_,i) => document.getElementById('gr'+i));
  $('#units').innerHTML = units.map((u,i) => `<button aria-pressed="${i===0}"><b>${u.id}</b>A ${u.dest}<br><i id="sp${i}">En ruta</i></button>`).join('');
  let selU = 0; const ubs = $$('#units button');
  ubs.forEach((b,i) => b.addEventListener('click', () => { selU = i; ubs.forEach((x,j) => x.setAttribute('aria-pressed', i===j)); }));
  tks.forEach((g,i) => g.addEventListener('click', () => ubs[i].click()));

  /* ---------- standards ---------- */
  const std = [
    {t:'Seguridad', pts:['Protocolos internos de seguridad','Prevención de riesgos operativos','Control de unidades y operadores']},
    {t:'Certificaciones', pts:['Procesos alineados a estándares internacionales','Operación auditada','Cumplimiento documentado']},
    {t:'Control y trazabilidad', pts:['Registro digital de procesos','Validación operativa continua','Historial verificable']}
  ];

  /* ---------- testimonials + logos ---------- */
  const td = [
    {q:'[Testimonio de cliente: una o dos frases sobre cómo La Chicharra respondió.]', w:'[Nombre], [Puesto, Empresa]'},
    {q:'[Testimonio de cliente: ventanas cumplidas, comunicación o seguimiento.]', w:'[Nombre], [Puesto, Empresa]'},
    {q:'[Testimonio de cliente: una situación difícil que se resolvió.]', w:'[Nombre], [Puesto, Empresa]'}
  ];
  let ti = 0; const qEl = $('#quote');
  const showQ = (i, anim) => { ti = (i+td.length)%td.length; const set = () => { qEl.textContent = '“'+td[ti].q+'”'; $('#who').textContent = td[ti].w; qEl.classList.remove('out'); }; if (anim && !reduce){ qEl.classList.add('out'); setTimeout(set, 400); } else set(); };
  $('#qp').addEventListener('click', () => showQ(ti-1, true)); $('#qn').addEventListener('click', () => showQ(ti+1, true));
  showQ(0);
  const logos = [['146814.png','Soriana'],['2528c1.png','Walmart'],['39573c.png','Amsa'],['4779b7.png','Lala'],['d8aa25.png','Vitro'],['7e3a1a.png','Daltile']];
  $('#lgrid').innerHTML = logos.map((l,i) => `<div class="rv${i%3?' d'+(i%3):''}"><img src="${K[l[0]]}" alt="${l[1]}"></div>`).join('');
  $$('#lgrid > div').forEach(d => d.addEventListener('click', () => { const on = !d.classList.contains('on'); $$('#lgrid > div').forEach(x => x.classList.remove('on')); d.classList.toggle('on', on); }));

  /* ---------- culture accordion ---------- */
  const pil = [
    {t:'Responsabilidad compartida', p:'Entender que la operación es de todos.', x:'Cada área, cada unidad y cada persona entiende el impacto de su trabajo en el cumplimiento de la promesa de servicio.', img:'228815.jpg'},
    {t:'Relación humana', p:'Construir confianza a través de las personas.', x:'Siempre hay una mejor manera de hacerlo. Aprendemos de la operación, corregimos rápido y buscamos elevar el estándar todos los días.', img:'0b6a78.jpg'},
    {t:'Presencia', p:'Estar donde la operación lo exige.', x:'No desaparecemos cuando surge un problema. Nos involucramos, damos seguimiento y permanecemos cerca hasta resolver.', img:'d3dd4e.jpg'},
    {t:'Permanencia', p:'Acompañar hasta que el trabajo esté resuelto.', x:'No soltamos la responsabilidad a mitad del camino. Damos seguimiento, mantenemos comunicación y permanecemos involucrados hasta cumplir.', img:'17be22.jpg'}
  ];
  $('#acc').innerHTML = pil.map((p,i) => `<div class="ai rv"><button aria-expanded="false" aria-controls="ab${i}">${p.t}<span class="pl" aria-hidden="true">+</span></button><div class="bd" id="ab${i}"><div><p><b>${p.p}</b>${p.x}</p></div></div></div>`).join('');
  const accimg = $('#accimg');
  accimg.insertAdjacentHTML('afterbegin', pil.map(p => `<img src="${K[p.img]}" alt="" loading="lazy">`).join(''));
  const ais = $$('.ai'), aimgs = [...accimg.querySelectorAll('img')];
  const openA = i => { ais.forEach((a,j) => { a.classList.toggle('on', j===i); a.querySelector('button').setAttribute('aria-expanded', j===i); }); aimgs.forEach((im,j) => im.classList.toggle('on', j===i)); $('#accn').textContent = '0'+(i+1); };
  ais.forEach((a,i) => a.querySelector('button').addEventListener('click', () => openA(i)));
  openA(0);

  /* ---------- recruiting roles + forms ---------- */
  const roles = [
    ['Operador','Hecho para conducir.','<path d="M6 26h28M10 26l3-10h14l3 10"/><circle cx="13" cy="30" r="3"/><circle cx="27" cy="30" r="3"/>'],
    ['Monitoreo','Hecho para vigilar cada ruta.','<rect x="5" y="8" width="30" height="20" rx="2"/><path d="M15 34h10M20 28v6"/>'],
    ['Tráfico','Hecho para coordinar.','<path d="M8 32V8M8 10h20l-4 6 4 6H8"/>'],
    ['Mecánico','Hecho para responder.','<path d="M26 6a7 7 0 0 0-8 9L7 26l4 4 11-11a7 7 0 0 0 9-8l-4 4-4-1-1-4z"/>'],
    ['Personal de patio','Hecho para cumplir.','<rect x="6" y="12" width="20" height="16"/><path d="M26 18h6l3 5v5h-9"/><circle cx="12" cy="30" r="3"/><circle cx="30" cy="30" r="3"/>'],
    ['Administrativo','Hecho para que todo avance.','<path d="M8 4h18l6 6v26H8z"/><path d="M14 18h12M14 24h12M14 30h8"/>']
  ];
  $('#roles').innerHTML = roles.map((r,i) => `<button class="role rv${i%3?' d'+(i%3):''}" type="button" aria-pressed="${i===0}"><svg viewBox="0 0 40 40" aria-hidden="true">${r[2]}</svg><b>${r[0]}</b><span>${r[1]}</span><i>Postularme</i></button>`).join('');
  function chips(sel, list){
    $(sel).innerHTML = list.map((l,i) => `<button type="button" aria-pressed="${i===0}">${l}</button>`).join('');
    const bs = $$(sel+' button'); let v = list[0];
    const set = i => { bs.forEach((x,j) => x.setAttribute('aria-pressed', i===j)); v = list[i]; };
    bs.forEach((b,i) => b.addEventListener('click', () => set(i)));
    return {get:() => v, set};
  }
  const puesto = chips('#puestos', roles.map(r => r[0]));
  const roleBs = $$('.role');
  roleBs.forEach((b,i) => b.addEventListener('click', () => {
    roleBs.forEach((x,j) => x.setAttribute('aria-pressed', i===j)); puesto.set(i);
    $('#jf').scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
  }));
  const industria = chips('#inds', [...inds.map(d => d[0]), 'Otros']);
  function stepper(form, check, ok){
    const steps = [...form.querySelectorAll('.fstep')], bar = form.querySelector('.prog i'); let s = 0;
    const go = n => { s = n; steps.forEach((x,i) => x.classList.toggle('on', i===s)); bar.style.width = ((s+1)/steps.length*100)+'%'; };
    form.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => go(s+1)));
    form.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => go(s-1)));
    form.addEventListener('submit', async e => { e.preventDefault(); const m = check(); const er = steps[s].querySelector('.err'); if (er) er.textContent = m || ''; if (m) return;
      const sb = form.querySelector('button[type=submit]'), lbl = sb.textContent; sb.disabled = true; sb.textContent = 'Enviando…';
      let r; try { r = await ok(); } finally { sb.disabled = false; sb.textContent = lbl; }
      if (r === false){ if (er) er.textContent = 'No pudimos enviar tu solicitud. Intenta de nuevo o llámanos al +52 (81) 1636 9850.'; return; }
      form.classList.add('sent'); form.querySelector('[data-reset]').focus(); });
    form.querySelector('[data-reset]').addEventListener('click', () => { form.reset(); form.classList.remove('sent'); go(0); });
    go(0);
  }
  const HOJA = 'https://script.google.com/macros/s/AKfycbw5Er_S7Fiu_8eS7PfNYIQarvhKEriNTDTTkSWHYnhKUCC-hSP9-1omrKTYFpINU-zh/exec';
  async function aHoja(payload){
    try {
      const res = await fetch(HOJA, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify(payload)});
      const t = (await res.text()).trim();
      if (!res.ok || t !== 'ok') { console.warn('Google Sheets:', res.status, t.slice(0,200)); return false; }
      return true;
    } catch (err) { console.warn('Google Sheets:', err); return false; }
  }
  stepper($('#jf'), () => { if (!$('#jn').value.trim()) return 'Escribe tu nombre completo.'; if ($('#jt').value.replace(/\D/g,'').length < 10) return 'Escribe un teléfono de 10 dígitos.'; },
    async () => {
      const pu = puesto.get(), ba = $('#jb').value;
      const ok = await aHoja({tipo:'empleo', _honey:($('#jf [name=_hp]')||{}).value || '',
        datos:{'Puesto de interés':pu, 'Base más cercana':ba, 'Nombre completo':$('#jn').value.trim(), 'Teléfono / WhatsApp':$('#jt').value.trim()}});
      if (!ok) return false;
      $('#jdone').textContent = `Recibimos tu solicitud para ${pu.toLowerCase()} en ${ba}. Te contactamos pronto.`;
    });
  stepper($('#qf'), () => { if (!$('#qnm').value.trim() || !$('#qe').value.trim()) return 'Escribe tu nombre y empresa.'; if ($('#qt').value.replace(/\D/g,'').length < 10) return 'Escribe un teléfono de 10 dígitos.'; if (!/^\S+@\S+\.\S+$/.test($('#qm').value)) return 'Escribe un correo válido.'; },
    async () => {
      const ind = industria.get(), v = id => $(id).value.trim();
      const ok = await aHoja({tipo:'clientes', _honey:($('#qf [name=_hp]')||{}).value || '',
        datos:{'Industria':ind, 'Origen':v('#qo') || '—', 'Destino':v('#qd') || '—', 'Operación':v('#qx') || '—', 'Nombre':v('#qnm'), 'Empresa':v('#qe'), 'Teléfono':v('#qt'), 'Correo':v('#qm')}});
      if (!ok) return false;
      $('#qdone').textContent = (ind === 'Otros' ? 'Recibimos tu solicitud.' : `Recibimos tu solicitud para ${ind.toLowerCase()}.`) + ' Un asesor te contactará pronto.';
    });

  watch();

  /* ---------- router: una página por sección ---------- */
  const pages = $$('.page');
  let curPage = -1;
  const hpImgs = ['0b6a78.jpg','9d85dc.jpg','d3dd4e.jpg','228815.jpg','17be22.jpg',null];
  $('#hpgrid').innerHTML = MAP.map((c,i) => `<a class="hp rv${i%3?' d'+(i%3):''}${hpImgs[i]?'':' red'}" href="${PH(c)}">${hpImgs[i]?`<img src="${K[hpImgs[i]]}" alt="" loading="lazy">`:''}<div class="no">0${i+1}</div><b>${c.name}</b><span>${c.desc}</span><i>Ver página</i></a>`).join('');
  MAP.forEach((c,i) => {
    const nx = MAP[(i+1) % MAP.length], last = i === MAP.length-1;
    const a = document.createElement('a'); a.className = 'nextpg'; a.href = last ? '#inicio' : PH(nx);
    a.innerHTML = `<small>${last ? 'De vuelta al inicio' : 'Siguiente'}</small><b>${last ? 'La Chicharra.' : nx.name}</b><i>${last ? 'Ir al inicio' : 'Continuar'}</i>`;
    document.getElementById(c.id).appendChild(a);
  });
  const titles = MAP.map(c => c.name + ' — La Chicharra Super Express');
  function route(smooth){
    const h = decodeURIComponent(location.hash.slice(1)) || 'inicio';
    let t = document.getElementById(h); if (!t || !t.closest('.page')) t = document.getElementById('inicio');
    const pg = t.closest('.page'), idx = MAP.findIndex(c => c.id === pg.id), changed = !pg.classList.contains('on');
    pages.forEach(p => p.classList.toggle('on', p === pg));
    curPage = idx;
    document.title = idx < 0 ? 'La Chicharra Super Express — Hechos para avanzar.' : titles[idx];
    $$('#menu .item > a').forEach(a => a.classList.toggle('cur', a.dataset.pgl === pg.id));
    document.body.classList.remove('flying','mopen'); snav.classList.remove('open');
    const isTop = t === pg || t.id === 'inicio' || (idx >= 0 && MAP[idx].subs[0][0] === t.id && MAP[idx].id.endsWith('-cap'));
    requestAnimationFrame(() => {
      if (isTop) scrollTo({top:0, behavior: changed || reduce ? 'auto' : 'smooth'});
      else t.scrollIntoView({behavior: changed || reduce || !smooth ? 'auto' : 'smooth'});
      $$('.grow').forEach(row => row.dispatchEvent(new Event('scroll')));
      watch();
    });
  }
  addEventListener('hashchange', () => route(true));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    if (a.getAttribute('href') === location.hash){ e.preventDefault(); route(true); }
  });
  route(false);

  /* ---------- scroll engine ---------- */
  const herov = $('#herov');
  if (herov){
    herov.src = 'video/' + (Math.max(innerWidth, innerHeight) * (devicePixelRatio > 1 ? 1.5 : 1) > 1100 ? 'hero-1600.mp4' : 'hero-540.mp4');
    if (reduce){ herov.removeAttribute('autoplay'); herov.pause(); }
    else herov.play().catch(() => {});
  }
  const seq = $('#quienes-somos'), seqbg = $('#seqbg'), lines = $$('.seq .line');
  const zoomSec = $('.zoom'), znum = $('#znum'), zcap = $('#zcap'), zbg = $('#zbg');
  znum.style.backgroundImage = zbg.style.backgroundImage = `url(${K['17be22.jpg']})`;
  const prog = el => { const r = el.getBoundingClientRect(); const d = r.height-innerHeight; return d > 0 ? clamp(-r.top/d) : 0; };
  let lastT = performance.now(), tt = 0;
  function frame(now){
    const dt = Math.min(.05,(now-lastT)/1000); lastT = now;
    // hero
    if (!reduce && herov && scrollY < innerHeight * 1.2){
      herov.style.transform = `translateY(${scrollY * .28}px) scale(${1 + Math.min(scrollY / innerHeight, 1) * .06})`;
    }
    // sequence
    const sp = prog(seq), n = lines.length;
    seqbg.style.transform = `scale(${lerp(1.25,1,sp)})`; seqbg.style.opacity = lerp(.55,1,ss(0,.2,sp));
    lines.forEach((l,i) => {
      const a = i/n, b = (i+1)/n, mid = (a+b)/2, last = i === n-1;
      const o = last ? ss(a,a+.08,sp) : ss(a,a+.06,sp) * (1 - ss(b-.06,b,sp));
      l.style.opacity = o; l.style.transform = `translateY(${last ? (1-ss(a,a+.1,sp))*40 : (sp-mid)*-140}px) scale(${lerp(.96,1,o)})`;
    });
    // chapter + subnav
    const probe = 110;
    setChapter(curPage);
    let curSub = null; (curPage >= 0 ? MAP[curPage].subs.map(x => document.getElementById(x[0])) : []).forEach(el => { if (el && el.getBoundingClientRect().top <= innerHeight*.45) curSub = el.id; });
    snl.querySelectorAll('[data-sub]').forEach(a => a.classList.toggle('on', a.dataset.sub === curSub));
    let light = false; for (const s of lightSecs){ const rr = s.getBoundingClientRect(); if (rr.top <= probe && rr.bottom > probe){ light = true; break; } }
    snav.classList.toggle('light', light);
    // barras transparentes sobre el video de portada
    const hero = $('#inicio');
    const over = curPage < 0 && hero && hero.getBoundingClientRect().bottom > 96;
    document.body.classList.toggle('overhero', !!over);
    // gps
    if (!reduce){
      tt += dt;
      units.forEach((u,i) => {
        const p = paths[u.r], L = p.getTotalLength();
        let k = (u.o + tt*u.s) % 1; if (u.dir < 0) k = 1-k;
        const pt = p.getPointAtLength(k*L), g = tks[i], on = i === selU;
        g.setAttribute('transform', `translate(${pt.x},${pt.y})`);
        g.children[0].setAttribute('opacity', on ? .25 + .15*Math.sin(tt*4) : 0);
        g.children[2].setAttribute('opacity', on ? 1 : 0);
        if (Math.floor(tt*2) !== Math.floor((tt-dt)*2)) $('#sp'+i).textContent = 'En ruta, ' + Math.round(72 + 14*Math.sin(tt*.7+i*2)) + ' km/h';
      });
    }
    $('#clock').textContent = new Date().toLocaleTimeString('es-MX',{hour12:false});
    requestAnimationFrame(frame);
  }
  if (reduce){ units.forEach((u,i)=>{ const p=paths[u.r], pt=p.getPointAtLength(u.o*p.getTotalLength()); tks[i].setAttribute('transform',`translate(${pt.x},${pt.y})`); }); }
  requestAnimationFrame(frame);
})();
