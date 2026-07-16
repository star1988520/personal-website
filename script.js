const tabs = document.querySelectorAll('[data-tab]');
const pages = document.querySelectorAll('.page');
const nav = document.querySelector('.main-nav');
const toggle = document.querySelector('.menu-toggle');
const header = document.querySelector('.site-header');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

function showPage(id, scroll = true) {
  const target = document.getElementById(id) || document.getElementById('home');
  document.body.classList.toggle('home-active', target.id === 'home');
  pages.forEach(page => page.classList.toggle('active', page === target));
  document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.dataset.tab === target.id));
  document.title = `${target.querySelector('h1')?.textContent.trim() || '月桂之间'} · 月桂之间`;
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  if (target.id === 'about') playStarlightText();
  if (target.id === 'products') playProductConvergence();
  else resetProductConvergence();
  if (target.id === 'contact') playContactLetter();
  else resetContactLetter();
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

const productConvergence = document.getElementById('product-convergence');
const contactLetter = document.getElementById('contact-letter-hero');
const contactQuill = contactLetter?.querySelector('.contact-quill');
let contactLetterRun = 0;
let contactLetterAnimations = [];
let contactResizeTimer = 0;

function stopContactAnimations() {
  contactLetterAnimations.forEach(animation => animation.cancel());
  contactLetterAnimations = [];
}

function resetContactLetter() {
  if (!contactLetter) return;
  contactLetterRun += 1;
  stopContactAnimations();
  contactLetter.classList.remove('is-writing', 'contact-fallback');
}

function playContactLetter() {
  if (!contactLetter) return;
  contactLetterRun += 1;
  const run = contactLetterRun;
  stopContactAnimations();
  contactLetter.classList.remove('is-writing', 'contact-fallback');
  void contactLetter.offsetWidth;
  contactLetter.classList.add('is-writing');
  requestAnimationFrame(() => runContactWriting(run));
}

function playContactAnimation(element, keyframes, options) {
  const animation = element.animate(keyframes, { fill: 'forwards', ...options });
  contactLetterAnimations.push(animation);
  return animation.finished.catch(() => undefined);
}

