/* ============================================
   NEXUS — script.js (Apple-Style Integrated)
============================================ */

(function () {
    'use strict';

    /* ─────────────────────────────────────────
       ★ CONFIGURATION ★
    ───────────────────────────────────────── */
    const CONFIG = {
        folder:      'frames',
        prefix:      'ezgif-frame-', // Fixed: Matches your naming
        extension:   'JPG',
        startFrame:  1,
        totalFrames: 151,
        padLength:   3,
    };

    // State Variables
    let targetScrollY = 0;
    let currentScrollY = 0;
    const scrollSmoothing = 0.1; // Lower = smoother (Apple feel)

    const images = new Array(CONFIG.totalFrames).fill(null);
    let loadedCount = 0;
    let errorCount = 0;
    let currentIdx = -1;
    let rafPending = false;
    let framesReady = false;
    let usingFallback = false;

    /* ─────────────────────────────────────────
       BUILD FRAME SRC
    ───────────────────────────────────────── */
    function frameSrc(frameNumber) {
        const n = String(frameNumber).padStart(CONFIG.padLength, '0');
        return `${CONFIG.folder}/${CONFIG.prefix}${n}.${CONFIG.extension}`;
    }

    /* ─────────────────────────────────────────
       DOM REFS
    ───────────────────────────────────────── */
    const canvas      = document.getElementById('hero-canvas');
    const ctx         = canvas.getContext('2d');
    const scrollHint  = document.getElementById('scrollHint');
    const progressBar = document.getElementById('progressBar');

    /* ─────────────────────────────────────────
       PRELOADER UI
    ───────────────────────────────────────── */
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'nexus-loader';
    loadingOverlay.style.cssText = `
        position:fixed; inset:0; z-index:9999; background:#080808;
        display:flex; align-items:center; justify-content:center;
        transition:opacity 0.6s ease;
    `;
    loadingOverlay.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size:22px;font-weight:600;letter-spacing:4px;color:#fff;margin-bottom:28px;">NEXUS</div>
            <div style="width:220px;height:2px;background:rgba(255,255,255,0.1);overflow:hidden;margin:0 auto 14px;">
                <div id="loaderBar" style="height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#ec4899);transition:width 0.1s;"></div>
            </div>
            <div id="loaderText" style="font-size:12px;color:rgba(255,255,255,0.4);">Loading frames... 0%</div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    /* ─────────────────────────────────────────
       CANVAS & DRAWING
    ───────────────────────────────────────── */
    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        if (currentIdx >= 0) drawFrame(currentIdx);
    }

    function drawFrame(index) {
        const img = images[index];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const cw = canvas.width, ch = canvas.height;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        
        // CSS background-size: cover logic
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale, dh = ih * scale;
        const dx = (cw - dw) / 2, dy = (ch - dh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    /* ─────────────────────────────────────────
       APPLE-STYLE SCROLL ENGINE (LERP)
    ───────────────────────────────────────── */
    function onScroll() {
        targetScrollY = window.scrollY || window.pageYOffset;
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(renderLoop);
        }
    }

    function renderLoop() {
        // Linear Interpolation
        const diff = targetScrollY - currentScrollY;
        currentScrollY += diff * scrollSmoothing;

        // Map scroll to frame index
        const heroHeight = window.innerHeight * 5;
        const heroFrac = Math.min(currentScrollY / heroHeight, 1);
        const idx = Math.min(CONFIG.totalFrames - 1, Math.max(0, Math.round(heroFrac * (CONFIG.totalFrames - 1))));

        if (framesReady && !usingFallback) {
            if (idx !== currentIdx) {
                currentIdx = idx;
                drawFrame(currentIdx);
            }
        }

        updateUI(currentScrollY);

        // Keep loop running if still moving
        if (Math.abs(diff) > 0.1) {
            requestAnimationFrame(renderLoop);
        } else {
            rafPending = false;
        }
    }

    function updateUI(smoothedY) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (progressBar) progressBar.style.width = (docH > 0 ? (smoothedY / docH * 100) : 0) + '%';
        if (scrollHint) scrollHint.classList.toggle('hidden', smoothedY > 80);
    }

    /* ─────────────────────────────────────────
       PRELOADING LOGIC
    ───────────────────────────────────────── */
    function updateLoader() {
        const done = loadedCount + errorCount;
        const pct = Math.round((done / CONFIG.totalFrames) * 100);
        document.getElementById('loaderBar').style.width = pct + '%';
        document.getElementById('loaderText').textContent = `Loading frames… ${pct}%`;

        if (done >= CONFIG.totalFrames) {
            framesReady = (loadedCount > 0);
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.remove(), 600);
            if (!framesReady) startFallbackAnimation();
        }
    }

    function preloadFrames() {
        for (let i = 0; i < CONFIG.totalFrames; i++) {
            const img = new Image();
            img.onload = () => { 
                loadedCount++; 
                if (i === 0) { // Draw first frame immediately
                    framesReady = true;
                    resizeCanvas();
                    drawFrame(0);
                }
                updateLoader(); 
            };
            img.onerror = () => { errorCount++; updateLoader(); };
            img.src = frameSrc(CONFIG.startFrame + i);
            images[i] = img;
        }
    }

    /* ─────────────────────────────────────────
       FALLBACK & UI INIT
    ───────────────────────────────────────── */
    function startFallbackAnimation() {
        usingFallback = true;
        ctx.fillStyle = "#111";
        ctx.fillRect(0,0,canvas.width, canvas.height);
        console.warn("NEXUS: No frames loaded. Check your 'frames' folder and file names.");
    }

    // 4. Initialize Desmos
    function initDesmos() {
        const elt = document.getElementById('calculator');
        if(!elt) return;
        const calc = Desmos.GraphingCalculator(elt, {keypad: false, expressions: false});
        calc.setExpression({ id: 'graph1', latex: 'y=sin(x)' });

        const input = document.getElementById('mathInput');
        if(input) {
            input.addEventListener('input', (e) => {
                calc.setExpression({ id: 'graph1', latex: e.target.value });
            });
        }
    }

    function init() {
        resizeCanvas();
        preloadFrames();
        initDesmos();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', resizeCanvas);
    }

    // Global helpers for HTML buttons
    window.scrollToSection = id => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

})();


