document.documentElement.classList.add("js");

// Sidebar active link highlight
const navLinks = Array.from(document.querySelectorAll("#nav a"));
const targets = navLinks.map(a => document.querySelector(a.getAttribute("href")));
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      navLinks.forEach(a => a.classList.remove("active"));
      const href = `#${entry.target.id}`;
      const active = navLinks.find(a => a.getAttribute("href") === href);
      if(active) active.classList.add("active");
    }
  });
}, { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 });
targets.forEach(t => t && io.observe(t));

// Search across "data-searchable" containers
const searchInput = document.getElementById("searchInput");
function runSearch(q){
  const query = (q || "").trim().toLowerCase();
  const items = Array.from(document.querySelectorAll("[data-searchable] .cardX, [data-searchable] .certTile, [data-searchable] .certCard"));
  items.forEach(it => {
    const text = it.innerText.toLowerCase();
    it.style.display = (!query || text.includes(query)) ? "" : "none";
  });
}
if(searchInput){
  searchInput.addEventListener("input", e => runSearch(e.target.value));
}
document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const mod = isMac ? e.metaKey : e.ctrlKey;
  if(mod && e.key.toLowerCase() === "k"){ e.preventDefault(); searchInput && searchInput.focus(); }
  if(e.key === "Escape"){ searchInput && searchInput.blur(); }
});

// Reveal sections on scroll (Tipsy-style)
const sections = Array.from(document.querySelectorAll(".section"));
const revealIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add("inview"); }
  });
},{ threshold: 0.08 });
sections.forEach(s=>revealIO.observe(s));

// Theme toggle (persists)
const themeBtn = document.getElementById("themeToggle");
function applyTheme(t){
  if(t === "light"){ document.documentElement.setAttribute("data-theme","light"); }
  else { document.documentElement.removeAttribute("data-theme"); }
  if(themeBtn){
    const isLight = document.documentElement.getAttribute("data-theme")==="light";
    themeBtn.textContent = isLight ? "Dark Theme" : "Light Theme";
    themeBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  }
}
const savedTheme = localStorage.getItem("theme");
if(savedTheme){
  applyTheme(savedTheme);
}else{
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}
if(themeBtn){
  themeBtn.addEventListener("click", ()=>{
    const next = (document.documentElement.getAttribute("data-theme")==="light") ? "dark" : "light";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

// Certifications: badge grid -> modal (Hybrid)
const certOverlay = document.getElementById("certModalOverlay");
const certClose = document.getElementById("certModalClose");
const certTitle = document.getElementById("certModalTitle");
const certSub = document.getElementById("certModalSub");
const certImg = document.getElementById("certModalImg");
const certVerify = document.getElementById("certModalVerify");
const certPdf = document.getElementById("certModalPdf");
const certFallback = document.getElementById("certModalFallback");

let lastFocusEl = null;
function openCertModal(tile){
  if(!tile || !certOverlay) return;
  lastFocusEl = document.activeElement;

  const title = tile.dataset.title || "Certificate";
  const subtitle = tile.dataset.subtitle || "";
  const full = tile.dataset.full || "";
  const verify = tile.dataset.verify || "";

  certTitle.textContent = title;
  certSub.textContent = subtitle;

  // full image vs pdf-only fallback
  if(full){
    certImg.src = full;
    certImg.style.display = "block";
    certFallback.style.display = "none";
  }else{
    certImg.removeAttribute("src");
    certImg.style.display = "none";
    certFallback.style.display = "block";
  }

  if(verify){
    certVerify.href = verify;
    certVerify.style.display = "inline-flex";
  }else{
    certVerify.href = "#";
    certVerify.style.display = "none";
  }

  const pdf = tile.dataset.pdf;
  if(pdf){
    certPdf.href = pdf;
    certPdf.style.display = "inline-flex";
  }else{
    certPdf.href = "#";
    certPdf.style.display = "none";
  }

  certOverlay.style.display = "flex";
  certOverlay.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";

  // focus close for keyboard
  setTimeout(()=>{ certClose && certClose.focus(); }, 0);
}
function closeCertModal(){
  if(!certOverlay) return;
  certOverlay.style.display = "none";
  certOverlay.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  if(lastFocusEl && lastFocusEl.focus) lastFocusEl.focus();
}
document.querySelectorAll(".certTile").forEach(tile=>{
  tile.addEventListener("click", ()=>openCertModal(tile));
  tile.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openCertModal(tile); }
  });
});
if(certClose) certClose.addEventListener("click", closeCertModal);
if(certOverlay){
  certOverlay.addEventListener("click", (e)=>{ if(e.target === certOverlay) closeCertModal(); });
}
document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape"){
    if(certOverlay && certOverlay.style.display === "flex"){ closeCertModal(); }
  }
});


// Year
document.getElementById("year").textContent = new Date().getFullYear();