async function runContactWriting(run) {
  if (!contactLetter || run !== contactLetterRun) return;
  if (reducedMotionQuery.matches || !Element.prototype.animate) {
    contactLetter.classList.add('contact-fallback');
    return;
  }

  try {
    await Promise.all([document.fonts?.ready, contactQuill?.decode?.().catch(() => undefined)]);
  } catch (_) {
    // Continue with the text fallback if a font or image cannot be decoded.
  }
  if (run !== contactLetterRun || !contactLetter.closest('.page.active')) return;

  const characters = [...contactLetter.querySelectorAll('h1 span')];
  const subtitle = contactLetter.querySelector('.contact-letter-subtitle');
  const inkEcho = contactLetter.querySelector('.contact-ink-echo');
  const heroBounds = contactLetter.getBoundingClientRect();
  const points = characters.map(character => {
    const bounds = character.getBoundingClientRect();
    const baseline = bounds.bottom - heroBounds.top - bounds.height * 0.2;
    return {
      character,
      startX: bounds.left - heroBounds.left + bounds.width * 0.1,
      endX: bounds.right - heroBounds.left - bounds.width * 0.08,
      y: baseline,
    };
  });
  if (!points.length) return;

  const quillAvailable = contactQuill && contactQuill.naturalWidth > 0;
  if (!quillAvailable) contactLetter.classList.add('quill-failed');
  const quillTransform = (x, y, angle) => `translate3d(${x}px,${y}px,0) translate(-2%,-98%) rotate(${angle}deg)`;
  const first = points[0];

  if (inkEcho) playContactAnimation(inkEcho, [
    { opacity: 0, transform: 'scaleX(0)', filter: 'blur(1.8px)' },
    { opacity: .12, transform: 'scaleX(.08)', filter: 'blur(1.4px)', offset: .1 },
    { opacity: .22, transform: 'scaleX(.58)', filter: 'blur(.7px)', offset: .55 },
    { opacity: .24, transform: 'scaleX(1)', filter: 'blur(.45px)', offset: .842 },
    { opacity: .07, transform: 'scaleX(1)', filter: 'blur(1.2px)' },
  ], { duration: 3800, delay: 250, easing: 'linear' });

  if (subtitle) playContactAnimation(subtitle, [
    { opacity: 0, filter: 'blur(7px)', color: 'rgba(118,101,81,.12)', textShadow: '0 0 8px currentColor' },
    { opacity: .08, filter: 'blur(5px)', color: 'rgba(118,101,81,.28)', textShadow: '0 0 6px currentColor', offset: .533 },
    { opacity: .42, filter: 'blur(2px)', color: 'rgba(118,101,81,.68)', textShadow: '0 0 3px currentColor', offset: .78 },
    { opacity: 1, filter: 'blur(0)', color: 'var(--muted)', textShadow: 'none' },
  ], { duration: 3000, delay: 800, easing: 'linear' });

  const duration = 3650;
  const entryOffset = 250 / duration;
  const writingEndOffset = 3250 / duration;
  const writingPath = [{ x: first.startX, y: first.y, angle: 26, characterStartIndex: 0 }];

  points.forEach((point, index) => {
    if (index > 0) {
      const previous = points[index - 1];
      const gap = point.startX - previous.endX;
      writingPath.push(
        { x: previous.endX + gap * .24, y: Math.min(previous.y, point.y) - 8, angle: 25 },
        { x: previous.endX + gap * .52, y: Math.min(previous.y, point.y) - 12, angle: 23 },
        { x: previous.endX + gap * .78, y: Math.min(previous.y, point.y) - 8, angle: 24 },
        { x: point.startX, y: point.y, angle: 26, characterStartIndex: index },
      );
    }
    writingPath.push(
      { x: (point.startX + point.endX) / 2, y: point.y - 7, angle: 23 },
      { x: point.endX, y: point.y, angle: 28, characterIndex: index },
    );
  });

  let totalDistance = 0;
  const distances = writingPath.map((point, index) => {
    if (!index) return 0;
    const previous = writingPath[index - 1];
    totalDistance += Math.hypot(point.x - previous.x, point.y - previous.y);
    return totalDistance;
  });
  const characterStartDelays = [];
  const characterEndDelays = [];
  const quillFrames = [
    {
      offset: 0,
      opacity: 0,
      transform: quillTransform(first.startX - 54, first.y - 52, 20),
      easing: 'cubic-bezier(.2,.68,.22,1)',
    },
    {
      offset: entryOffset,
      opacity: 1,
      transform: quillTransform(first.startX, first.y, 26),
      easing: 'linear',
    },
  ];

  writingPath.slice(1).forEach((point, pathIndex) => {
    const distance = distances[pathIndex + 1];
    const offset = entryOffset + (distance / Math.max(totalDistance, 1)) * (writingEndOffset - entryOffset);
    quillFrames.push({
      offset,
      opacity: 1,
      transform: quillTransform(point.x, point.y, point.angle),
      easing: 'linear',
    });
    if (point.characterStartIndex != null) characterStartDelays[point.characterStartIndex] = offset * duration;
    if (point.characterIndex != null) characterEndDelays[point.characterIndex] = offset * duration;
  });
  characterStartDelays[0] = entryOffset * duration;

  const last = points.at(-1);
  quillFrames.push(
    {
      offset: writingEndOffset + (1 - writingEndOffset) * .48,
      opacity: 1,
      transform: quillTransform(last.endX + 34, last.y + 20, 30),
      easing: 'cubic-bezier(.4,0,1,1)',
    },
    {
      offset: 1,
      opacity: 0,
      transform: quillTransform(last.endX + 70, last.y + 54, 34),
    },
  );

  if (quillAvailable) playContactAnimation(contactQuill, quillFrames, { duration, easing: 'linear' });

  points.forEach((point, index) => {
    const revealStart = characterStartDelays[index] ?? entryOffset * duration;
    const revealEnd = characterEndDelays[index] ?? revealStart + 260;
    const writingDuration = Math.max(180, revealEnd - revealStart);
    const dryingDuration = 190;
    const revealDuration = writingDuration + dryingDuration;
    const writtenOffset = writingDuration / revealDuration;
    playContactAnimation(point.character, [
      { opacity: .16, clipPath: 'inset(0 100% 0 0)', filter: 'blur(2.6px)', color: 'rgba(52,41,31,.18)', textShadow: '0 0 7px rgba(52,41,31,.38)' },
      { opacity: .82, clipPath: 'inset(0 0% 0 0)', filter: 'blur(1px)', color: 'rgba(52,41,31,.76)', textShadow: '0 0 4px rgba(52,41,31,.28)', offset: writtenOffset },
      { opacity: 1, clipPath: 'inset(0 0% 0 0)', filter: 'blur(0)', color: 'var(--ink)', textShadow: 'none' },
    ], { duration: revealDuration, delay: revealStart, easing: 'cubic-bezier(.24,.05,.32,1)' });
  });
}

contactQuill?.addEventListener('error', () => contactLetter?.classList.add('quill-failed'));
window.addEventListener('resize', () => {
  clearTimeout(contactResizeTimer);
  contactResizeTimer = setTimeout(() => {
    if (document.getElementById('contact')?.classList.contains('active')) playContactLetter();
  }, 160);
}, { passive: true });