/* ============================================
   NEXUS — Backend Integration
   Wires: POST /api/upload  → file ingest queue
          POST /api/ask     → Ollama tinyllama agent
          (style.css & HTML above untouched)
============================================ */

/* ── CONFIG ──────────────────────────────── */
// Change this to your server's address if needed
const NEXUS_API = 'http://localhost:3000';

/* ── HELPERS ─────────────────────────────── */
function _ext(filename) {
    return filename.split('.').pop().toUpperCase().slice(0, 4);
}

function _size(bytes) {
    if (bytes < 1024)        return bytes + ' B';
    if (bytes < 1048576)     return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// Badge colours keyed by extension
const _badgeColours = {
    PDF:  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
    DOC:  { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    DOCX: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    XLS:  { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    XLSX: { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
    PPT:  { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
    PPTX: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
    CSV:  { bg: 'rgba(20,184,166,0.15)', color: '#14b8a6' },
    TXT:  { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8' },
    MD:   { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8' },
    JSON: { bg: 'rgba(250,204,21,0.15)', color: '#facc15' },
    PNG:  { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    JPG:  { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    JPEG: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    GIF:  { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    WEBP: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
    ZIP:  { bg: 'rgba(255,255,255,0.08)',color: 'rgba(255,255,255,0.45)' },
};

function _badgeStyle(ext) {
    const c = _badgeColours[ext] || { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' };
    return `background:${c.bg};color:${c.color};`;
}

/* ── STATE ───────────────────────────────── */
let _files = []; // { file, status: 'pending'|'uploading'|'done'|'error', id }

/* ── FILE INPUT / DROP ───────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone  = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        _addFiles(Array.from(e.dataTransfer.files));
    });

    fileInput.addEventListener('change', () => {
        _addFiles(Array.from(fileInput.files));
        fileInput.value = ''; // reset so same file can be re-added
    });
});

function _addFiles(newFiles) {
    newFiles.forEach(f => {
        // deduplicate by name+size
        if (!_files.find(x => x.file.name === f.name && x.file.size === f.size)) {
            const entry = { file: f, status: 'pending', id: Date.now() + Math.random() };
            _files.push(entry);
            _renderFileItem(entry);
            _uploadFile(entry);
        }
    });
}

/* ── RENDER A SINGLE FILE ITEM ───────────── */
function _renderFileItem(entry) {
    const list = document.getElementById('fileList');
    const ext  = _ext(entry.file.name);
    const bs   = _badgeStyle(ext);

    const div = document.createElement('div');
    div.className = 'file-item';
    div.id = `fi-${entry.id}`;
    div.innerHTML = `
        <div class="file-badge" style="${bs}">${ext}</div>
        <div class="file-info">
            <div class="file-name">${entry.file.name}</div>
            <div class="file-meta">${_size(entry.file.size)} · <span id="fs-${entry.id}">Queued</span></div>
        </div>
        <button class="file-remove" onclick="_removeFile('${entry.id}')" title="Remove">×</button>
    `;
    list.appendChild(div);
}

function _setFileStatus(entry, text) {
    const el = document.getElementById(`fs-${entry.id}`);
    if (el) el.textContent = text;
}

function _removeFile(id) {
    _files = _files.filter(e => String(e.id) !== String(id));
    const el = document.getElementById(`fi-${id}`);
    if (el) el.remove();
}

/* ── UPLOAD FILE → POST /api/upload ─────── */
async function _uploadFile(entry) {
    entry.status = 'uploading';
    _setFileStatus(entry, 'Uploading…');

    const form = new FormData();
    form.append('document', entry.file);

    try {
        const res = await fetch(`${NEXUS_API}/api/upload`, { method: 'POST', body: form });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        entry.status = 'done';
        _setFileStatus(entry, '✓ Ingested');
    } catch (err) {
        entry.status = 'error';
        _setFileStatus(entry, '✗ Upload failed');
        console.error('NEXUS upload error:', err);
    }
}

/* ── CLEAR FILES ─────────────────────────── */
window.clearFiles = function () {
    _files = [];
    document.getElementById('fileList').innerHTML    = '';
    document.getElementById('promptInput').value    = '';
    document.getElementById('responseBox').classList.remove('visible');
    document.getElementById('responseText').innerHTML = '';
    document.getElementById('sourcesLine').textContent = '';
};

/* ── ANALYZE → POST /api/ask ─────────────── */
window.analyzeFiles = async function () {
    const question = document.getElementById('promptInput').value.trim();
    if (!question) {
        document.getElementById('promptInput').focus();
        return;
    }

    // Show processing state (uses existing CSS classes from style.css)
    const box   = document.getElementById('responseBox');
    const badge = document.getElementById('statusBadge');
    const text  = document.getElementById('responseText');
    const src   = document.getElementById('sourcesLine');

    box.classList.add('visible');
    badge.className       = 'status-badge processing';
    badge.innerHTML       = '<span class="dot pulse"></span> Processing…';
    text.textContent      = '';
    src.textContent       = '';

    try {
        const res = await fetch(`${NEXUS_API}/api/ask`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ question }),
        });

        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();

        // ── Render answer ──
        badge.className = 'status-badge ready';
        badge.innerHTML = '<span class="dot"></span> Ready';

        // data shape from run_agent.py:
        // { answer, sources, confidence, reasoning_path }
        if (data.answer) {
            text.textContent = data.answer;
        } else if (data.error) {
            text.textContent = '⚠ ' + data.error;
            badge.className  = 'status-badge processing'; // amber for error
        } else {
            text.textContent = JSON.stringify(data, null, 2);
        }

        // ── Sources line (uses existing .sources-line style) ──
        const parts = [];
        if (data.sources)        parts.push('Sources: ' + data.sources);
        if (data.confidence)     parts.push('Confidence: ' + data.confidence);
        if (data.reasoning_path) parts.push('Path: ' + data.reasoning_path);
        src.textContent = parts.join('  ·  ');

    } catch (err) {
        badge.className  = 'status-badge processing';
        badge.innerHTML  = '<span class="dot"></span> Error';
        text.textContent = '⚠ Could not reach NEXUS backend. Make sure the Node server is running on ' + NEXUS_API;
        console.error('NEXUS ask error:', err);
    }
};

/* ── CONTACT FORM ─────────────────────────── */
window.sendMessage = function () {
    const name  = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg   = document.getElementById('contactMsg').value.trim();
    if (!name || !email || !msg) { alert('Please fill in all fields.'); return; }
    // No backend contact endpoint in the repo — show confirmation
    alert('Message received. We\'ll be in touch!');
    document.getElementById('contactName').value  = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMsg').value   = '';
};

/* ── PLACEHOLDER BUTTON HANDLERS ─────────── */
window.getEarlyAccess = () => window.scrollToSection('contact');
window.startFree      = () => window.scrollToSection('analyze');
window.getPro         = () => window.scrollToSection('contact');
