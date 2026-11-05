/*
  GLOBAL TIMELINE
  ----------------
  state.progress (0–1) is the only animation clock on the page.
  The scroll handler only updates state; requestAnimationFrame reads
  the smoothed value and renders the footage, DOM, HUD, and particles.
*/
const state = {
  scrollY: 0,
  maxScroll: 1,
  progress: 0,
  smoothProgress: 0,
  width: innerWidth,
  height: innerHeight
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, amount) => a + (b - a) * amount;

// Remap one slice of the 0–1 timeline to any output range.
function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = clamp((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
}

function sectionBand(value, fadeInStart, fullStart, fullEnd, fadeOutEnd) {
  const fadeIn = mapRange(value, fadeInStart, fullStart, 0, 1);
  const fadeOut = 1 - mapRange(value, fullEnd, fadeOutEnd, 0, 1);
  return clamp(Math.min(fadeIn, fadeOut));
}

const TIMELINE = {
  logoHold: [0.00, 0.15],
  logoDock: [0.15, 0.30],
  intro: [0.25, 0.45],
  projects: [0.27, 0.36],
  skills: [0.50, 0.58, 0.615, 0.69],
  automation: [0.66, 0.72, 0.82, 0.89],
  contact: [0.84, 0.96],
  footage: [0.00, 0.32]
};

const CHAPTERS = [
  { start: 0.00, label: "Hero / 01" },
  { start: 0.25, label: "About / 02" },
  { start: 0.31, label: "Projects / 03" },
  { start: 0.58, label: "Skills / 04" },
  { start: 0.72, label: "Automation / 05" },
  { start: 0.84, label: "Contact / 06" }
];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroCanvas = document.querySelector("#heroCanvas");
const heroCtx = heroCanvas.getContext("2d", { alpha: false });
const fxCanvas = document.querySelector("#fxCanvas");
const fxCtx = fxCanvas.getContext("2d");

const elements = {
  logoLayer: document.querySelector("#logoLayer"),
  tagline: document.querySelector("#tagline"),
  tagDeveloper: document.querySelector("#tagDeveloper"),
  tagCreative: document.querySelector("#tagCreative"),
  tagSystems: document.querySelector("#tagSystems"),
  intro: document.querySelector("#introText"),
  cards: [...document.querySelectorAll(".card")],
  skills: document.querySelector("#skills .inner"),
  skillItems: [...document.querySelectorAll(".skill")],
  automation: document.querySelector("#automation .inner"),
  workflowSteps: [...document.querySelectorAll(".workflow-step")],
  workflowConnectors: [...document.querySelectorAll(".workflow-connector")],
  automationStats: [...document.querySelectorAll(".automation-stat")],
  contact: document.querySelector("#contact .inner"),
  timecode: document.querySelector("#timecode"),
  chapter: document.querySelector("#chapter"),
  progressFill: document.querySelector("#progressFill"),
  scrollCue: document.querySelector("#scrollCue"),
  grade: document.querySelector("#grade")
};

/* Insert each public repository URL below. Once configured, the expanded
   panel fetches and displays that repository's real README from GitHub. */
const PROJECTS = {
  "guapclock": {
    reel: "Reel 001", title: "GuapClock",
    summary: "A desktop booth-time clock for producers that tracks studio sessions, creates organized artist folders, and writes invoice records.",
    stack: "Java / Swing / Desktop Systems / File Automation",
    repo: "https://github.com/nadidoug/guapclock",
    readme: "<span class='readme-label'>README preview</span><h2>GuapClock</h2><p>A room-readable session clock designed to make booth time obvious, organized, and hard to dispute.</p>"
  },
  "email-campaign": {
    reel: "Reel 002", title: "Email Campaign System",
    summary: "A real signup flow that saves subscribers in Supabase, queues welcome emails, sends through Resend, and gives every email a working unsubscribe link.",
    stack: "Supabase / Edge Functions / GitHub Actions / Resend / Email Automation",
    repo: "",
    readme: "<span class='readme-label'>System preview</span><h2>Email Campaign System</h2><p>When someone joins the list, their email is saved in Supabase, a welcome email is placed into a queue, and a worker sends it through Resend. In simple terms: the website collects the lead, the database remembers them, and the system follows up automatically.</p><p>This keeps the subscriber list organized, makes the email process repeatable, and includes a one-click unsubscribe link so people can opt out cleanly.</p>"
  },
  "flash-gordon": {
    reel: "Reel 003", title: "Flash Gordon Electric & Solar",
    summary: "A client website I built and maintain for Flash Gordon Electric & Solar.",
    stack: "Website Development / Ongoing Maintenance",
    repo: "", website: "https://flashgordonelectricandsolar.com/",
    readme: ""
  }
};

/* 95 optimized WebP frames were sampled from the supplied MOV. */
const FRAME_COUNT = 95;
const frames = Array.from({ length: FRAME_COUNT });
const loaded = new Set();

function framePath(index) {
  return `assets/hero-frames/frame-${String(index + 1).padStart(3, "0")}.webp`;
}

function loadFrame(index) {
  if (frames[index]) return;
  const image = new Image();
  image.decoding = "async";
  image.src = framePath(index);
  image.onload = () => loaded.add(index);
  frames[index] = image;
}

// Start with the opening beat, then fill the sequence without blocking the page.
for (let index = 0; index < 12; index += 1) loadFrame(index);
const preload = () => {
  for (let index = 12; index < FRAME_COUNT; index += 1) loadFrame(index);
};
if ("requestIdleCallback" in window) requestIdleCallback(preload, { timeout: 1400 });
else setTimeout(preload, 300);

let particles = [];
function resize() {
  state.width = innerWidth;
  state.height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  [heroCanvas, fxCanvas].forEach(canvas => {
    canvas.width = Math.round(state.width * dpr);
    canvas.height = Math.round(state.height * dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
  });
  heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.maxScroll = Math.max(1, document.documentElement.scrollHeight - state.height);
  particles = Array.from({ length: state.width < 700 ? 24 : 48 }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    radius: .5 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - .5) * .3
  }));
  updateScroll();
}