function prepareProductDevelopingCopy() {
  if (!productConvergence) return;
  productConvergence.querySelectorAll('.product-develop').forEach(line => {
    const text = line.getAttribute('aria-label') || line.textContent;
    const characters = Array.from(text);
    const visibleCharacters = characters.filter(character => character !== ' ');
    const midpoint = (visibleCharacters.length - 1) / 2;
    let visibleIndex = 0;
    const fragment = document.createDocumentFragment();

    characters.forEach(character => {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      if (character === ' ') {
        span.className = 'develop-space';
        span.textContent = '\u00a0';
      } else {
        span.className = 'develop-character';
        const delay = line.classList.contains('product-develop-eyebrow')
          ? Math.abs(visibleIndex - midpoint) * 0.025
          : ((visibleIndex * 7) % 11) * 0.03;
        span.style.setProperty('--develop-delay', `${delay.toFixed(3)}s`);
        span.textContent = character;
        visibleIndex += 1;
      }
      fragment.append(span);
    });

    line.replaceChildren(fragment);
    line.classList.add('is-prepared');
  });
}

prepareProductDevelopingCopy();

function resetProductConvergence() {
  if (!productConvergence) return;
  productConvergence.classList.remove('is-playing');
}

function playProductConvergence() {
  if (!productConvergence) return;
  productConvergence.classList.remove('is-playing');
  void productConvergence.offsetWidth;
  productConvergence.classList.add('is-playing');
}

function playStarlightText() {
  const banner = document.querySelector('.about-starlight');
  if (!banner) return;
  const output = banner.querySelector('.about-starlight-text');
  output.replaceChildren(...Array.from(banner.dataset.starlightText).map((character, index) => {
    const span = document.createElement('span');
    span.textContent = character;
    span.style.setProperty('--character-index', index);
    return span;
  }));
}

tabs.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const id = link.dataset.tab;
  history.pushState(null, '', `#${id}`);
  const scrollTarget = link.dataset.scrollTarget;
  showPage(id, !scrollTarget);
  if (scrollTarget) requestAnimationFrame(() => {
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}));

toggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(nav.classList.contains('open')));
});

const aboutBook = document.getElementById('about-book');
const aboutHero = aboutBook.closest('.about-hero');
const aboutLeftImage = aboutHero.querySelector('.about-portrait-front');
const aboutSecondImage = aboutHero.querySelector('.about-portrait-second');
const aboutFrontPage = aboutBook.querySelector('.about-book-front');
const aboutFrontCopy = aboutBook.querySelector('.about-leaf-copy');
const aboutPictureFace = aboutBook.querySelector('.about-leaf-picture');
const aboutBackPage = aboutBook.querySelector('.about-book-back');
const mobileBookQuery = window.matchMedia('(max-width: 800px)');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let aboutBookPage = 0;
let aboutBookAnimation = null;

function removeCloneIds(root) {
  root.removeAttribute?.('id');
  root.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  root.querySelectorAll('button, a, input, textarea, select').forEach(element => element.remove());
  root.setAttribute('aria-hidden', 'true');
  root.classList.add('curl-page-content');
  return root;
}

function pageSource(index) {
  if (index === 1) return aboutBackPage;
  return aboutFrontCopy;
}

function setPageVisibility(element, visible) {
  element.classList.toggle('is-static-hidden', !visible);
  element.setAttribute('aria-hidden', String(!visible));
}

function renderAboutBookStatic() {
  const mobile = mobileBookQuery.matches;
  aboutBook.dataset.page = String(aboutBookPage);
  aboutHero.classList.toggle('book-mobile', mobile);
  const showingBack = aboutBookPage === 1;
  setPageVisibility(aboutFrontPage, !showingBack);
  setPageVisibility(aboutBackPage, showingBack);
  aboutHero.classList.toggle('is-second-portrait', showingBack);
  aboutLeftImage.setAttribute('aria-hidden', String(showingBack));
  aboutSecondImage.setAttribute('aria-hidden', String(!showingBack));
}

function createCurlLayer(frontSource, backSource, stripCount, stripOverlap = 0.7) {
  const bounds = aboutBook.getBoundingClientRect();
  const stripWidth = bounds.width / stripCount;
  const layer = document.createElement('div');
  layer.className = 'book-curl-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.style.setProperty('--page-width', `${bounds.width}px`);
  layer.style.setProperty('--page-height', `${bounds.height}px`);

  const strips = [];
  for (let index = 0; index < stripCount; index += 1) {
    const strip = document.createElement('div');
    strip.className = 'book-curl-strip';
    strip.style.width = `${stripWidth + stripOverlap}px`;

    const frontFace = document.createElement('div');
    frontFace.className = 'book-curl-face book-curl-front';
    const frontCrop = document.createElement('div');
    frontCrop.className = 'book-curl-crop';
    const frontClone = removeCloneIds(frontSource.cloneNode(true));
    frontClone.style.width = `${bounds.width}px`;
    frontClone.style.height = `${bounds.height}px`;
    frontClone.style.left = `${-index * stripWidth}px`;
    frontCrop.append(frontClone);
    frontFace.append(frontCrop);

    const backFace = document.createElement('div');
    backFace.className = 'book-curl-face book-curl-back';
    const backCrop = document.createElement('div');
    backCrop.className = 'book-curl-crop';
    const backClone = removeCloneIds(backSource.cloneNode(true));
    backClone.style.width = `${bounds.width}px`;
    backClone.style.height = `${bounds.height}px`;
    backClone.style.left = `${-(stripCount - 1 - index) * stripWidth}px`;
    backCrop.append(backClone);
    backFace.append(backCrop);

    strip.append(frontFace, backFace);
    layer.append(strip);
    strips.push(strip);
  }
  aboutBook.append(layer);
  const perspective = parseFloat(getComputedStyle(layer).perspective) || 1800;
  return { layer, strips, stripWidth, pageHeight: bounds.height, perspective };
}

