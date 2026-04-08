/* ══════════════════════════════════════════════
   MOCKHIRE AI — JAVASCRIPT
   ══════════════════════════════════════════════ */

'use strict';

// ── Nav Scroll State ──────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Intersection Observer for Reveal Animations ──
const observerConfig = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const delay = parseInt(el.dataset.delay || '0');

    setTimeout(() => {
      el.classList.add('visible');
    }, delay);

    revealObserver.unobserve(el);
  });
}, observerConfig);

// Observe all animatable elements
[
  '.problem-card',
  '.obj-item',
  '.feature-card',
  '.stack-item',
  '.challenge-card',
].forEach(selector => {
  document.querySelectorAll(selector).forEach(el => revealObserver.observe(el));
});

// ── Terminal Typewriter Animation ────────────────
function animateTerminal() {
  const lines = document.querySelectorAll('#terminal-body .t-line, #terminal-body .t-cursor');
  lines.forEach((line, i) => {
    line.style.animationDelay = `${0.4 + i * 0.28}s`;
  });
}
animateTerminal();

// ── Score Bar Color Coding ────────────────────────
document.querySelectorAll('.score-bar').forEach(bar => {
  const score = parseInt(bar.dataset.score);
  if (score >= 85) bar.style.color = 'var(--green)';
  else if (score >= 70) bar.style.color = 'var(--cyan)';
  else bar.style.color = 'var(--orange)';
});