function updateScroll() {
  state.scrollY = scrollY || pageYOffset;
  state.progress = clamp(state.scrollY / state.maxScroll);
}

addEventListener("scroll", updateScroll, { passive: true });
addEventListener("resize", resize);

function nearestLoadedFrame(target) {
  if (loaded.has(target)) return frames[target];
  for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
    if (loaded.has(target - distance)) return frames[target - distance];
    if (loaded.has(target + distance)) return frames[target + distance];
  }
  return null;
}

function renderFootage(progress) {
  const footageProgress = mapRange(progress, ...TIMELINE.footage, 0, 1);
  const frameIndex = Math.round(footageProgress * (FRAME_COUNT - 1));
  loadFrame(frameIndex);
  const image = nearestLoadedFrame(frameIndex);
  heroCtx.fillStyle = "#0b0c0e";
  heroCtx.fillRect(0, 0, state.width, state.height);
  if (!image) return;

  // Canvas equivalent of object-fit: cover, with a slight cinematic push-in.
  const push = mapRange(progress, 0, .32, 1.02, 1.12);
  const scale = Math.max(state.width / image.naturalWidth, state.height / image.naturalHeight) * push;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  heroCtx.save();
  const projectHold = 1 - mapRange(progress, .25, .45, 0, .68);
  heroCtx.globalAlpha = projectHold - mapRange(progress, .65, .88, 0, .27);
  heroCtx.filter = "saturate(.72) contrast(1.16) brightness(.72)";
  heroCtx.drawImage(image, (state.width - width) / 2, (state.height - height) / 2, width, height);
  heroCtx.restore();
}