function applyCurlGeometry(curl, progress, mobile, direction) {
  const baseAngle = -Math.PI * progress;
  const curveStrength = (mobile ? 0.92 : 1.08) * Math.sin(Math.PI * progress);
  const curveDirection = direction === 'forward' ? 1 : -1;
  let x = 0;
  let z = 0;
  const segments = curl.strips.map((strip, index) => {
    const unit = (index + 0.5) / curl.strips.length;
    const angle = baseAngle + curveDirection * curveStrength * (unit - 0.5) * 1.35;
    const fold = Math.sin(Math.PI * progress) * Math.sin(Math.PI * unit);
    const nextX = x + curl.stripWidth * Math.cos(angle);
    const nextZ = z + -curl.stripWidth * Math.sin(angle);
    const segment = { strip, x, z, nextX, nextZ, angle };
    x = nextX;
    z = nextZ;
    return segment;
  });

  if (!mobile) {
    const nearestZ = Math.max(0, ...segments.flatMap(segment => [segment.z, segment.nextZ]));
    const maxProjectedScale = 1 + (12 / curl.pageHeight);
    const requiredPerspective = nearestZ > 0
      ? nearestZ * maxProjectedScale / (maxProjectedScale - 1)
      : curl.perspective;
    curl.layer.style.perspective = `${Math.max(4000, requiredPerspective)}px`;
  }

  segments.forEach(({ strip, x: segmentX, z: segmentZ, angle }) => {
    strip.style.transform = `translate3d(${segmentX}px,0,${segmentZ}px) rotateY(${angle}rad)`;
  });
}

function finishAboutBookTurn(targetPage, layer, focus = true) {
  layer?.remove();
  aboutBookPage = targetPage;
  aboutBookAnimation = null;
  aboutBook.classList.remove('is-curling', 'curl-forward', 'curl-backward');
  aboutHero.classList.remove('is-curling');
  renderAboutBookStatic();
  if (focus) {
    requestAnimationFrame(() => {
      const visibleButton = [...aboutHero.querySelectorAll('[data-book-action]')].find(button =>
        button.offsetParent !== null &&
        !button.closest('.is-static-hidden') &&
        getComputedStyle(button).visibility !== 'hidden'
      );
      visibleButton?.focus({ preventScroll: true });
    });
  }
}

function animateAboutBook(fromPage, targetPage, direction) {
  if (aboutBookAnimation) return;
  const mobile = mobileBookQuery.matches;
  const stripCount = mobile ? 8 : 24;
  const duration = mobile ? 1100 : 1350;
  const forward = direction === 'forward';
  const frontSource = forward ? pageSource(fromPage) : pageSource(targetPage);
  const backSource = mobile ? (forward ? pageSource(targetPage) : pageSource(fromPage)) : aboutPictureFace;
  const curl = createCurlLayer(frontSource, backSource, stripCount, mobile ? 0.7 : 1.2);

  if (forward) {
    setPageVisibility(aboutFrontPage, false);
    setPageVisibility(aboutBackPage, true);
  } else {
    setPageVisibility(aboutFrontPage, false);
    setPageVisibility(aboutBackPage, true);
    if (!mobile) {
      aboutHero.classList.remove('is-second-portrait');
      aboutLeftImage.setAttribute('aria-hidden', 'false');
      aboutSecondImage.setAttribute('aria-hidden', 'true');
    }
  }

  aboutBook.classList.add('is-curling', forward ? 'curl-forward' : 'curl-backward');
  aboutHero.classList.add('is-curling');
  if (reducedMotionQuery.matches) {
    aboutBook.classList.add('book-reduced-fade');
    aboutBook.addEventListener('animationend', () => aboutBook.classList.remove('book-reduced-fade'), { once: true });
    finishAboutBookTurn(targetPage, curl.layer);
    return;
  }

  const start = performance.now();
  const animation = { frame: 0, targetPage, layer: curl.layer };
  aboutBookAnimation = animation;
  let portraitSwitched = false;
  function frame(now) {
    const raw = Math.min(1, (now - start) / duration);
    const eased = raw * raw * (3 - 2 * raw);
    const progress = forward ? eased : 1 - eased;
    if (mobile && !portraitSwitched && raw >= 0.42) {
      portraitSwitched = true;
      aboutHero.classList.toggle('is-second-portrait', forward);
      aboutLeftImage.setAttribute('aria-hidden', String(forward));
      aboutSecondImage.setAttribute('aria-hidden', String(!forward));
    }
    applyCurlGeometry(curl, progress, mobile, direction);
    if (raw < 1) animation.frame = requestAnimationFrame(frame);
    else finishAboutBookTurn(targetPage, curl.layer);
  }
  applyCurlGeometry(curl, forward ? 0 : 1, mobile, direction);
  animation.frame = requestAnimationFrame(frame);
}