// ── Architecture SVG Hover Tooltips ──────────────
const archSvg = document.getElementById('arch-svg');
if (archSvg) {
  const tooltips = {
    'User Interface':    'React components + routing — the visual layer users interact with.',
    'Voice I/O':         'Web Speech API: SpeechSynthesis (AI speaks) + SpeechRecognition (user speaks).',
    'Code Editor':       'Browser-based code editor with line numbers, tab support, multi-language.',
    'Auth Forms':        'Login / register forms. JWT token stored in memory on auth.',
    '/auth/*':           'POST /auth/register, POST /auth/login — issues JWT on success.',
    '/interview/*':      'GET /interview/start, POST /interview/answer, GET /interview/end.',
    '/dsa/*':            'POST /dsa/generate (3 problems), POST /dsa/submit (AI scores code).',
    '/feedback/*':       'POST /feedback/generate — reads full history, returns JSON scorecard.',
    'Question Gen':      'InterviewAgent generates the opening question based on mode (Tech/HR).',
    'Follow-up Agent':   'Shared agent instance reads full history to generate context-aware follow-ups.',
    'DSA Evaluator':     'LLaMA reviews submitted code for correctness, edge cases, and complexity.',
    'Feedback Report':   'Custom parser handles raw JSON, markdown-wrapped JSON, fractional scores.',
    'USERS':             'Stores user credentials (hashed passwords), roles, and metadata.',
    'SESSIONS':          'One record per interview session — mode, status, timestamps.',
    'HISTORY':           'Every Q&A turn stored with index. Feeds into feedback report generation.',
    'SCORES':            'Per-session scores: communication, confidence, technical, grammar, overall.',
    'DSA_RESULTS':       'Per-submission DSA records: problem level, language, score, timestamp.',
  };

  let tooltip = null;

  function showTooltip(text, x, y) {
    hideTooltip();
    tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: fixed;
      background: #111827;
      border: 1px solid #2D3B55;
      color: #CBD5E1;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      line-height: 1.5;
      padding: 10px 14px;
      border-radius: 6px;
      max-width: 260px;
      z-index: 999;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      transition: opacity 0.15s;
    `;
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    positionTooltip(x, y);
  }

  function positionTooltip(x, y) {
    if (!tooltip) return;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + 14;
    let top  = y - 10;
    if (left + tw > vw - 8) left = x - tw - 14;
    if (top + th > vh - 8)  top  = vh - th - 8;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  }

  function hideTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
  }

  archSvg.addEventListener('mousemove', e => {
    if (!tooltip) return;
    positionTooltip(e.clientX, e.clientY);
  });

  archSvg.addEventListener('mouseleave', hideTooltip);

  // Find text elements in SVG and add hover
  archSvg.querySelectorAll('text').forEach(textEl => {
    const label = textEl.textContent.trim();
    if (tooltips[label]) {
      // Find parent rect to make the whole box hoverable
      const parent = textEl.closest('g') || textEl.parentElement;
      parent.style.cursor = 'help';
      parent.addEventListener('mouseenter', e => showTooltip(tooltips[label], e.clientX, e.clientY));
      parent.addEventListener('mousemove',  e => positionTooltip(e.clientX, e.clientY));
      parent.addEventListener('mouseleave', hideTooltip);
    }
  });
}

// ── Flow SVG Step Labels Hover ────────────────────
const flowSvg = document.getElementById('flow-svg');
if (flowSvg) {
  const stepInfo = {
    '1': 'JWT token is issued on login and attached to every subsequent API request as Bearer token.',
    '2': 'User selects Technical (algorithms, system design, CS fundamentals) or HR (behavioral, situational) mode.',
    '3': 'POST /interview/start clears conversation history — guaranteeing session isolation.',
    '4': 'LLaMA generates the opening question. FastAPI returns it, frontend speaks it via SpeechSynthesis API.',
    '5': 'Browser\'s SpeechRecognition captures spoken answer, transcribes to text, sends to FastAPI.',
    '6': 'Full history (all prior Q&A) sent to LLaMA via Groq API. Returns context-aware follow-up question.',
    '7': 'Full conversation sent to LLaMA with scoring rubric. Returns JSON scorecard with all 5 metrics.',
  };

  let flowTooltip = null;

  function showFlowTooltip(text, x, y) {
    hideFlowTooltip();
    flowTooltip = document.createElement('div');
    flowTooltip.style.cssText = `
      position: fixed;
      background: #111827;
      border: 1px solid #2D3B55;
      color: #CBD5E1;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      line-height: 1.5;
      padding: 10px 14px;
      border-radius: 6px;
      max-width: 280px;
      z-index: 999;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    `;
    flowTooltip.textContent = text;
    document.body.appendChild(flowTooltip);
    posFlowTip(x, y);
  }

  function posFlowTip(x, y) {
    if (!flowTooltip) return;
    const tw = flowTooltip.offsetWidth;
    const th = flowTooltip.offsetHeight;
    let left = x + 14;
    let top  = y - 10;
    if (left + tw > window.innerWidth - 8) left = x - tw - 14;
    if (top  + th > window.innerHeight - 8) top = window.innerHeight - th - 8;
    flowTooltip.style.left = left + 'px';
    flowTooltip.style.top  = top  + 'px';
  }

  function hideFlowTooltip() {
    if (flowTooltip) { flowTooltip.remove(); flowTooltip = null; }
  }

  flowSvg.addEventListener('mousemove', e => {
    if (flowTooltip) posFlowTip(e.clientX, e.clientY);
  });
  flowSvg.addEventListener('mouseleave', hideFlowTooltip);

  flowSvg.querySelectorAll('.flow-step').forEach(step => {
    const stepNum = step.dataset.step;
    if (stepInfo[stepNum]) {
      step.addEventListener('mouseenter', e => showFlowTooltip(stepInfo[stepNum], e.clientX, e.clientY));
      step.addEventListener('mouseleave', hideFlowTooltip);
    }
  });
}

// ── Active Nav Link on Scroll ─────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        link.style.background = '';
      });
      const id = entry.target.id;
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) {
        active.style.color = 'var(--cyan)';
        active.style.background = 'rgba(0,212,255,0.08)';
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── Smooth Scroll for Nav Links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Animated counter for hero stats ──────────────
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

// Observe hero stats
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(num => {
        const val = parseInt(num.textContent);
        if (!isNaN(val)) animateCounter(num, val);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// ── Arch SVG Line Animation Reset ────────────────
// Makes animated dashes restart smoothly
document.querySelectorAll('.arch-line').forEach((line, i) => {
  line.style.animationDelay = `${-i * 0.8}s`;
});

console.log('%c[MockHire AI] System Online', 'color: #00D4FF; font-family: monospace; font-weight: bold; font-size: 14px;');
console.log('%cBuilt with FastAPI · React · LLaMA 3.1 · Groq · SQLite · JWT', 'color: #64748B; font-family: monospace; font-size: 11px;');