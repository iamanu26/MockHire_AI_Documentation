/* ══════════════════════════════════════════════
   MOCKHIRE AI — JAVASCRIPT v3
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
    setTimeout(() => { el.classList.add('visible'); }, delay);
    revealObserver.unobserve(el);
  });
}, observerConfig);

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

// ── Shared Tooltip Helpers ─────────────────────
function createTooltip(text, x, y, maxWidth = 260) {
  const tooltip = document.createElement('div');
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
    max-width: ${maxWidth}px;
    z-index: 999;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    transition: opacity 0.15s;
  `;
  tooltip.textContent = text;
  document.body.appendChild(tooltip);
  positionTooltip(tooltip, x, y);
  return tooltip;
}

function positionTooltip(tooltip, x, y) {
  if (!tooltip) return;
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  let left = x + 14;
  let top  = y - 10;
  if (left + tw > window.innerWidth - 8) left = x - tw - 14;
  if (top  + th > window.innerHeight - 8) top = window.innerHeight - th - 8;
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
}

// ── Architecture SVG Hover Tooltips ──────────────
const archSvg = document.getElementById('arch-svg');
if (archSvg) {
  const tooltips = {
    'User Interface':    'React components + routing — the visual layer users interact with.',
    'Voice I/O':         'Web Speech API: SpeechSynthesis (AI speaks) + SpeechRecognition (user speaks).',
    'Resume Upload':     'NEW: PDF drag-and-drop uploader. File sent to /resume/upload, parsed by PyMuPDF, skills extracted via LLaMA.',
    'Resources Tab':     'NEW: Dedicated nav tab for AI Interview Coach chat. Talks to /coach/* endpoints using LLaMA 3.1.',
    'Auth Forms':        'Login, register, Google OAuth callback, and email OTP verification pages.',
    '/auth/*':           'POST /auth/register → email OTP sent. POST /auth/verify-email → is_verified=true. POST /auth/login. GET /auth/google (OAuth flow).',
    '/interview/*':      'GET /interview/start (injects resume context), POST /interview/answer, GET /interview/end.',
    '/resume/*':         'NEW: POST /resume/upload (parses PDF), GET /resume/me (user resume), DELETE /resume/:id.',
    '/coach/*':          'NEW: POST /coach/chat — stateless LLaMA call with coaching system prompt. Streams response back.',
    '/dsa + /feedback':  'POST /dsa/generate, POST /dsa/submit, POST /feedback/generate — all use shared LLaMA agent.',
    'Question Gen':      'InterviewAgent now injects resume skills JSON into the system prompt for personalized opening questions.',
    'Follow-up Agent':   'Shared agent reads full conversation + resume context to generate relevant follow-up questions.',
    'Resume Parser':     'NEW: PyMuPDF extracts raw text from uploaded PDF, LLaMA summarizes to compact skills JSON (≤200 tokens).',
    'Coach Agent':       'NEW: Stateless LLaMA call with a coaching-specific system prompt. No session history needed.',
    'DSA + Feedback':    'Code review and feedback scoring — uses prompt engineering with scoring rubrics and hard caps.',
    'USERS':             'NEW cols: oauth_provider (google | null), oauth_id, is_verified (bool), verification_token.',
    'SESSIONS':          'Added resume_id FK — links each interview session to the resume used for context injection.',
    'RESUMES':           'NEW TABLE: id, user_id (FK), file_path (S3 or local), extracted_text, skills_json, uploaded_at.',
    'SCORES':            'Per-session scores: communication, confidence, technical, grammar, overall — all stored in PostgreSQL.',
    'HISTORY + DSA':     'Q&A turns (question, answer, turn_index) and DSA submissions (level, language, score/10) per session.',
  };

  let tooltip = null;

  archSvg.addEventListener('mousemove', e => {
    if (!tooltip) return;
    positionTooltip(tooltip, e.clientX, e.clientY);
  });

  archSvg.addEventListener('mouseleave', () => {
    if (tooltip) { tooltip.remove(); tooltip = null; }
  });

  archSvg.querySelectorAll('text').forEach(textEl => {
    const label = textEl.textContent.trim();
    if (tooltips[label]) {
      const parent = textEl.closest('g') || textEl.parentElement;
      parent.style.cursor = 'help';
      parent.addEventListener('mouseenter', e => {
        if (tooltip) { tooltip.remove(); }
        tooltip = createTooltip(tooltips[label], e.clientX, e.clientY);
      });
      parent.addEventListener('mousemove',  e => positionTooltip(tooltip, e.clientX, e.clientY));
      parent.addEventListener('mouseleave', () => {
        if (tooltip) { tooltip.remove(); tooltip = null; }
      });
    }
  });
}

// ── Flow SVG Step Labels Hover ────────────────────
const flowSvg = document.getElementById('flow-svg');
if (flowSvg) {
  const stepInfo = {
    '1': 'Login via JWT credentials OR Google OAuth 2.0. Clicking "Login with Google" redirects to /auth/google → Google consent → callback → JWT issued.',
    '2': 'On email/password registration, a 6-digit OTP is emailed. User must verify before their first session. Google OAuth users skip this step (pre-verified).',
    '3': 'NEW: User uploads their PDF resume. /resume/upload parses it with PyMuPDF, LLaMA extracts a skills_json summary (<200 tokens), stored in PostgreSQL RESUMES table.',
    '4': 'User selects Technical (algorithms, system design, CS fundamentals) or HR (behavioral, situational) interview mode.',
    '5': 'POST /interview/start — clears history, injects resume skills_json into the system prompt. LLaMA generates a personalized opening question based on both mode AND resume.',
    '6': 'Full conversation + resume context sent to LLaMA for scoring. 5-metric JSON scorecard (Communication, Technical, Confidence, Grammar, Overall) saved to PostgreSQL SCORES table.',
  };

  let flowTip = null;

  flowSvg.addEventListener('mousemove', e => {
    if (flowTip) positionTooltip(flowTip, e.clientX, e.clientY);
  });

  flowSvg.addEventListener('mouseleave', () => {
    if (flowTip) { flowTip.remove(); flowTip = null; }
  });

  flowSvg.querySelectorAll('.flow-step').forEach(step => {
    const stepNum = step.dataset.step;
    if (stepInfo[stepNum]) {
      step.addEventListener('mouseenter', e => {
        if (flowTip) flowTip.remove();
        flowTip = createTooltip(stepInfo[stepNum], e.clientX, e.clientY, 300);
      });
      step.addEventListener('mouseleave', () => {
        if (flowTip) { flowTip.remove(); flowTip = null; }
      });
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
        link.style.borderColor = '';
      });
      const id = entry.target.id;
      const active = document.querySelector(`.nav-link[href="#${id}"]`);
      if (active) {
        if (active.classList.contains('nav-link-highlight')) {
          active.style.color = 'var(--orange)';
          active.style.background = 'rgba(245,158,11,0.12)';
        } else {
          active.style.color = 'var(--cyan)';
          active.style.background = 'rgba(0,212,255,0.08)';
        }
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ── Smooth Scroll ─────────────────────────────────
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

// ── Arch SVG Line Animation ────────────────────────
document.querySelectorAll('.arch-line').forEach((line, i) => {
  line.style.animationDelay = `${-i * 0.8}s`;
});

// ── Coach Chat: animate typing dots ──────────────
const typingDots = document.querySelector('.chat-typing');
if (typingDots) {
  // typing indicator loops automatically via CSS keyframes
  // Occasionally hide/show to simulate realistic pauses
  setInterval(() => {
    typingDots.style.opacity = typingDots.style.opacity === '0' ? '1' : '0';
    typingDots.style.transition = 'opacity 0.4s';
  }, 3000);
}

// ── Resources: chat send button interaction ───────
const sendBtn = document.querySelector('.chat-send-btn');
const chatInput = document.querySelector('.chat-input-mock');
if (sendBtn && chatInput) {
  sendBtn.addEventListener('click', () => {
    sendBtn.style.transform = 'scale(0.9)';
    setTimeout(() => { sendBtn.style.transform = ''; }, 150);
    // Scroll chat to bottom hint
    const msgs = document.querySelector('.chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  });
}

console.log('%c[MockHire AI v3] System Online', 'color: #00D4FF; font-family: monospace; font-weight: bold; font-size: 14px;');
console.log('%cPostgreSQL · OAuth 2.0 · Email Verify · Resume Upload · AI Coach', 'color: #EC4899; font-family: monospace; font-size: 11px;');
console.log('%cBuilt with FastAPI · React · LLaMA 3.1 · Groq · SQLAlchemy · JWT', 'color: #64748B; font-family: monospace; font-size: 11px;');