aboutHero.addEventListener('click', event => {
  const button = event.target.closest('[data-book-action]');
  if (!button || aboutBookAnimation) return;
  const direction = button.dataset.bookAction === 'next' ? 1 : -1;
  const targetPage = Math.max(0, Math.min(1, aboutBookPage + direction));
  if (targetPage === aboutBookPage) return;
  animateAboutBook(aboutBookPage, targetPage, direction > 0 ? 'forward' : 'backward');
});

function handleBookLayoutChange() {
  if (aboutBookAnimation) {
    cancelAnimationFrame(aboutBookAnimation.frame);
    finishAboutBookTurn(aboutBookAnimation.targetPage, aboutBookAnimation.layer, false);
  }
  renderAboutBookStatic();
}

mobileBookQuery.addEventListener('change', handleBookLayoutChange);
window.addEventListener('resize', () => {
  if (aboutBookAnimation) handleBookLayoutChange();
}, { passive: true });
renderAboutBookStatic();

const videoItems = [
  ['干货', '狗狗我呀也是到了狗生巅峰', '抖音', 'assets/douyin-cover-1.webp', 'https://v.douyin.com/idatplgbSA0/', null, null],
  ['干货', '人生不要回头看，走好眼前路', '抖音', 'assets/douyin-cover-2.webp', 'https://v.douyin.com/U7wiVvOl8X8/', null, null],
  ['抽象', '那一刻你又在想什么呢？', '抖音', 'art-one', 'https://v.douyin.com/EcNq0rueRt4/', null, null],
  ['干货', '群星二宫等于有米吗', '抖音', 'assets/douyin-cover-3.webp', 'https://v.douyin.com/jSYqc320sAw/', null, null],
];
const catalog = document.getElementById('video-catalog');
const videoLoadMore = document.getElementById('video-load-more');
const douyinLinks = {
  '干货': 'https://v.douyin.com/zhioE3yhxNs/',
  '抽象': 'https://v.douyin.com/2V0RFijl3F0/'
};
const videosPerPage = 6;
let visibleVideoCount = videosPerPage;
let currentVideoFilter = '干货';
let videoSearchQuery = '';
function renderVideos() {
  const matches = videoItems.filter(v => v[0] === currentVideoFilter && `${v[0]} ${v[1]}`.toLowerCase().includes(videoSearchQuery));
  const visibleMatches = matches.slice(0, visibleVideoCount);
  catalog.innerHTML = visibleMatches.length ? visibleMatches.map(v => {
    const hasCover = v[3].startsWith('assets/');
    const artwork = hasCover ? `<div class="film-art video-cover-art"><img src="${v[3]}" alt="${v[1]}视频封面"><span class="play" aria-hidden="true">▶</span><span class="duration">${v[2]}</span></div>` : `<div class="film-art ${v[3]}"><span class="play" aria-hidden="true">▶</span><span class="duration">${v[2]}</span></div>`;
    const stats = v[5] == null ? '点赞 — · 收藏 —' : `点赞 ${v[5]} · 收藏 ${v[6]}`;
    return `<a class="film-card" href="${v[4] || douyinLinks[v[0]]}" target="_blank" rel="noopener noreferrer" aria-label="前往抖音查看${v[0]}视频《${v[1]}》">${artwork}<p>${stats}</p><h3>${v[1]}</h3></a>`;
  }).join('') : '<p class="empty-videos">没有找到对应的视频，换个关键词试试。</p>';
  videoLoadMore.hidden = matches.length <= visibleVideoCount;
}
renderVideos();
document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filters button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  currentVideoFilter = button.dataset.videoFilter;
  visibleVideoCount = videosPerPage;
  renderVideos();
}));
document.getElementById('video-search').addEventListener('input', event => { videoSearchQuery = event.target.value.trim().toLowerCase(); visibleVideoCount = videosPerPage; renderVideos(); });
videoLoadMore.addEventListener('click', () => { visibleVideoCount += videosPerPage; renderVideos(); });

document.addEventListener('click', event => {
  if (event.target.classList.contains('play')) {
    const original = event.target.textContent;
    event.target.textContent = 'Ⅱ';
    setTimeout(() => event.target.textContent = original, 900);
  }
  const stat = event.target.closest('.stat-action');
  if (stat) {
    stat.classList.toggle('active');
    const icon = stat.querySelector('span');
    const count = stat.querySelector('b');
    const value = Number(count.textContent.replace(/,/g, ''));
    count.textContent = (value + (stat.classList.contains('active') ? 1 : -1)).toLocaleString('en-US');
    icon.textContent = stat.getAttribute('aria-label') === '点赞'
      ? (stat.classList.contains('active') ? '♥' : '♡')
      : (stat.classList.contains('active') ? '★' : '☆');
  }
});

