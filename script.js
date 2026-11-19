/* ===== Site settings: change the enquiry address here before launch ===== */
const ENQUIRY_EMAIL = "support@dnmliving.com";
const ENQUIRY_PHONE = "+971 50 893 9892";

(function(){
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /*MARBLE-START*/
  /* ---- Procedural white & gold marble, rendered off the main thread ---- */
  const workerSrc = `
  self.onmessage = function(e){
    const W=e.data.w, H=e.data.h, S=e.data.s, seed=e.data.seed;
    let st=seed>>>0; const rnd=()=>{st=(st*1664525+1013904223)>>>0;return st/4294967296};
    const perm=new Uint8Array(256); for(let i=0;i<256;i++)perm[i]=i;
    for(let i=255;i>0;i--){const j=(rnd()*(i+1))|0;const t=perm[i];perm[i]=perm[j];perm[j]=t}
    const p=new Uint8Array(512); for(let i=0;i<512;i++)p[i]=perm[i&255];
    const gx=new Float32Array(256), gy=new Float32Array(256);
    for(let i=0;i<256;i++){const a=rnd()*Math.PI*2;gx[i]=Math.cos(a);gy[i]=Math.sin(a)}
    function noise(x,y){
      let X=Math.floor(x),Y=Math.floor(y); x-=X;y-=Y; X&=255;Y&=255;
      const u=x*x*x*(x*(x*6-15)+10), v=y*y*y*(y*(y*6-15)+10);
      const a=p[X+p[Y]], b=p[X+1+p[Y]], c=p[X+p[Y+1]], d=p[X+1+p[Y+1]];
      const n00=gx[a]*x+gy[a]*y, n10=gx[b]*(x-1)+gy[b]*y, n01=gx[c]*x+gy[c]*(y-1), n11=gx[d]*(x-1)+gy[d]*(y-1);
      const i1=n00+(n10-n00)*u, i2=n01+(n11-n01)*u; return (i1+(i2-i1)*v)*1.4;
    }
    function fbm(x,y,o){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=noise(x*f,y*f)*a;f*=2.03;a*=.5}return s}
    const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
    const out=new Uint8ClampedArray(W*H*4);
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const u=x/S, v=y/S;
        const cloud=fbm(u*.8+20,v*.8,4);
        let r=253-(cloud+1)*4.5, g=251-(cloud+1)*5.5, b=248-(cloud+1)*7.5;
        const t2=-u*.45+v*1.0+fbm(u*1.6+5,v*1.6+9,4)*1.3;
        const s2=Math.abs(Math.sin(t2*Math.PI*1.7));
        const f2=ss(-.2,.35,fbm(u*.9+3,v*.9+17,3));
        const grey=(Math.pow(1-s2,26)*.55+Math.pow(1-s2,6)*.08)*f2;
        r+=(214-r)*grey*.45; g+=(208-g)*grey*.45; b+=(202-b)*grey*.45;
        const t=u*.8+v*.38+fbm(u*.9,v*.9,5)*1.7;
        const s=Math.abs(Math.sin(t*Math.PI*.75));
        const f=ss(-.15,.3,fbm(u*.6+11,v*.6+4,3));
        const t3=u*.3+v*1.2+fbm(u*2.2+40,v*2.2+2,4)*1.0;
        const s3=Math.abs(Math.sin(t3*Math.PI*1.8));
        const f3=ss(.2,.5,fbm(u*1.0+30,v*1.0+30,2));
        let gold=Math.pow(1-s,40)*.95*f + Math.pow(1-s,8)*.14*f + Math.pow(1-s3,90)*.45*f3;
        gold=Math.min(1,gold)*.8;
        const k=noise(u*3.5+7,v*3.5+1)*.5+.5;
        const gr=190+(236-190)*k, gg=148+(212-148)*k, gb=100+(168-100)*k;
        r+=(gr-r)*gold; g+=(gg-g)*gold; b+=(gb-b)*gold;
        const i=(y*W+x)*4; out[i]=r; out[i+1]=g; out[i+2]=b; out[i+3]=255;
      }
    }
    self.postMessage({w:W,h:H,buf:out.buffer},[out.buffer]);
  };`;

  const canvas = document.getElementById("marble");
  let lastW = 0;
  function paintMarble(){
    const vw = window.innerWidth, vh = window.innerHeight;
    if (lastW && Math.abs(vw - lastW) / lastW < .25) return;
    lastW = vw;
    const w = Math.round(Math.min(1500, Math.max(640, vw * .9)));
    const h = Math.round(w * Math.max(vh, 500) / vw);
    const draw = (data) => {
      canvas.width = data.w; canvas.height = data.h;
      canvas.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(data.buf), data.w, data.h), 0, 0);
      canvas.classList.add("ready");
    };
    try {
      const url = URL.createObjectURL(new Blob([workerSrc], {type:"text/javascript"}));
      const worker = new Worker(url);
      worker.onmessage = (e) => { draw(e.data); worker.terminate(); URL.revokeObjectURL(url); };
      worker.postMessage({w, h, s: w / 2.3, seed: 20261027});
    } catch (err) { /* the soft gradient ground stays in place */ }
  }
  paintMarble();
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(paintMarble, 400); });
  /*MARBLE-END*/

  /* ---- Metallic shimmer on the monogram ---- */
  if (!reduce) { try { document.getElementById("foilAnim").beginElement(); } catch (e) {} }

  /* ---- Header state & mobile menu ---- */
  const header = document.getElementById("header");
  const progress = document.getElementById("progress");
  const marble = document.querySelector(".marble");
  let ticking = false;
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, window.scrollY / max);
      if (progress) progress.style.setProperty("--p", ratio.toFixed(4));
      if (!reduce) marble.style.setProperty("--py", (-(ratio - .5) * window.innerHeight * .07).toFixed(1) + "px");
      ticking = false;
    });
  };
  onScroll(); window.addEventListener("scroll", onScroll, {passive:true});

  /* ---- Plaque tilt & spotlight follow the cursor ---- */
  const plaque = document.getElementById("plaque");
  if (plaque && !reduce && window.matchMedia("(hover: hover)").matches) {
    plaque.addEventListener("pointermove", e => {
      const r = plaque.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      plaque.style.setProperty("--rx", ((.5 - y) * 6).toFixed(2) + "deg");
      plaque.style.setProperty("--ry", ((x - .5) * 8).toFixed(2) + "deg");
      plaque.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      plaque.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    });
    plaque.addEventListener("pointerleave", () => {
      ["--rx","--ry","--mx","--my"].forEach(p => plaque.style.removeProperty(p));
    });
  }

  const menuBtn = document.getElementById("menuBtn");
  const setMenu = (open) => {
    if (!menuBtn) return;
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  if (menuBtn) menuBtn.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ---- Active section in nav ---- */
  const navLinks = [...document.querySelectorAll("#nav a[href^='#']")];
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
      });
    }, {rootMargin:"-45% 0px -50% 0px"});
    ["story","invest","home","approach","leadership","insights","contact"].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---- Gentle reveal (content is readable before it runs) ---- */
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("motion");
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, {rootMargin:"0px 0px -6% 0px"});
    document.querySelectorAll(".rv, .draw").forEach(el => io.observe(el));
  }

  /* ---- Table of contents on the legal pages ---- */
  const toc = document.getElementById("toc");
  if (toc) {
    document.querySelectorAll("#legal h2[id]").forEach(h => {
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
      toc.appendChild(a);
    });
  }

  /* ---- Contact (home page only) ---- */
  if (!document.getElementById("enquiry")) return;
  document.getElementById("emailText").textContent = ENQUIRY_EMAIL;
  document.getElementById("sentEmail").textContent = ENQUIRY_EMAIL;
  document.getElementById("footEmail").textContent = ENQUIRY_EMAIL;
  document.getElementById("phoneText").textContent = ENQUIRY_PHONE;
  document.getElementById("footPhone").textContent = ENQUIRY_PHONE;
  document.getElementById("phoneLink").href = "tel:" + ENQUIRY_PHONE.replace(/\s/g, "");
  document.getElementById("year").textContent = new Date().getFullYear();

  function copyText(text, btn){
    const done = () => { const old = btn.textContent; btn.textContent = "Copied"; setTimeout(() => btn.textContent = old, 1800); };
    const fallback = () => {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  document.getElementById("copyEmail").addEventListener("click", e => copyText(ENQUIRY_EMAIL, e.currentTarget));
  document.getElementById("copyPhone").addEventListener("click", e => copyText(ENQUIRY_PHONE, e.currentTarget));

  const form = document.getElementById("enquiry");
  const sent = document.getElementById("sent");
  const errorEl = document.getElementById("formError");
  let lastBody = "";

  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const missing = [];
    if (!String(d.get("name")||"").trim()) missing.push("your name");
    if (!String(d.get("country")||"").trim()) missing.push("your country of residence");
    const email = String(d.get("email")||"").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("a valid email address");
    if (!d.get("purpose")) missing.push("a purpose");
    if (!d.get("consent")) missing.push("your agreement to be contacted");
    if (missing.length) { errorEl.textContent = "Please add " + missing.join(", ") + "."; return; }
    errorEl.textContent = "";

    const v = k => String(d.get(k)||"").trim() || "Not specified";
    lastBody = [
      "Private Consultation Enquiry",
      "",
      "Name: " + v("name"),
      "Country of residence: " + v("country"),
      "Email: " + v("email"),
      "Phone: " + v("phone"),
      "Purpose: " + v("purpose"),
      "Indicative budget: " + v("budget"),
      "Property type: " + v("type"),
      "Timeline: " + v("timeline"),
      "",
      "Message:",
      v("message")
    ].join("\n");
    const subject = "Private Consultation Enquiry: " + v("name");
    document.getElementById("mailLink").href = "mailto:" + ENQUIRY_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lastBody);
    document.getElementById("sentBody").textContent = lastBody;
    form.hidden = true; sent.hidden = false;
    sent.scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "center"});
  });
  document.getElementById("copyBody").addEventListener("click", e => copyText(lastBody, e.currentTarget));
  document.getElementById("editForm").addEventListener("click", () => { sent.hidden = true; form.hidden = false; });
})();
