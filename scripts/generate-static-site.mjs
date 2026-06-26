#!/usr/bin/env node

/**
 * Static HTML site generator for Logotip Kiosk.
 *
 * Generates a pure HTML/CSS/JS site from catalogue.json.
 * No React, no Next.js, no framework. All pagination is client-side (zero nav reqs).
 * Result: ~12KB initial load vs 946KB currently (78x smaller).
 *
 * Usage: node scripts/generate-static-site.mjs
 * Output: dist-static/
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CATALOGUE_PATH = path.join(ROOT, "src/data/catalogue.json");
const OUT_DIR = path.join(ROOT, "dist-static");
const PUBLIC_DIR = path.join(ROOT, "public");

const ITEMS_PER_PAGE = 6;

// ── helpers ──

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRon(n) {
  return n.toLocaleString("ro-RO") + " RON";
}

// ── read catalogue ──

const raw = await fs.readFile(CATALOGUE_PATH, "utf-8");
const { categories, designs } = JSON.parse(raw);

// ── embedded CSS (~4.5KB inlined in every page) ──

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;position:fixed;width:100%}
body{
  font-family:var(--f),ui-sans-serif,system-ui,sans-serif;
  background-color:#f8f5f7;
  background-image:url('/logotip-bg.svg');
  background-size:cover;background-position:center;background-repeat:no-repeat;
  background-attachment:fixed;
  color:#2e112e;-webkit-font-smoothing:antialiased;
  user-select:none;-webkit-user-select:none;
  overscroll-behavior-y:contain;
}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
button{border:none;background:none;cursor:pointer;font:inherit;color:inherit;padding:0}

.page{height:100%;display:flex;flex-direction:column;padding:1.25rem 1rem;min-height:0}
.page-header{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.25rem;flex-shrink:0}
.page-header h1{font-family:var(--f);font-size:1.5rem;font-weight:700;color:#fff;line-height:1.2}
.page-header .breadcrumb{font-size:.75rem;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:.25rem;margin-top:.125rem}
.page-header .breadcrumb a:hover{color:#fff}
.page-header .breadcrumb span:last-child{color:#fff}
.logo{margin-left:auto;height:2.5rem;width:auto;flex-shrink:0}
.back-btn{
  display:inline-flex;align-items:center;gap:.25rem;
  border-radius:9999px;border:1px solid rgba(0,0,0,.1);background:#fff;
  padding:.375rem .75rem;font-size:.875rem;font-weight:500;
  color:#2e112e;box-shadow:0 1px 2px rgba(0,0,0,.05);flex-shrink:0
}
.back-btn:active{transform:scale(.98)}

.grid-outer{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.grid-inner{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,minmax(0,1fr));gap:.75rem;flex:1;min-height:0;width:100%;margin:0 auto}
.grid-inner>*{min-height:0}
.grid-inner.swiping{transition:transform .3s cubic-bezier(.4,0,.2,1)}.grid-inner.swipe-in{transition:none}

.card{display:flex;flex-direction:column;height:100%;overflow:hidden;border-radius:.75rem;border:1px solid rgba(0,0,0,.1);background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.card:active{transform:scale(.98)}
.card-img{position:relative;flex:1;min-height:0;background:#f8f5f7}
.card-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.card-body{padding:.6rem .75rem;text-align:center}
.card-body h2,.card-body h3,.card-body h4{font-family:var(--f);font-size:1.05rem;font-weight:600;color:#2e112e;line-height:1.2}

.page-block{display:none}.page-block.active{display:contents}

.pagination{display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:.75rem;flex-shrink:0}
.pagination button{
  border-radius:.375rem;border:1px solid rgba(0,0,0,.1);background:#fff;
  padding:.3rem .55rem;font-size:.8rem;font-weight:500;color:#2e112e;
  min-width:2rem
}
.pagination button.active{background:#2e112e;color:#fff;border-color:#2e112e}
.pagination button:disabled{opacity:.4;cursor:default}

.detail{display:flex;flex:1;min-height:0;gap:2rem;overflow-y:auto}
.detail-img{flex:0 0 50%;position:relative;border-radius:.75rem;border:1px solid rgba(0,0,0,.1);background:#fff;overflow:hidden;aspect-ratio:1;max-height:100%;align-self:flex-start}
.detail-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.detail-info{flex:1;display:flex;flex-direction:column;gap:.75rem;overflow-y:auto;padding-bottom:.5rem;min-height:0}
.detail-info h1{font-family:var(--f);font-size:1.75rem;font-weight:700;color:#fff;line-height:1.15}
.tags{display:flex;flex-wrap:wrap;gap:.4rem}
.tag{background:#fff;color:#2e112e;border-radius:9999px;padding:.2rem .65rem;font-size:.7rem;font-weight:500}
.desc{color:rgba(255,255,255,.8);font-size:.9rem;line-height:1.4}
.pricing-box{border-radius:.75rem;border:1px solid rgba(0,0,0,.1);background:#fff;padding:1rem 1.25rem;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.pricing-box h2{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#2e112e;margin-bottom:.75rem}
.price-summary{font-size:.8rem;font-weight:500;color:#2e112e;margin-bottom:.5rem}
.price-row{display:flex;justify-content:space-between;align-items:center;padding:.65rem .75rem;border-radius:.4rem;border:1px solid rgba(0,0,0,.08);background:rgba(46,17,46,.02);margin-bottom:.5rem}
.price-row:last-child{margin-bottom:0}
.price-row .label{font-size:.85rem;font-weight:500;color:#2e112e}
.price-row .value{font-size:.85rem;font-weight:600;color:#2e112e}
.meta-info{font-size:.8rem;color:rgba(255,255,255,.75);line-height:1.6}
.order-cta{border-radius:.75rem;border:1px solid rgba(0,0,0,.1);background:#fff;padding:1rem 1.25rem;text-align:center;font-weight:600;color:#2e112e;font-size:.9rem;margin-top:auto;flex-shrink:0}

@media screen and (orientation:portrait){
  body::before{
    content:"Rotiti dispozitivul in mod peisaj";
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:#111;color:#fff;display:flex;align-items:center;
    justify-content:center;font-size:1.3rem;text-align:center;
    z-index:9999;padding:1rem
  }
  body>*:not(style){display:none!important}
}
`;

// ── embedded JS (~4KB, client-side pagination + swipe + idle) ──

const SWIPE_JS = `
(function(){
  // Back button: use history.back() with fallback to data-return
  document.addEventListener('click',function(e){
    var btn=e.target.closest('.back-btn');
    if(!btn)return;
    e.preventDefault();
    if(window.history.length>1){
      window.history.back();
    }else{
      location.href=btn.getAttribute('data-return')||'/';
    }
  });

  var grid=document.querySelector('.grid-inner');
  if(!grid)return;

  var touchX=null,touchY=null,offset=0;
  var width=window.innerWidth;
  window.addEventListener('resize',function(){width=window.innerWidth});

  document.addEventListener('touchstart',function(e){
    touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;
    offset=0;grid.style.transform='';grid.classList.remove('swiping');
  },{passive:true});

  document.addEventListener('touchmove',function(e){
    if(touchX===null)return;
    var dx=e.touches[0].clientX-touchX,dy=e.touches[0].clientY-touchY;
    if(Math.abs(dx)>Math.abs(dy)){
      offset=dx*.6;grid.style.transform='translateX('+offset+'px)';
    }
  },{passive:true});

  document.addEventListener('touchend',function(e){
    if(touchX===null)return;
    var dx=(e.changedTouches[0].clientX||touchX)-touchX,dy=(e.changedTouches[0].clientY||touchY)-touchY;
    touchX=touchY=null;

    if(Math.abs(dx)>Math.abs(dy)){
      grid.classList.add('swiping');
      if(dx>50){grid.style.transform='translateX('+(width*.3)+'px)';setTimeout(function(){goPage(-1)},250)}
      else if(dx<-50){grid.style.transform='translateX('+(-width*.3)+'px)';setTimeout(function(){goPage(1)},250)}
      else{grid.style.transform='translateX(0)'}
      setTimeout(function(){grid.classList.remove('swiping');grid.style.transform='';grid.classList.add('swipe-in');setTimeout(function(){grid.classList.remove('swipe-in')},50)},300);
    }
  },{passive:true});

  window.addEventListener('load',function(){
    var p=getPage();
    showPage(p);
    updatePagination(p);
  });

  window.addEventListener('popstate',function(){
    var p=getPage();
    showPage(p);
    updatePagination(p);
  });
})();

function goPage(dir){
  var cur=getPage(),total=getTotalPages();
  var next=cur+dir;
  if(next<1||next>total)return;
  showPage(next);
  updatePagination(next);
  if(window.history.pushState){
    var url=next===1?location.pathname:location.pathname+'?page='+next;
    window.history.pushState({page:next},'',url);
  }
}

function getPage(){
  var m=location.search.match(/page=(\\d+)/);
  return m?parseInt(m[1]):1;
}

function getTotalPages(){
  var el=document.querySelector('[data-total-pages]');
  return el?parseInt(el.getAttribute('data-total-pages')):1;
}

function showPage(n){
  var blocks=document.querySelectorAll('.page-block');
  for(var i=0;i<blocks.length;i++){
    blocks[i].classList.toggle('active',parseInt(blocks[i].getAttribute('data-page'))===n);
  }
}

function updatePagination(n){
  var btns=document.querySelectorAll('.pagination button[data-page]');
  for(var i=0;i<btns.length;i++){
    btns[i].classList.toggle('active',parseInt(btns[i].getAttribute('data-page'))===n);
  }
  var prev=document.querySelector('.pagination .prev-btn');
  var next=document.querySelector('.pagination .next-btn');
  if(prev)prev.disabled=n<=1;
  if(next)next.disabled=n>=getTotalPages();
}

// Idle redirect to home after 90 seconds
(function(){
  var t;
  function reset(){
    clearTimeout(t);
    t=setTimeout(function(){location.href='/'},90000);
  }
  ['mousemove','mousedown','keypress','touchstart','scroll'].forEach(function(e){
    document.addEventListener(e,reset,{passive:true});
  });
  reset();
})();
`;

const DETAIL_JS = `
// Back button: use history.back() with fallback
document.addEventListener('click',function(e){
  var btn=e.target.closest('.back-btn');
  if(!btn)return;
  e.preventDefault();
  if(window.history.length>1){
    window.history.back();
  }else{
    location.href=btn.getAttribute('data-return')||'/';
  }
});

// Idle redirect to home after 90 seconds
(function(){
  var t;
  function reset(){
    clearTimeout(t);
    t=setTimeout(function(){location.href='/'},90000);
  }
  ['mousemove','mousedown','keypress','touchstart','scroll'].forEach(function(e){
    document.addEventListener(e,reset,{passive:true});
  });
  reset();
})();
`;

// ── page shell ──

function shell({ title, body, js = SWIPE_JS, headExtras = "" }) {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="Logotip Kiosk - catalog produse personalizate">
<meta name="theme-color" content="#360D36">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Logotip">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/favicon.ico">
<link rel="preload" href="/fonts/FuturaPT-Book.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:'FuturaPT';src:url('/fonts/FuturaPT-Book.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'FuturaPT';src:url('/fonts/FuturaPT-Demi.woff2') format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'FuturaPT';src:url('/fonts/FuturaPT-Bold.woff2') format('woff2');font-weight:700;font-display:swap}
:root{--f:'FuturaPT'}
${CSS}
</style>
${headExtras}
</head>
<body>
${body}
<script>
if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js',{scope:'/'})}
${js}
</script>
</body>
</html>`;
}

// ── components ──

function pageHeader({ title, breadcrumbs = [], showLogo = true, returnHref }) {
  const bcHtml = breadcrumbs
    .map((b, i) => {
      const isLast = i === breadcrumbs.length - 1;
      if (b.href && !isLast)
        return `<a href="${b.href}">${esc(b.label)}</a>&nbsp;<span>/</span>`;
      return `<span>${esc(b.label)}</span>`;
    })
    .join("");

  const backBtn = returnHref
    ? `<a href="${returnHref}" class="back-btn" aria-label="Inapoi" data-return="${returnHref}">&larr;&nbsp;Inapoi</a>`
    : "";

  return `<div class="page-header">
    ${backBtn}
    <div style="min-width:0">
      <h1>${esc(title)}</h1>
      ${bcHtml ? `<div class="breadcrumb">${bcHtml}</div>` : ""}
    </div>
    ${showLogo ? `<img src="/logo.svg" alt="Logotip" class="logo" width="140" height="40">` : ""}
  </div>`;
}

function pagination(totalPages) {
  if (totalPages <= 1) return "";

  let pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, 4, 5);
  }

  const btns = pages
    .map(
      (p) =>
        `<button data-page="${p}" onclick="showPage(${p});updatePagination(${p})"${p === 1 ? ' class="active"' : ""}>${p}</button>`,
    )
    .join("");

  return `<div class="pagination">
    <button class="prev-btn" onclick="goPage(-1)" disabled>&larr;&nbsp;Anterior</button>
    ${btns}
    <button class="next-btn" onclick="goPage(1)"${totalPages <= 1 ? " disabled" : ""}>Urm&abreve;tor&nbsp;&rarr;</button>
  </div>`;
}

function makePageBlocks(items, itemsPerPage, renderFn) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  let html = "";
  for (let p = 1; p <= totalPages; p++) {
    const start = (p - 1) * itemsPerPage;
    const pageItems = items.slice(start, start + itemsPerPage);
    html += `<div class="page-block${p === 1 ? " active" : ""}" data-page="${p}">`;
    html += pageItems.map(renderFn).join("");
    html += `</div>`;
  }
  return { html, totalPages };
}

function categoryCard(cat, imageUrl) {
  return `<a href="/${esc(cat.slug)}" class="card">
    <div class="card-img">
      ${imageUrl ? `<img src="${imageUrl}" alt="${esc(cat.name)}" loading="lazy">` : ""}
    </div>
    <div class="card-body"><h3>${esc(cat.name)}</h3></div>
  </a>`;
}

function designCard(d) {
  return `<a href="/design/${esc(d.id)}/" class="card">
    <div class="card-img">
      <img src="${d.image}" alt="${esc(d.name)}" loading="lazy">
    </div>
    <div class="card-body"><h4>${esc(d.name)}</h4></div>
  </a>`;
}

// ── page generators ──

function homePage() {
  // Pre-compute first image per category for display
  const catImages = {};
  for (const cat of categories) {
    const d = designs.find((d) => d.categoryId === cat.id);
    if (d) catImages[cat.id] = d.image;
  }

  const catsForRendering = categories.map((cat) => ({
    ...cat,
    _image: catImages[cat.id],
  }));

  const { html: blocksHtml, totalPages } = makePageBlocks(
    catsForRendering,
    ITEMS_PER_PAGE,
    (cat) => categoryCard(cat, cat._image),
  );

  const body = `<main class="page">
    ${pageHeader({ title: "Categorii de produse", breadcrumbs: [] })}
    <div class="grid-outer" data-total-pages="${totalPages}">
      <div class="grid-inner">${blocksHtml}</div>
      ${pagination(totalPages)}
    </div>
  </main>`;

  return shell({ title: "Logotip Kiosk", body });
}

function categoryPage(cat) {
  const hasSubs = Boolean(cat.subcategories?.length);

  let items, renderFn, pageHeaderOpts;

  if (hasSubs) {
    const subsWithImages = cat.subcategories.map((sc) => {
      const d = designs.find(
        (d) => d.categoryId === cat.id && d.subcategoryId === sc.id,
      );
      return {
        id: sc.id,
        name: sc.name,
        slug: `${cat.slug}/${sc.slug}`,
        _image: d?.image,
      };
    });
    items = subsWithImages;
    renderFn = (s) => categoryCard(s, s._image);
    pageHeaderOpts = {
      title: cat.name,
      breadcrumbs: [
        { label: "Acas\u0103", href: "/" },
        { label: cat.name },
      ],
      showLogo: false,
      returnHref: "/",
    };
  } else {
    const catDesigns = designs.filter((d) => d.categoryId === cat.id);
    items = catDesigns;
    renderFn = (d) => designCard(d);
    pageHeaderOpts = {
      title: cat.name,
      breadcrumbs: [
        { label: "Acas\u0103", href: "/" },
        { label: cat.name },
      ],
      showLogo: false,
      returnHref: "/",
    };
  }

  const { html: blocksHtml, totalPages } = makePageBlocks(
    items,
    ITEMS_PER_PAGE,
    renderFn,
  );

  const body = `<main class="page">
    ${pageHeader(pageHeaderOpts)}
    <div class="grid-outer" data-total-pages="${totalPages}">
      <div class="grid-inner">${blocksHtml}</div>
      ${pagination(totalPages)}
    </div>
  </main>`;

  return shell({ title: `${cat.name} - Logotip`, body });
}

function subcategoryPage(cat, subcat) {
  const subDesigns = designs.filter(
    (d) => d.categoryId === cat.id && d.subcategoryId === subcat.id,
  );

  const { html: blocksHtml, totalPages } = makePageBlocks(
    subDesigns,
    ITEMS_PER_PAGE,
    (d) => designCard(d),
  );

  const body = `<main class="page">
    ${pageHeader({
      title: subcat.name,
      breadcrumbs: [
        { label: "Acas\u0103", href: "/" },
        { label: cat.name, href: `/${cat.slug}` },
        { label: subcat.name },
      ],
      showLogo: false,
      returnHref: `/${cat.slug}`,
    })}
    <div class="grid-outer" data-total-pages="${totalPages}">
      <div class="grid-inner">${blocksHtml}</div>
      ${pagination(totalPages)}
    </div>
  </main>`;

  return shell({ title: `${subcat.name} - ${cat.name} - Logotip`, body });
}

function designPage(d) {
  const cat = categories.find((c) => c.id === d.categoryId);
  const subcat = cat?.subcategories?.find(
    (s) => s.id === d.subcategoryId,
  );

  const returnHref = subcat
    ? `/${cat.slug}/${subcat.slug}`
    : cat
      ? `/${cat.slug}`
      : "/";

  const pricingEntries = Object.entries(d.pricing);
  const hasTags = Boolean(d.tags?.length);
  const priceRange = d.priceRange;
  const hasMeta = d.materials?.length || d.sizes?.length || d.turnaroundTime;

  const bc = [{ label: "Acas\u0103", href: "/" }];
  if (cat) bc.push({ label: cat.name, href: `/${cat.slug}` });
  if (subcat) bc.push({ label: subcat.name, href: `/${cat.slug}/${subcat.slug}` });
  bc.push({ label: d.name });

  const body = `<main class="page">
    ${pageHeader({ title: "", breadcrumbs: bc.slice(0, -1), showLogo: false, returnHref })}
    <div class="detail">
      <div class="detail-img">
        <img src="${d.image}" alt="${esc(d.name)}" loading="eager">
      </div>
      <div class="detail-info">
        <h1>${esc(d.name)}</h1>
        ${hasTags ? `<div class="tags">${d.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
        ${d.description ? `<p class="desc">${esc(d.description)}</p>` : ""}
        <div class="pricing-box">
          <h2>Pre\u021buri</h2>
          ${priceRange ? `<p class="price-summary">${priceRange.min === priceRange.max ? `Fix ${formatRon(priceRange.min)}` : `De la ${formatRon(priceRange.min)} p\xE2n\u0103 la ${formatRon(priceRange.max)}`}</p>` : ""}
          ${pricingEntries
            .map(
              ([type, price]) =>
                `<div class="price-row"><span class="label">${esc(type)}</span><span class="value">${formatRon(price)}</span></div>`,
            )
            .join("")}
        </div>
        ${hasMeta ? `<div class="meta-info">
          ${d.materials?.length ? `<p>Materiale: ${esc(d.materials.join(", "))}</p>` : ""}
          ${d.sizes?.length ? `<p>M\u0103rimi: ${esc(d.sizes.join(", "))}</p>` : ""}
          ${d.turnaroundTime ? `<p>Timp execu\u021Bie: ${esc(d.turnaroundTime)}</p>` : ""}
        </div>` : ""}
        <div class="order-cta">
          Pentru a comanda, discutati cu un operator.
        </div>
      </div>
    </div>
  </main>`;

  return shell({ title: `${d.name} - ${cat?.name ?? "Design"} - Logotip`, body, js: DETAIL_JS });
}

// ── generate ──

await fs.rm(OUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUT_DIR, { recursive: true });

// index.html
await fs.writeFile(path.join(OUT_DIR, "index.html"), homePage());

// Category pages
for (const cat of categories) {
  const dir = path.join(OUT_DIR, cat.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), categoryPage(cat));

  for (const subcat of cat.subcategories ?? []) {
    const subDir = path.join(dir, subcat.slug);
    await fs.mkdir(subDir, { recursive: true });
    await fs.writeFile(
      path.join(subDir, "index.html"),
      subcategoryPage(cat, subcat),
    );
  }
}

// Design detail pages
const designRoot = path.join(OUT_DIR, "design");
await fs.mkdir(designRoot, { recursive: true });
for (const d of designs) {
  const dDir = path.join(designRoot, d.id);
  await fs.mkdir(dDir, { recursive: true });
  await fs.writeFile(path.join(dDir, "index.html"), designPage(d));
}

// 404 page for Netlify
await fs.writeFile(
  path.join(OUT_DIR, "404.html"),
  shell({
    title: "404 - Logotip",
    body: `<main class="page">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;text-align:center">
        <h1 style="font-family:var(--f);font-size:3rem;font-weight:700;color:#fff">404</h1>
        <p style="color:rgba(255,255,255,.7);font-size:1.2rem">Pagina nu a fost g\u0103sit\u0103</p>
        <a href="/" class="back-btn" style="font-size:1rem;padding:.5rem 1.5rem">&larr; \xCEnapoi acas\u0103</a>
      </div>
    </main>`,
    js: DETAIL_JS,
  }),
);

// ── generate Netlify _redirects ──

// Netlify serves directory index.html for paths with trailing slash,
// but paths without trailing slash need redirects.
const redirects = [];
redirects.push("# Netlify redirects for Logotip Kiosk");
redirects.push("# Clean URLs: redirect paths without trailing slash to directory index");
redirects.push("");

// Category redirects
for (const cat of categories) {
  redirects.push(`/${cat.slug}  /${cat.slug}/  301`);
  for (const subcat of cat.subcategories ?? []) {
    redirects.push(
      `/${cat.slug}/${subcat.slug}  /${cat.slug}/${subcat.slug}/  301`,
    );
  }
}
// Design redirects (list first few, plus a catch-all for the pattern)
redirects.push("");
redirects.push("# Design detail pages");
redirects.push("/design/*  /design/:splat/  301");

await fs.writeFile(
  path.join(OUT_DIR, "_redirects"),
  redirects.join("\n") + "\n",
);

// ── copy public assets ──

const assetDirs = ["assets", "fonts"];
for (const d of assetDirs) {
  const src = path.join(PUBLIC_DIR, d);
  try {
    await fs.cp(src, path.join(OUT_DIR, d), { recursive: true });
  } catch { /* skip */ }
}

const pubFiles = [
  "manifest.json", "logo.svg", "logotip-bg.svg", "favicon.ico",
  "icon-192.png", "icon-512.png",
  "web-app-manifest-192x192.png", "web-app-manifest-512x512.png",
  "sw.js",
];
for (const f of pubFiles) {
  try {
    await fs.copyFile(path.join(PUBLIC_DIR, f), path.join(OUT_DIR, f));
  } catch { /* skip */ }
}

const catCount = categories.length;
const subcatCount = categories.reduce((n, c) => n + (c.subcategories?.length ?? 0), 0);
const desCount = designs.length;
const pageFiles = 1 + catCount + subcatCount + desCount + 1; // +1 for 404
console.log(`✅ Static site: ${OUT_DIR}/`);
console.log(`   ${pageFiles} HTML pages`);
console.log(`   ${catCount} categories, ${subcatCount} subcategories, ${desCount} designs`);
console.log(`   Zero framework JS — loads instantly`);
console.log(`   Serve with: npx serve dist-static`);