function successForm(formId, noteId, text) {
  document.getElementById(formId).addEventListener('submit', event => {
    event.preventDefault();
    document.getElementById(noteId).textContent = text;
    event.target.reset();
  });
}
successForm('guestbook-form', 'guestbook-note', '谢谢你，这句话已经被珍重收下。');
successForm('contact-form', 'contact-note', '信笺已整理好。正式上线时可在这里接入邮件服务。');
const peaceButton = document.getElementById('peace-button');
const peaceScene = document.getElementById('peace-scene');
const peaceBeforeVideo = peaceScene.querySelector('.peace-video-before');
const peaceAfterVideo = peaceScene.querySelector('.peace-video-after');
const peaceVideos = [peaceBeforeVideo, peaceAfterVideo];
const reducePeaceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const peaceLoopFadeMs = reducePeaceMotion ? 120 : 350;
const peaceLoopLeadSeconds = peaceLoopFadeMs / 1000 + .2;
const peaceLoopControllers = new Map(peaceVideos.map(video => [video, {
  timer: 0,
  token: 0,
  restarting: false
}]));
let peaceState = 'idle';
let peaceStateRequest = 0;

function playPeaceVideo(video) {
  if (!video) return Promise.resolve(false);
  const playPromise = video.play();
  if (!playPromise || typeof playPromise.then !== 'function') return Promise.resolve(true);
  return playPromise.then(() => true).catch(() => false);
}

function getActivePeaceVideo() {
  return peaceState === 'peaceful' ? peaceAfterVideo : peaceBeforeVideo;
}

function cancelPeaceLoop(video, uncover = true) {
  const controller = peaceLoopControllers.get(video);
  if (!controller) return;
  controller.token += 1;
  controller.restarting = false;
  if (controller.timer) window.clearTimeout(controller.timer);
  controller.timer = 0;
  if (uncover) video.classList.remove('is-loop-covering');
}