function renderParticles(progress, time) {
  fxCtx.clearRect(0, 0, state.width, state.height);
  const visibility = mapRange(progress, .16, .72, .08, .72);
  const speed = mapRange(progress, 0, 1, .2, 1.4);
  const red = Math.round(lerp(255, 88, progress));
  const green = Math.round(lerp(107, 124, progress));
  const blue = Math.round(lerp(43, 255, progress));

  particles.forEach((particle, index) => {
    particle.y -= (.08 + (index % 5) * .025) * speed;
    particle.x += particle.drift * speed;
    if (particle.y < -8) particle.y = state.height + 8;
    if (particle.x < -8) particle.x = state.width + 8;
    if (particle.x > state.width + 8) particle.x = -8;
    const pulse = .55 + Math.sin(time * .001 + particle.phase + progress * 7) * .45;
    const radius = particle.radius * mapRange(progress, 0, 1, .7, 1.8);
    fxCtx.beginPath();
    fxCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${visibility * pulse})`;
    fxCtx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    fxCtx.fill();
  });
}

function renderDOM(progress) {
  const dock = mapRange(progress, ...TIMELINE.logoDock, 0, 1);
  const logoScale = lerp(1, .18, dock);
  const logoY = lerp(0, -38, dock);
  elements.logoLayer.style.transform = `translate(-50%, -50%) translateY(${logoY}vh) scale(${logoScale})`;
  elements.tagline.style.opacity = 1 - dock;
  elements.tagline.style.transform = `translateY(${-dock * 16}px)`;

  const developerIn = mapRange(progress, .030, .046, 0, 1);
  const systemsIn = mapRange(progress, .050, .066, 0, 1);
  const creativeIn = mapRange(progress, .080, .098, 0, 1);
  const developerEase = 1 - Math.pow(1 - developerIn, 3);
  const systemsEase = 1 - Math.pow(1 - systemsIn, 3);
  const creativePop = 1 - Math.pow(1 - creativeIn, 4);
  const taglineSlide = state.width < 560 ? 16 : 58;
  const creativeStartScale = state.width < 560 ? .9 : .78;
  elements.tagDeveloper.style.opacity = developerEase * (1 - dock);
  elements.tagDeveloper.style.transform = `translateX(${lerp(-taglineSlide, 0, developerEase)}px)`;
  elements.tagSystems.style.opacity = systemsEase * (1 - dock);
  elements.tagSystems.style.transform = `translateX(${lerp(taglineSlide, 0, systemsEase)}px)`;
  elements.tagCreative.style.opacity = creativePop * (1 - dock);
  elements.tagCreative.style.transform = `translateY(${lerp(14, 0, creativePop)}px) scale(${lerp(creativeStartScale, 1, creativePop)})`;
  elements.tagCreative.style.setProperty("--line-scale", creativePop);

  const intro = mapRange(progress, ...TIMELINE.intro, 0, 1);
  elements.intro.style.opacity = intro;
  elements.intro.style.transform = `translateY(${lerp(70, 0, intro)}px)`;

  elements.cards.forEach((card, index) => {
    const cardIn = mapRange(progress, TIMELINE.projects[0] + index * .012, TIMELINE.projects[1] + index * .018, 0, 1);
    const cardEase = 1 - Math.pow(1 - cardIn, 2.6);
    const swingSettle = Math.sin(cardIn * Math.PI) * (1 - cardEase);
    const mobileCards = state.width < 700;
    const startX = mobileCards ? (index % 2 === 0 ? -28 : 28) : [-140, 0, 140][index];
    const startY = mobileCards ? 54 : [74, 96, 74][index];
    const startRotateY = mobileCards ? (index % 2 === 0 ? -10 : 10) : [-22, 0, 22][index];
    const startRotateZ = mobileCards ? (index % 2 === 0 ? -4 : 4) : [-8, 5, 8][index];
    const rotateX = lerp(mobileCards ? 8 : 12, 0, cardEase) - swingSettle * 5;
    const rotateY = lerp(startRotateY, 0, cardEase) + swingSettle * (index === 1 ? 0 : index === 0 ? 7 : -7);
    const rotateZ = lerp(startRotateZ, 0, cardEase) + swingSettle * (index === 1 ? -3 : index === 0 ? 4 : -4);
    const translateX = lerp(startX, 0, cardEase);
    const translateY = lerp(startY, 0, cardEase);
    const scale = lerp(.9, 1, cardEase);
    card.style.opacity = mapRange(cardIn, 0, .58, .18, 1);
    card.style.transform = `perspective(900px) translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
  });

  const skills = sectionBand(progress, ...TIMELINE.skills);
  const skillsIn = mapRange(progress, TIMELINE.skills[0], TIMELINE.skills[1], 0, 1);
  const skillsOut = mapRange(progress, TIMELINE.skills[2], TIMELINE.skills[3], 0, 1);
  const skillsY = skillsOut > 0 ? lerp(0, -48, skillsOut) : lerp(74, 0, skillsIn);
  elements.skills.style.opacity = skills * .85;
  elements.skills.style.transform = `translateY(${skillsY}px)`;
  elements.skillItems.forEach((skill, index) => {
    const itemIn = mapRange(progress, TIMELINE.skills[0] + index * .007, TIMELINE.skills[1] + index * .007, 0, 1);
    const itemOut = mapRange(progress, TIMELINE.skills[2] + index * .004, TIMELINE.skills[3] + index * .004, 0, 1);
    const itemVisible = Math.min(itemIn, 1 - itemOut);
    const itemEase = 1 - Math.pow(1 - itemIn, 2.5);
    const wave = Math.sin((progress * 44) + index * .75) * 4 * itemVisible;
    const drift = itemOut > 0 ? lerp(0, -22, itemOut) : lerp(34 + (index % 3) * 8, 0, itemEase);
    const scale = lerp(.92, 1, itemEase) - itemOut * .04;
    skill.style.opacity = Math.max(0, itemVisible);
    skill.style.transform = `translate3d(0, ${drift + wave}px, 0) scale(${scale})`;
  });

  // Reveal against the section's layout position, independent of page length.
  const automationSection = elements.automation.closest("section");
  const automationDistance = state.scrollY + state.height * .85 - automationSection.offsetTop;
  const automationProgress = mapRange(automationDistance, 0, state.height * .65,
    TIMELINE.automation[0], TIMELINE.automation[3]);
  const automation = mapRange(automationDistance, 0, state.height * .3, 0, 1);
  const automationIn = mapRange(automationProgress, TIMELINE.automation[0], TIMELINE.automation[1], 0, 1);
  const automationY = lerp(48, 0, automationIn);
  elements.automation.style.opacity = automation;
  elements.automation.style.transform = `translateY(${automationY}px)`;

  elements.workflowSteps.forEach((step, index) => {
    const stepIn = mapRange(automationProgress, TIMELINE.automation[0] + .035 + index * .012, TIMELINE.automation[0] + .105 + index * .012, 0, 1);
    const stepEase = 1 - Math.pow(1 - stepIn, 2.4);
    step.style.opacity = stepEase;
    step.style.transform = `translateY(${lerp(18, 0, stepEase)}px)`;
  });

  elements.workflowConnectors.forEach((connector, index) => {
    const lineIn = mapRange(automationProgress, TIMELINE.automation[0] + .054 + index * .012, TIMELINE.automation[0] + .12 + index * .012, 0, 1);
    connector.style.setProperty("--connector-glow", lineIn);
  });

  elements.automationStats.forEach((stat, index) => {
    const statIn = mapRange(automationProgress, TIMELINE.automation[2] - .055 + index * .014, TIMELINE.automation[2] + .018 + index * .014, 0, 1);
    const statEase = 1 - Math.pow(1 - statIn, 2.2);
    stat.style.opacity = statEase;
    stat.style.transform = `translateY(${lerp(26, 0, statEase)}px)`;
  });

  const contactSection = elements.contact.closest("section");
  const contact = mapRange(state.scrollY + state.height * .9 - contactSection.offsetTop,
    0, state.height * .4, 0, 1);
  elements.contact.style.opacity = contact;
  elements.contact.style.transform = `translateY(${lerp(60, 0, contact)}px)`;

  elements.scrollCue.style.opacity = 1 - mapRange(progress, .015, .08, 0, 1);
  elements.progressFill.style.height = `${progress * 100}%`;
  elements.grade.style.opacity = mapRange(progress, .18, .5, 1, .72);

  const seconds = progress * 180;
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const wholeSeconds = String(Math.floor(seconds % 60)).padStart(2, "0");
  const frames24 = String(Math.floor((seconds % 1) * 24)).padStart(2, "0");
  elements.timecode.textContent = `${minutes}:${wholeSeconds}:${frames24}`;
  let active = CHAPTERS[0].label;
  CHAPTERS.forEach(chapter => { if (progress >= chapter.start) active = chapter.label; });
  elements.chapter.textContent = active;
}