function seekPeaceVideoToStart(video) {
  return new Promise(resolve => {
    let settled = false;
    let timeout = 0;

    const cleanup = () => {
      video.removeEventListener('seeked', checkFrame);
      video.removeEventListener('loadeddata', checkFrame);
      video.removeEventListener('canplay', checkFrame);
      if (timeout) window.clearTimeout(timeout);
    };
    const finish = ready => {
      if (settled) return;
      settled = true;
      cleanup();
      window.requestAnimationFrame(() => resolve(ready));
    };
    const checkFrame = () => {
      if (!video.seeking && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish(true);
    };

    video.addEventListener('seeked', checkFrame);
    video.addEventListener('loadeddata', checkFrame);
    video.addEventListener('canplay', checkFrame);
    video.pause();
    video.currentTime = 0;
    window.requestAnimationFrame(() => window.requestAnimationFrame(checkFrame));
    timeout = window.setTimeout(() => finish(
      !video.seeking && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ), 2500);
  });
}

async function restartPeaceVideo(video, fadeDelay = peaceLoopFadeMs) {
  const controller = peaceLoopControllers.get(video);
  if (!controller || controller.restarting || video !== getActivePeaceVideo()) return;

  controller.restarting = true;
  const restartToken = ++controller.token;
  video.classList.add('is-loop-covering');
  controller.timer = window.setTimeout(async () => {
    controller.timer = 0;
    const frameReady = await seekPeaceVideoToStart(video);
    if (controller.token !== restartToken || video !== getActivePeaceVideo()) return;

    const playing = frameReady && await playPeaceVideo(video);
    if (controller.token !== restartToken || video !== getActivePeaceVideo()) return;

    controller.restarting = false;
    if (playing) video.classList.remove('is-loop-covering');
  }, fadeDelay);
}

function monitorPeaceLoop(event) {
  const video = event.currentTarget;
  if (
    video !== getActivePeaceVideo() ||
    video.paused ||
    !Number.isFinite(video.duration)
  ) return;

  if (video.duration - video.currentTime <= peaceLoopLeadSeconds) {
    restartPeaceVideo(video);
  }
}

async function startPeaceVideo(video, requestToken) {
  video.classList.add('is-loop-covering');
  const frameReady = await seekPeaceVideoToStart(video);
  if (requestToken !== peaceStateRequest || video !== getActivePeaceVideo()) return;

  const playing = frameReady && await playPeaceVideo(video);
  if (requestToken !== peaceStateRequest || video !== getActivePeaceVideo()) return;
  if (playing) video.classList.remove('is-loop-covering');
}

function setPeaceVideoState(showAfter) {
  peaceState = showAfter ? 'peaceful' : 'idle';
  peaceScene.dataset.peaceState = peaceState;
  peaceScene.setAttribute('aria-label', showAfter ? '点击后状态视频' : '点击前状态视频');
  peaceBeforeVideo.setAttribute('aria-hidden', String(showAfter));
  peaceAfterVideo.setAttribute('aria-hidden', String(!showAfter));
  peaceButton.classList.toggle('active', showAfter);
  peaceButton.setAttribute('aria-pressed', String(showAfter));

  const activeVideo = showAfter ? peaceAfterVideo : peaceBeforeVideo;
  const inactiveVideo = showAfter ? peaceBeforeVideo : peaceAfterVideo;
  const requestToken = ++peaceStateRequest;
  peaceVideos.forEach(video => cancelPeaceLoop(video));
  inactiveVideo.pause();
  startPeaceVideo(activeVideo, requestToken);
}

peaceButton.addEventListener('click', () => {
  setPeaceVideoState(peaceState === 'idle');
});

peaceVideos.forEach(video => {
  video.addEventListener('timeupdate', monitorPeaceLoop);
  video.addEventListener('ended', () => restartPeaceVideo(video, 0));
});
startPeaceVideo(peaceBeforeVideo, ++peaceStateRequest);

let failedPeaceVideos = 0;
peaceVideos.forEach(video => video.addEventListener('error', () => {
  failedPeaceVideos += 1;
  if (failedPeaceVideos === 2) peaceScene.classList.add('asset-failed');
}));
const zodiacSelect = document.getElementById('zodiac-select');
const zodiacIcons = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const zodiacIconPath = sign => `assets/zodiac/${sign}.png?v=20260712-gold-hd`;
const zodiacPicker = document.querySelector('.zodiac-picker');
const zodiacTrigger = document.getElementById('zodiac-picker-trigger');
const zodiacMenu = document.getElementById('zodiac-picker-menu');
const zodiacOptions = zodiacMenu.querySelectorAll('[data-zodiac-index]');
const astrologerFigure = document.getElementById('astrologer-figure');
const astrologerBefore = document.getElementById('astrologer-before');
const astrologerAfter = document.getElementById('astrologer-after');
const astrologerBeforeSource = astrologerBefore.querySelector('source');
const astrologerAfterSource = astrologerAfter.querySelector('source');
const astrologerVideoVersion = '20260713-alpha-webm';
const isIOSBrowser = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafariBrowser = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
const astrologerVideoFormat = isIOSBrowser || isSafariBrowser ? 'mp4' : 'webm';
const astrologerVideoType = astrologerVideoFormat === 'webm' ? 'video/webm' : 'video/mp4';
const astrologerBeforeSources = {
  mp4: 'assets/astrology/astrologer-before.mp4',
  webm: 'assets/astrology/webm/astrologer-before.webm'
};
const zodiacAnimationSources = zodiacIcons.reduce((sources, sign) => {
  sources[sign] = {
    mp4: `assets/astrology/signs/${sign}.mp4`,
    webm: `assets/astrology/webm/signs/${sign}.webm`
  };
  return sources;
}, {});
let astrologerResetTimer;
let astrologerFadeTimer;
let astrologerPlaybackVersion = 0;
let astrologerReturnVersion = null;
function versionedAstrologerSource(src) {
  return `${src}?v=${astrologerVideoVersion}`;
}
function setAstrologerVideoSource(video, source, src) {
  const nextSrc = versionedAstrologerSource(src);
  if (source.getAttribute('src') !== nextSrc) source.src = nextSrc;
  source.type = astrologerVideoType;
}
setAstrologerVideoSource(astrologerBefore, astrologerBeforeSource, astrologerBeforeSources[astrologerVideoFormat]);
astrologerBefore.load();
function returnToAstrologerBefore(version) {
  astrologerBefore.currentTime = 0;
  astrologerBefore.play().catch(() => {});
  astrologerFigure.classList.remove('is-selected');
  astrologerFadeTimer = window.setTimeout(() => {
    if (version !== astrologerPlaybackVersion) return;
    astrologerAfter.pause();
    astrologerAfter.currentTime = 0;
  }, 280);
}
function replayAstrologerAfter(index) {
  const version = ++astrologerPlaybackVersion;
  astrologerReturnVersion = null;
  window.clearTimeout(astrologerResetTimer);
  window.clearTimeout(astrologerFadeTimer);
  astrologerAfter.pause();
  astrologerAfter.currentTime = 0;
  astrologerAfter.setAttribute('aria-label', `${zodiacSelect.value}点击后的占星师动画`);
  astrologerAfter.addEventListener('canplay', () => {
    if (version !== astrologerPlaybackVersion) return;
    astrologerFigure.classList.add('is-selected');
    astrologerBefore.pause();
    astrologerAfter.currentTime = 0;
    astrologerAfter.play().catch(() => {});
  }, {once:true});
  setAstrologerVideoSource(astrologerAfter, astrologerAfterSource, zodiacAnimationSources[zodiacIcons[index]][astrologerVideoFormat]);
  astrologerAfter.load();
}
function scheduleAstrologerReturn() {
  const version = astrologerPlaybackVersion;
  if (astrologerReturnVersion === version) return;
  astrologerReturnVersion = version;
  astrologerResetTimer = window.setTimeout(() => {
    if (version === astrologerPlaybackVersion) returnToAstrologerBefore(version);
  }, 1000);
}
astrologerAfter.addEventListener('ended', scheduleAstrologerReturn);
astrologerAfter.addEventListener('timeupdate', () => {
  if (astrologerAfter.duration && astrologerAfter.currentTime >= astrologerAfter.duration - 0.08) {
    scheduleAstrologerReturn();
  }
});
function setZodiacMenu(open) {
  zodiacMenu.hidden = !open;
  zodiacTrigger.setAttribute('aria-expanded', String(open));
}
function syncZodiacPicker() {
  const index = zodiacSelect.selectedIndex;
  document.getElementById('selected-zodiac-name').textContent = zodiacSelect.value;
  document.getElementById('selected-zodiac-icon').src = zodiacIconPath(zodiacIcons[index]);
  zodiacOptions.forEach((option, optionIndex) => {
    option.setAttribute('aria-selected', String(optionIndex === index));
    option.querySelector('img').src = zodiacIconPath(zodiacIcons[optionIndex]);
  });
}
zodiacTrigger.addEventListener('click', () => setZodiacMenu(zodiacMenu.hidden));
zodiacOptions.forEach(option => option.addEventListener('click', () => {
  zodiacSelect.selectedIndex = Number(option.dataset.zodiacIndex);
  syncZodiacPicker();
  renderHoroscope();
  replayAstrologerAfter(zodiacSelect.selectedIndex);
  setZodiacMenu(false);
  zodiacTrigger.focus();
}));
document.addEventListener('click', event => { if (!zodiacPicker.contains(event.target)) setZodiacMenu(false); });
zodiacPicker.addEventListener('keydown', event => { if (event.key === 'Escape') { setZodiacMenu(false); zodiacTrigger.focus(); } });
const fortuneTexts = [
  '今天适合把注意力带回自己。一个被搁置的小念头，正在等待你认真回应。',
  '不必急着证明什么，稳定的节奏会让真正重要的关系和机会逐渐显现。',
  '好奇心会带来一条新线索。允许自己先尝试，再决定是否继续深入。',
  '情绪并不是阻碍，而是一封需要慢慢阅读的信。留一点空间给真实感受。',
  '你的表达正在被看见。温柔而坚定地说出需要，会比独自承担更有力量。',
  '整理环境也在整理内心。完成一件小事，会帮你找回清晰和掌控感。',
  '关系中的平衡来自坦诚，而非一味退让。今天适合进行一次轻松的对话。',
  '直觉很敏锐，但别急着下结论。多观察一步，你会看见事情的另一层含义。',
  '远方的召唤不一定是旅行，也可能是一个全新的观点。保持开放。',
  '持续积累正在产生回报。把宏大的目标拆成今天可以完成的一小步。',
  '一个不按常理出现的灵感值得记录。它可能成为下一阶段的重要起点。',
  '梦与现实并不冲突。为想象力找到一个具体出口，答案会慢慢浮现。'
];
let horoscopePeriod = 'daily';
function renderHoroscope() {
  const now = new Date();
  const signIndex = zodiacSelect.selectedIndex;
  const periodOffset = horoscopePeriod === 'daily' ? now.getDate() : horoscopePeriod === 'weekly' ? Math.ceil(now.getDate() / 7) + 19 : now.getMonth() + 41;
  const seed = signIndex * 17 + periodOffset + now.getFullYear();
  const labels = {daily:'今日',weekly:'本周',monthly:'本月'};
  const readingIcon = document.getElementById('zodiac-symbol');
  readingIcon.src = zodiacIconPath(zodiacIcons[signIndex]);
  readingIcon.alt = `${zodiacSelect.value}图标`;
  document.getElementById('horoscope-date').textContent = `${now.getFullYear()} · ${String(now.getMonth()+1).padStart(2,'0')} · ${labels[horoscopePeriod]}`;
  document.getElementById('horoscope-heading').textContent = `${zodiacSelect.value} · ${labels[horoscopePeriod]}星语`;
  document.getElementById('horoscope-text').textContent = fortuneTexts[(seed + (horoscopePeriod === 'daily' ? 0 : horoscopePeriod === 'weekly' ? 3 : 7)) % fortuneTexts.length];
  document.getElementById('score-mood').textContent = `${70 + seed % 28}%`;
  document.getElementById('score-love').textContent = `${68 + (seed * 3) % 30}%`;
  document.getElementById('score-work').textContent = `${72 + (seed * 5) % 26}%`;
}
zodiacSelect.addEventListener('change', () => { syncZodiacPicker(); renderHoroscope(); replayAstrologerAfter(zodiacSelect.selectedIndex); });
document.querySelectorAll('.horoscope-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.horoscope-tabs button').forEach(item => item.classList.remove('active'));
  button.classList.add('active'); horoscopePeriod = button.dataset.period; renderHoroscope();
}));
syncZodiacPicker();
renderHoroscope();
window.addEventListener('popstate', () => showPage(location.hash.slice(1) || 'home'));
showPage(location.hash.slice(1) || 'home', false);