const projectDialog = document.querySelector("#projectDialog");
const dialogClose = document.querySelector("#dialogClose");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogReel = document.querySelector("#dialogReel");
const dialogSummary = document.querySelector("#dialogSummary");
const dialogStack = document.querySelector("#dialogStack");
const dialogReadme = document.querySelector("#dialogReadme");
const dialogRepo = document.querySelector("#dialogRepo");

async function openProject(projectKey) {
  const project = PROJECTS[projectKey];
  if (!project) return;
  dialogTitle.textContent = project.title;
  dialogReel.textContent = project.reel;
  dialogSummary.textContent = project.summary;
  dialogStack.textContent = project.stack;
  dialogReadme.innerHTML = project.readme;
  dialogRepo.hidden = !project.repo;
  if (project.repo) dialogRepo.href = project.repo;
  const preview = document.querySelector("#projectPreview");
  const frame = document.querySelector("#projectPreviewFrame");
  preview.hidden = !project.website;
  dialogReadme.hidden = Boolean(project.website);
  if (project.website) {
    const allowed = window.cookieConsent?.allowsOptional() === true;
    frame.hidden = !allowed;
    document.querySelector("#projectPreviewConsent").hidden = allowed;
    if (allowed) frame.src = project.website;
    else frame.removeAttribute("src");
    document.querySelector("#projectWebsite").href = project.website;
  } else frame.removeAttribute("src");
  projectDialog.showModal();

  if (!project.repo) return;
  const match = project.repo.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return;
  dialogReadme.innerHTML = "<span class='readme-label'>README</span><p>Loading from GitHub…</p>";
  try {
    const response = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}/readme`, {
      headers: { Accept: "application/vnd.github.raw+json" }
    });
    if (!response.ok) throw new Error("README unavailable");
    const markdown = await response.text();
    const escaped = markdown.replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);
    dialogReadme.innerHTML = `<span class="readme-label">README from GitHub</span><pre>${escaped}</pre>`;
  } catch (error) {
    dialogReadme.innerHTML = project.readme;
  }
}

elements.cards.forEach(card => card.addEventListener("click", () => openProject(card.dataset.project)));
document.querySelector("#previewCookieSettings").addEventListener("click", () => {
  projectDialog.close();
  window.cookieConsent?.open();
});
window.addEventListener("cookieconsentchange", () => {
  if (!window.cookieConsent.allowsOptional()) {
    const frame = document.querySelector("#projectPreviewFrame");
    frame.removeAttribute("src");
    frame.hidden = true;
    document.querySelector("#projectPreviewConsent").hidden = false;
  }
});
projectDialog.addEventListener("close", () => {
  document.querySelector("#projectPreviewFrame").removeAttribute("src");
});
dialogClose.addEventListener("click", () => projectDialog.close());
projectDialog.addEventListener("click", event => {
  if (event.target === projectDialog) projectDialog.close();
});

const emailToggle = document.querySelector("#emailToggle");
const subscribePanel = document.querySelector("#subscribePanel");
const subscribeClose = document.querySelector("#subscribeClose");
const subscribeForm = document.querySelector("#subscribeForm");
const subscriberName = document.querySelector("#subscriberName");
const subscriberEmail = document.querySelector("#subscriberEmail");
const subscribeStatus = document.querySelector("#subscribeStatus");
const SUBSCRIBE_ENDPOINT = "https://yattojbkdupvahegedzv.supabase.co/functions/v1/portfolio-submit";
let subscribeAutoShown = false;
let subscribeSubmitting = false;

function setSubscribePanel(open, dismissed = false, focusField = false) {
  subscribePanel.classList.toggle("open", open);
  subscribePanel.setAttribute("aria-hidden", String(!open));
  emailToggle.setAttribute("aria-expanded", String(open));
  if (dismissed) sessionStorage.setItem("nadi-subscribe-dismissed", "true");
  if (open && window.matchMedia("(max-width: 820px)").matches) {
    setTimeout(() => subscribePanel.scrollIntoView({ behavior: "smooth", block: "end" }), 120);
  }
  requestAnimationFrame(() => {
    state.maxScroll = Math.max(1, document.documentElement.scrollHeight - state.height);
    updateScroll();
  });
  if (open && focusField) setTimeout(() => subscriberEmail.focus(), 560);
}

emailToggle.addEventListener("click", () => {
  const opening = !subscribePanel.classList.contains("open");
  setSubscribePanel(opening, !opening, opening);
});
subscribeClose.addEventListener("click", () => setSubscribePanel(false, true));
subscribeForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (subscribeSubmitting) return;
  if (!subscribeForm.reportValidity()) return;
  subscribeSubmitting = true;
  const submitButton = subscribeForm.querySelector(".subscribe-submit");
  const originalText = submitButton.textContent;
  subscribeStatus.textContent = "Adding you to the list...";
  submitButton.disabled = true;
  submitButton.textContent = "Sending";

  try {
    const response = await fetch(SUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "newsletter",
        name: subscriberName.value.trim(),
        email: subscriberEmail.value.trim()
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.error) throw new Error(result.error || "Signup failed.");
    subscribeStatus.textContent = "You are on the list. Check your email for the welcome note.";
    subscribeForm.reset();
  } catch (error) {
    subscribeStatus.textContent = "Something did not send. Try again or email nadi@nadidoug.com.";
  } finally {
    subscribeSubmitting = false;
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

function tick(time) {
  state.smoothProgress = reduceMotion
    ? state.progress
    : lerp(state.smoothProgress, state.progress, .085);
  renderFootage(state.smoothProgress);
  renderParticles(state.smoothProgress, time);
  renderDOM(state.smoothProgress);
  if (state.smoothProgress >= .90 && !subscribeAutoShown && !sessionStorage.getItem("nadi-subscribe-dismissed")) {
    subscribeAutoShown = true;
    setSubscribePanel(true);
  }
  requestAnimationFrame(tick);
}

resize();
requestAnimationFrame(tick);
