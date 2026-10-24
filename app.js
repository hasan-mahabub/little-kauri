'use strict';

const APP_VERSION = '1.0';
const APP_YEAR = 2026;

// Inside the Android app the WebView has no speech voices, so speech goes to the phone's own text to speech
// through the AndroidTTS bridge (see android/). This mimics the small part of speechSynthesis the app uses.
if (window.AndroidTTS) {
  const pending = new Map();
  const voiceListeners = [];
  let nextId = 0;
  window.__ttsEvent = (id, type) => {
    const utterance = pending.get(id);
    if (!utterance) return;
    pending.delete(id);
    (type === 'end' ? utterance.onend : utterance.onerror)?.();
  };
  window.__ttsVoicesChanged = () => voiceListeners.forEach((fn) => fn());
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      Object.assign(this, { text, rate: 1, pitch: 1, voice: null, lang: 'en-NZ', onend: null, onerror: null });
    }
  };
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      getVoices: () => JSON.parse(window.AndroidTTS.voices())
        .map((v) => ({ name: v.name, lang: v.lang, voiceURI: v.name, localService: !v.network, quality: v.quality })),
      speak(u) {
        const id = String(++nextId);
        pending.set(id, u);
        window.AndroidTTS.speak(id, u.text, u.rate, u.pitch, u.voice?.voiceURI ?? '', u.lang);
      },
      cancel() {
        for (const [id, u] of pending) {
          pending.delete(id);
          u.onerror?.();
        }
        window.AndroidTTS.stop();
      },
      addEventListener(type, fn) {
        if (type === 'voiceschanged') voiceListeners.push(fn);
      },
    },
  });
}

// Storage keys keep the app's first name so existing progress and voice choices are not lost.
const STORE_KEY = 'starrySchool.v1';
const STARS_PER_TOY = 25;

// Characters with a `theme` are offered first for that theme; the rest are offered to everyone.
const ANIMALS = [
  { id: 'fairy', emoji: '🧚‍♀️', name: 'Fairy', theme: 'girl' },
  { id: 'mermaid', emoji: '🧜‍♀️', name: 'Mermaid', theme: 'girl' },
  { id: 'princess', emoji: '👸', name: 'Princess', theme: 'girl' },
  { id: 'superheroGirl', emoji: '🦸‍♀️', name: 'Superhero', theme: 'girl' },
  { id: 'ballerina', emoji: '🩰', name: 'Ballerina', theme: 'girl' },
  { id: 'flamingo', emoji: '🦩', name: 'Flamingo', theme: 'girl' },
  { id: 'swan', emoji: '🦢', name: 'Swan', theme: 'girl' },
  { id: 'ladybird', emoji: '🐞', name: 'Ladybird', theme: 'girl' },
  { id: 'peacock', emoji: '🦚', name: 'Peacock', theme: 'girl' },
  { id: 'poodle', emoji: '🐩', name: 'Poodle', theme: 'girl' },
  { id: 'trex', emoji: '🦖', name: 'T rex', theme: 'boy' },
  { id: 'dinosaur', emoji: '🦕', name: 'Dinosaur', theme: 'boy' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', theme: 'boy' },
  { id: 'shark', emoji: '🦈', name: 'Shark', theme: 'boy' },
  { id: 'lion', emoji: '🦁', name: 'Lion', theme: 'boy' },
  { id: 'tiger', emoji: '🐯', name: 'Tiger', theme: 'boy' },
  { id: 'superheroBoy', emoji: '🦸‍♂️', name: 'Superhero', theme: 'boy' },
  { id: 'astronaut', emoji: '🧑‍🚀', name: 'Astronaut', theme: 'boy' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja', theme: 'boy' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Wizard', theme: 'boy' },
  { id: 'robot', emoji: '🤖', name: 'Robot', theme: 'boy' },
  { id: 'monkey', emoji: '🐒', name: 'Monkey', theme: 'boy' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'kitten', emoji: '🐱', name: 'Kitten' },
  { id: 'puppy', emoji: '🐶', name: 'Puppy' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'koala', emoji: '🐨', name: 'Koala' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'pony', emoji: '🐴', name: 'Pony' },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin' },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
  { id: 'hedgehog', emoji: '🦔', name: 'Hedgehog' },
  { id: 'hamster', emoji: '🐹', name: 'Hamster' },
  { id: 'polarbear', emoji: '🐻‍❄️', name: 'Polar bear' },
];

const animalsFor = (theme) => [
  ...ANIMALS.filter((a) => a.theme === theme),
  ...ANIMALS.filter((a) => !a.theme),
];

// Toys with a `theme` are offered and won only for that theme; the rest suit everyone.
const TOYS = [
  { id: 'doll', emoji: '🪆', name: 'Dolly', theme: 'girl' },
  { id: 'dress', emoji: '👗', name: 'Pretty dress', theme: 'girl' },
  { id: 'teaset', emoji: '🫖', name: 'Tea set', theme: 'girl' },
  { id: 'wand', emoji: '🪄', name: 'Magic wand', theme: 'girl' },
  { id: 'handbag', emoji: '👜', name: 'Handbag', theme: 'girl' },
  { id: 'ribbon', emoji: '🎀', name: 'Hair ribbon', theme: 'girl' },
  { id: 'balletShoes', emoji: '🩰', name: 'Ballet shoes', theme: 'girl' },
  { id: 'mirror', emoji: '🪞', name: 'Magic mirror', theme: 'girl' },
  { id: 'ring', emoji: '💍', name: 'Sparkly ring', theme: 'girl' },
  { id: 'sunHat', emoji: '👒', name: 'Pretty hat', theme: 'girl' },
  { id: 'carousel', emoji: '🎠', name: 'Toy carousel', theme: 'girl' },
  { id: 'unicornToy', emoji: '🦄', name: 'Unicorn toy', theme: 'girl' },
  { id: 'car', emoji: '🚗', name: 'Toy car', theme: 'boy' },
  { id: 'robot', emoji: '🤖', name: 'Robot', theme: 'boy' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', theme: 'boy' },
  { id: 'fireTruck', emoji: '🚒', name: 'Fire truck', theme: 'boy' },
  { id: 'train', emoji: '🚂', name: 'Toy train', theme: 'boy' },
  { id: 'tractor', emoji: '🚜', name: 'Tractor', theme: 'boy' },
  { id: 'plane', emoji: '✈️', name: 'Aeroplane', theme: 'boy' },
  { id: 'helicopter', emoji: '🚁', name: 'Helicopter', theme: 'boy' },
  { id: 'raceCar', emoji: '🏎️', name: 'Race car', theme: 'boy' },
  { id: 'policeCar', emoji: '🚓', name: 'Police car', theme: 'boy' },
  { id: 'dinoToy', emoji: '🦖', name: 'Dinosaur toy', theme: 'boy' },
  { id: 'crane', emoji: '🏗️', name: 'Building crane', theme: 'boy' },
  { id: 'teddy', emoji: '🧸', name: 'Teddy bear' },
  { id: 'ball', emoji: '⚽', name: 'Ball' },
  { id: 'kite', emoji: '🪁', name: 'Kite' },
  { id: 'balloon', emoji: '🎈', name: 'Balloon' },
  { id: 'bike', emoji: '🚲', name: 'Bike' },
  { id: 'scooter', emoji: '🛴', name: 'Scooter' },
  { id: 'yoyo', emoji: '🪀', name: 'Yoyo' },
  { id: 'puzzle', emoji: '🧩', name: 'Puzzle' },
  { id: 'paint', emoji: '🎨', name: 'Paint set' },
  { id: 'guitar', emoji: '🎸', name: 'Guitar' },
  { id: 'drum', emoji: '🥁', name: 'Drum' },
];

const toysFor = (theme) => [
  ...TOYS.filter((t) => t.theme === theme),
  ...TOYS.filter((t) => !t.theme),
];

const STICKERS = [
  '🌈', '⭐', '🦋', '🌸', '🍓', '🧁', '🍭', '🌻', '🐞', '🐠',
  '🍉', '💖', '🌙', '☀️', '🐢', '🍩', '🎂', '🌷', '🐝', '🍒',
  '🦩', '🐳', '🪐', '🍦', '🎠', '🌺', '🐙', '🍪', '💎', '🦚',
];

const PRAISE = ['Well done!', 'Ka pai!', 'Great job!', 'Tino pai!', 'Awesome!', 'You got it!', 'Super star!'];
const TRY_AGAIN = ['Oops, try again!', 'Not that one. Try again!', 'Have another go!'];
const CARD_COLORS = ['c-pink', 'c-lilac', 'c-mint', 'c-sun', 'c-sky', 'c-peach'];

/* Helpers */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Builds DOM nodes; children are appended as text so user input is never parsed as HTML.
function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'style') node.style.cssText = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

/* Storage */

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && Array.isArray(saved.profiles)) return saved;
  } catch {
    // Corrupt or unavailable storage: start fresh.
  }
  return { profiles: [], activeId: null };
}

const store = loadStore();

// Listen and Tap used to be a single Set 1 game; keep those stars on the new Set 1 card.
for (const p of store.profiles) {
  if (p.best['letters.listen'] && !p.best['letters.listen.set1']) p.best['letters.listen.set1'] = p.best['letters.listen'];
  delete p.best['letters.listen'];
}

function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Private browsing can block storage; the game still works for this session.
  }
}

const activeProfile = () => store.profiles.find((p) => p.id === store.activeId) ?? null;
const animalOf = (p) => ANIMALS.find((a) => a.id === p.animal) ?? ANIMALS[0];
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const isReady = (game) => typeof game.build === 'function' || Array.isArray(game.sets);

// Learning stages (First 6 months, then later years). Each stage file in stages/ calls registerStage().
const STAGES = [];
function registerStage(stage) {
  for (const world of stage.worlds) world.stage = stage;
  STAGES.push(stage);
}
const allWorlds = () => STAGES.flatMap((s) => s.worlds);
// Grouped games (with `sets`) count as played once any of their sets is played.
const gameDone = (p, game) => (game.sets ? game.sets.some((s) => p.best[s.id]) : Boolean(p.best[game.id]));

/* Speech */

const VOICE_KEY = 'starrySchool.voice';
const VOICE_DEFAULTS = { voiceURI: '', rate: 0.9, pitch: 1.15 };
const VOICE_LANGS = ['en-nz', 'en-au', 'en-gb', 'en-us'];

function loadVoiceSettings() {
  try {
    return { ...VOICE_DEFAULTS, ...JSON.parse(localStorage.getItem(VOICE_KEY)) };
  } catch {
    return { ...VOICE_DEFAULTS };
  }
}

const Speech = {
  ok: 'speechSynthesis' in window,
  voice: null,
  voices: [],
  // Saved per device, because each tablet or phone has its own set of voices.
  settings: loadVoiceSettings(),
  init() {
    if (!this.ok) return;
    const refresh = () => {
      this.voices = speechSynthesis.getVoices();
      this.voice = this.pick();
    };
    refresh();
    speechSynthesis.addEventListener('voiceschanged', refresh);
  },
  englishVoices() {
    return this.voices.filter((v) => v.lang.toLowerCase().startsWith('en') && v.localService !== false);
  },
  isPreferred(v) {
    return v.lang.toLowerCase().replace('_', '-').startsWith('en-gb')
      && /google.*uk.*english.*female/i.test(`${v.name} ${v.voiceURI}`);
  },
  quality(v) {
    if (Number.isFinite(v.quality)) return v.quality;
    return /neural|natural|enhanced|premium/i.test(v.name) ? 400 : 0;
  },
  // A saved choice wins; otherwise prefer the requested Google voice, then offline accent and quality.
  pick() {
    const saved = this.voices.find((v) => v.voiceURI === this.settings.voiceURI && v.localService !== false);
    if (saved) return saved;
    const english = this.englishVoices();
    const preferred = english.filter((v) => this.isPreferred(v));
    if (preferred.length) return preferred.find((v) => v.localService) ?? preferred[0];
    for (const offlineOnly of [true, false]) {
      for (const lang of VOICE_LANGS) {
        const matches = english
          .filter((v) => (!offlineOnly || v.localService) && v.lang.toLowerCase().replace('_', '-').startsWith(lang))
          .sort((a, b) => this.quality(b) - this.quality(a));
        if (matches.length) return matches[0];
      }
    }
    return english.sort((a, b) => this.quality(b) - this.quality(a))[0] ?? null;
  },
  save(changes) {
    Object.assign(this.settings, changes);
    try {
      localStorage.setItem(VOICE_KEY, JSON.stringify(this.settings));
    } catch {
      // Storage blocked: the choice still applies until the page is closed.
    }
    this.voice = this.pick();
  },
  // Bumped whenever speech starts or stops, so a running sayParts sequence knows it was interrupted.
  gen: 0,
  stop() {
    this.gen += 1;
    if (this.ok) speechSynthesis.cancel();
  },
  say(text, { slow = false } = {}) {
    if (!this.ok || !text) return Promise.resolve();
    this.gen += 1;
    speechSynthesis.cancel();
    const rate = this.settings.rate * (slow ? 0.8 : 1);
    return new Promise((resolve) => {
      // Some browsers never fire onend, so a timeout guarantees the game keeps moving.
      const timer = setTimeout(resolve, (1500 + text.length * 110) * (0.9 / rate));
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      utterance.lang = this.voice?.lang ?? 'en-NZ';
      utterance.rate = rate;
      utterance.pitch = this.settings.pitch;
      utterance.onend = done;
      utterance.onerror = done;
      speechSynthesis.speak(utterance);
    });
  },
};

/* Sound effects (generated, no audio files) */

const Sfx = {
  ctx: null,
  play(notes, type = 'sine') {
    try {
      this.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t0 = this.ctx.currentTime;
      for (const [freq, at, dur] of notes) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t0 + at);
        gain.gain.exponentialRampToValueAtTime(0.2, t0 + at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t0 + at);
        osc.stop(t0 + at + dur + 0.05);
      }
    } catch {
      // Audio not available on this device.
    }
  },
  correct() { this.play([[523, 0, 0.15], [659, 0.1, 0.15], [784, 0.2, 0.3]]); },
  wrong() { this.play([[330, 0, 0.18], [262, 0.15, 0.25]], 'triangle'); },
  pop() { this.play([[880, 0, 0.08], [1320, 0.04, 0.08]], 'triangle'); },
  fanfare() { this.play([[523, 0, 0.2], [659, 0.15, 0.2], [784, 0.3, 0.2], [1047, 0.45, 0.6]], 'triangle'); },
};

/* Recorded clips (Ministry letter sounds) */

// One shared element: once iOS has played it from a tap, later prompts can play without a tap.
const Clips = {
  player: new Audio(),
  blobs: new Map(),
  preload(paths) {
    for (const path of paths) {
      if (this.blobs.has(path)) continue;
      this.blobs.set(path, null);
      fetch(`sounds/${path}.mp3`)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
        .then((b) => this.blobs.set(path, URL.createObjectURL(b)))
        .catch(() => this.blobs.delete(path));
    }
  },
  play(path) {
    Speech.stop();
    this.player.pause();
    this.player.src = this.blobs.get(path) || `sounds/${path}.mp3`;
    return this.player.play();
  },
  // Resolves when the clip finishes or is stopped; rejects if the file is missing.
  playToEnd(path) {
    return this.play(path).then(() => new Promise((resolve) => {
      const done = () => {
        this.player.removeEventListener('pause', done);
        resolve();
      };
      this.player.addEventListener('pause', done);
    }));
  },
  stop() {
    this.player.pause();
  },
};

// Says each part in turn: strings use the voice, { clip, text } parts play a recording and fall back to the voice.
async function sayParts(parts, opts) {
  for (const part of parts) {
    let gen;
    if (typeof part === 'string') {
      const spoken = Speech.say(part, opts);
      gen = Speech.gen;
      await spoken;
    } else {
      const played = Clips.playToEnd(part.clip);
      gen = Speech.gen;
      try {
        await played;
      } catch {
        if (Speech.gen !== gen) return;
        const spoken = Speech.say(part.text, opts);
        gen = Speech.gen;
        await spoken;
      }
    }
    if (Speech.gen !== gen) return;
  }
}

/* Visual effects */

const fx = () => document.getElementById('fx');

function confetti(count = 70) {
  const colors = ['#ff8fc7', '#b79cff', '#6fdcbf', '#ffd166', '#7cc8ff', '#ffab91'];
  for (let i = 0; i < count; i++) {
    const piece = h('span', {
      class: 'confetti',
      style: `left:${Math.random() * 100}vw;background:${pick(colors)};--r:${randInt(0, 360)}deg;`
        + `animation-duration:${1.8 + Math.random() * 1.6}s;animation-delay:${Math.random() * 0.4}s`,
    });
    fx().append(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function floatStars(count) {
  for (let i = 0; i < count; i++) {
    const star = h('span', {
      class: 'float-star',
      style: `--dx:${randInt(-140, 140)}px;animation-delay:${i * 0.12}s`,
    }, '⭐');
    fx().append(star);
    setTimeout(() => star.remove(), 1600);
  }
}

function shake(node) {
  node.classList.remove('shake');
  void node.offsetWidth;
  node.classList.add('shake');
}

/* Rewards */

// Wished toys first, then the player's theme and shared toys; toys already won always stay on the shelf.
function toyQueue(p) {
  const byId = (id) => TOYS.find((t) => t.id === id);
  const wished = p.wishes.map(byId).filter(Boolean);
  const rest = toysFor(p.theme ?? 'girl').filter((t) => !p.wishes.includes(t.id));
  const owned = p.toys.map(byId).filter((t) => t && !wished.includes(t) && !rest.includes(t));
  return [...wished, ...rest, ...owned];
}

const nextToyFor = (p) => toyQueue(p).find((t) => !p.toys.includes(t.id)) ?? null;

function grantToys(p) {
  const won = [];
  while (Math.floor(p.stars / STARS_PER_TOY) > p.toys.length) {
    const toy = nextToyFor(p);
    if (!toy) break;
    p.toys.push(toy.id);
    won.push(toy);
  }
  return won;
}

function grantSticker(p) {
  const unowned = STICKERS.filter((s) => !p.stickers.includes(s));
  if (!unowned.length) return null;
  const sticker = pick(unowned);
  p.stickers.push(sticker);
  return sticker;
}

function grantCrown(p, world) {
  if (p.crowns.includes(world.id)) return false;
  if (!world.games.filter(isReady).every((g) => gameDone(p, g))) return false;
  p.crowns.push(world.id);
  return true;
}

/* Shared UI */

const app = document.getElementById('app');

const THEMES = [
  { id: 'girl', label: 'Girl', emoji: '👧', avatar: 'images/girl.svg', say: 'Girl! Pink and purple colours.', swatches: ['#ff8fc7', '#b79cff', '#6fdcbf'] },
  { id: 'boy', label: 'Boy', emoji: '👦', avatar: 'images/boy.svg', say: 'Boy! Blue and green colours.', swatches: ['#4da3ff', '#38c6a0', '#ffd166'] },
];

function applyTheme(theme = 'girl') {
  document.body.dataset.theme = theme;
  const color = getComputedStyle(document.body).getPropertyValue('--pink-soft').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

function show(screen, ...args) {
  Speech.stop();
  Clips.stop();
  // Shared account screens use a neutral palette; each child's play screens use their own theme.
  const shared = [screenProfiles, screenNewProfile].includes(screen);
  applyTheme(screen === screenParent ? 'parent' : shared ? 'girl' : activeProfile()?.theme);
  app.replaceChildren(screen(...args));
  window.scrollTo(0, 0);
}

function topbar({ back, extra } = {}) {
  const p = activeProfile();
  return h('header', { class: 'topbar' },
    back ? h('button', { class: 'round-btn', 'aria-label': 'Back', onclick: back }, '⬅️') : null,
    p ? h('button', { class: 'avatar-btn', 'aria-label': 'My profile', onclick: () => show(screenProfile) }, animalOf(p).emoji) : null,
    h('div', { class: 'spacer' }),
    extra ?? null,
    p ? h('div', { class: 'pill' }, '⭐ ', h('span', { class: 'star-count' }, p.stars)) : null,
  );
}

function speakable(text, tag = 'h1', cls = 'big-title') {
  return h(tag, { class: cls },
    h('button', { class: 'speak-btn', 'aria-label': 'Hear it', onclick: () => Speech.say(text) }, '🔊'),
    h('span', {}, text),
  );
}

function miniStars(count) {
  return h('span', { class: 'mini-stars' },
    [1, 2, 3].map((i) => h('span', { class: i <= count ? 'on' : 'off' }, '⭐')));
}

/* Screens: players */

function screenProfiles() {
  return h('section', { class: 'screen' },
    speakable('Who is playing today?'),
    h('div', { class: 'grid' },
      store.profiles.map((p, i) => h('button', {
        class: `card ${CARD_COLORS[i % CARD_COLORS.length]}`,
        onclick: () => {
          store.activeId = p.id;
          saveStore();
          Sfx.pop();
          show(screenHome);
          Speech.say(`Kia ora ${p.name}!`);
        },
      },
      h('span', { class: 'emoji' }, animalOf(p).emoji),
      h('span', { class: 'title' }, p.name),
      h('span', { class: 'sub' }, `⭐ ${p.stars}`))),
      h('button', { class: 'card card-add', onclick: () => show(screenNewProfile) },
        h('span', { class: 'emoji' }, '➕'),
        h('span', { class: 'title' }, 'New player')),
    ),
    h('div', { class: 'row grown-ups-row' }, holdButton('👪 Grown ups: hold for 3 seconds', () => show(screenParent))),
  );
}

function screenNewProfile() {
  const draft = { theme: null, name: '', animal: null, toys: [] };
  const root = h('section', { class: 'screen' });
  const header = (onBack, privacy = true) => h('header', { class: 'topbar' },
    onBack ? h('button', { class: 'round-btn', 'aria-label': 'Back', onclick: onBack }, '⬅️') : null,
    h('div', { class: 'spacer' }),
    privacy ? h('a', { class: 'small-btn privacy-link', href: 'privacy.html' }, 'Privacy Policy') : null);

  const stepTheme = () => {
    const next = h('button', { class: 'big-btn', disabled: !draft.theme, onclick: () => stepName() }, 'Next ➡️');
    const grid = h('div', { class: 'grid theme-grid' }, THEMES.map((t) => {
      const btn = h('button', {
        class: `card theme-card theme-${t.id} ${draft.theme === t.id ? 'selected' : ''}`,
        onclick: () => {
          draft.theme = t.id;
          applyTheme(t.id);
          grid.querySelectorAll('.theme-card').forEach((x) => x.classList.remove('selected'));
          btn.classList.add('selected');
          next.disabled = false;
          Sfx.pop();
        },
      },
      h('img', { class: 'avatar', src: t.avatar, alt: '' }),
      h('span', { class: 'title' }, t.label),
      h('span', { class: 'swatches' }, t.swatches.map((c) => h('span', { class: 'swatch', style: `background:${c}` }))));
      return btn;
    }));
    root.replaceChildren(
      header(store.profiles.length ? () => show(screenProfiles) : null, false),
      speakable('Are you a girl or a boy?'),
      h('p', { class: 'hint' }, 'This picks the colours for this player. You can change it later in the Parent Corner.'),
      grid,
      h('div', { class: 'row' }, next),
      h('div', { class: 'row' }, holdButton('👪 Grown ups: hold for 3 seconds to set up the voice', () => show(screenParent))),
    );
  };

  const stepName = () => {
    const input = h('input', {
      class: 'name-input', type: 'text', maxlength: '20', autocomplete: 'off',
      placeholder: 'Name', 'aria-label': 'Name', value: draft.name,
    });
    const next = h('button', { class: 'big-btn', disabled: !draft.name }, 'Next ➡️');
    const submit = () => {
      if (!input.value.trim()) return;
      draft.name = input.value.trim();
      stepAnimal();
    };
    input.addEventListener('input', () => { next.disabled = !input.value.trim(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    next.addEventListener('click', submit);
    root.replaceChildren(
      header(stepTheme),
      speakable('What is your name?'),
      h('p', { class: 'hint' }, 'Grown ups: please type your little one\'s name.'),
      input,
      h('div', { class: 'row' }, next),
    );
    setTimeout(() => input.focus(), 50);
  };

  const stepAnimal = () => {
    const next = h('button', { class: 'big-btn', disabled: !draft.animal, onclick: () => stepToys() }, 'Next ➡️');
    const grid = h('div', { class: 'pick-grid' }, animalsFor(draft.theme).map((a) => {
      const btn = h('button', {
        class: `pick ${draft.animal === a.id ? 'selected' : ''}`,
        onclick: () => {
          draft.animal = a.id;
          grid.querySelectorAll('.pick').forEach((x) => x.classList.remove('selected'));
          btn.classList.add('selected');
          next.disabled = false;
          Sfx.pop();
          Speech.say(a.name);
        },
      }, h('span', { class: 'emoji' }, a.emoji), h('span', { class: 'label' }, a.name));
      return btn;
    }));
    const title = `${draft.name}, who is your favourite animal or character?`;
    root.replaceChildren(header(stepName), speakable(title), grid, h('div', { class: 'row' }, next));
    Speech.say(title);
  };

  const stepToys = () => {
    const done = h('button', { class: 'big-btn', disabled: draft.toys.length < 3, onclick: () => create() }, 'All done ✅');
    const counter = h('p', { class: 'hint' });
    const updateCounter = () => {
      counter.textContent = `Picked ${draft.toys.length}. Pick 3 or more!`;
      done.disabled = draft.toys.length < 3;
    };
    const grid = h('div', { class: 'pick-grid' }, toysFor(draft.theme).map((t) => {
      const btn = h('button', {
        class: `pick ${draft.toys.includes(t.id) ? 'selected' : ''}`,
        onclick: () => {
          if (draft.toys.includes(t.id)) {
            draft.toys = draft.toys.filter((id) => id !== t.id);
            btn.classList.remove('selected');
          } else {
            draft.toys.push(t.id);
            btn.classList.add('selected');
            Speech.say(t.name);
          }
          Sfx.pop();
          updateCounter();
        },
      }, h('span', { class: 'emoji' }, t.emoji), h('span', { class: 'label' }, t.name));
      return btn;
    }));
    updateCounter();
    const title = 'Which toys do you love? You can win them!';
    root.replaceChildren(header(stepAnimal), speakable(title), counter, grid, h('div', { class: 'row' }, done));
    Speech.say(title);
  };

  const create = () => {
    const profile = {
      id: makeId(),
      theme: draft.theme,
      name: draft.name,
      animal: draft.animal,
      wishes: [...draft.toys],
      stars: 0,
      stickers: [],
      toys: [],
      crowns: [],
      best: {},
    };
    store.profiles.push(profile);
    store.activeId = profile.id;
    saveStore();
    show(screenHome);
    confetti();
    Sfx.fanfare();
    Speech.say(`Kia ora ${profile.name}! Let's play and learn together!`);
  };

  stepTheme();
  return root;
}

/* Screens: home, stages, worlds */

function stageCard(stage, p) {
  const games = stage.worlds.flatMap((w) => w.games.filter(isReady));
  const played = games.filter((g) => gameDone(p, g)).length;
  const crowns = stage.worlds.filter((w) => p.crowns.includes(w.id)).length;
  return h('button', {
    class: `card stage-card ${stage.color}`,
    onclick: () => {
      Sfx.pop();
      show(screenStage, stage);
      Speech.say(stage.title);
    },
  },
  h('span', { class: 'emoji' }, stage.emoji),
  h('span', { class: 'title' }, stage.title),
  h('span', { class: 'sub' }, `${played} of ${games.length} games played${crowns ? `  ·  👑 ${crowns}` : ''}`));
}

function screenHome() {
  const p = activeProfile();
  const nextToy = nextToyFor(p);
  const have = p.stars % STARS_PER_TOY;
  const toGo = STARS_PER_TOY - have;

  return h('section', { class: 'screen' },
    topbar({ extra: h('button', { class: 'round-btn', 'aria-label': 'Change player', onclick: () => show(screenProfiles) }, '👭') }),
    speakable(`Kia ora, ${p.name}!`),
    nextToy ? h('button', {
      class: 'toy-progress',
      onclick: () => Speech.say(`Get ${toGo} more stars to win a ${nextToy.name}!`),
    },
    h('span', { class: 'toy-next' }, nextToy.emoji),
    h('span', { class: 'bar' }, h('span', { class: 'bar-fill', style: `display:block;width:${(have / STARS_PER_TOY) * 100}%` })),
    h('span', { class: 'label' }, `${toGo} more ⭐`)) : null,
    h('div', { class: 'grid stage-grid' }, STAGES.map((s) => stageCard(s, p))),
  );
}

function screenStage(stage) {
  const p = activeProfile();
  return h('section', { class: 'screen' },
    topbar({ back: () => show(screenHome) }),
    speakable(stage.title),
    h('div', { class: 'grid world-grid' }, stage.worlds.map((w) => worldCard(w, p))),
  );
}

function worldCard(world, p) {
  const ready = world.games.filter(isReady);
  const body = [h('span', { class: 'icon-tile' }, world.emoji), h('span', { class: 'title' }, world.title)];

  if (!ready.length) {
    return h('button', { class: `card ${world.color} locked`, onclick: () => Speech.say(`${world.title} is coming soon!`) },
      body, h('span', { class: 'sub' }, '🔒 Coming soon'));
  }

  const done = ready.filter((g) => gameDone(p, g)).length;
  return h('button', {
    class: `card ${world.color}`,
    onclick: () => {
      Sfx.pop();
      show(screenWorld, world);
      Speech.say(world.title);
    },
  }, body, h('span', { class: 'sub' }, p.crowns.includes(world.id) ? '👑 ' : '', `${done} of ${ready.length} played`));
}

function screenWorld(world) {
  const p = activeProfile();
  return h('section', { class: 'screen' },
    topbar({ back: () => show(screenStage, world.stage) }),
    speakable(world.title),
    h('div', { class: 'grid' }, world.games.map((game, i) => {
      const color = CARD_COLORS[i % CARD_COLORS.length];
      if (!isReady(game)) {
        return h('button', { class: `card ${color} locked`, onclick: () => Speech.say(`${game.title} is coming soon!`) },
          h('span', { class: 'emoji' }, game.emoji),
          h('span', { class: 'title' }, game.title),
          h('span', { class: 'sub' }, '🔒 Coming soon'));
      }
      return h('button', {
        class: `card ${color}`,
        onclick: () => {
          Sfx.pop();
          if (game.sets) show(screenSets, world, game);
          else show(screenGame, world, game);
        },
      },
      h('span', { class: 'emoji' }, game.emoji),
      h('span', { class: 'title' }, game.title),
      game.sets
        ? h('span', { class: 'sub' }, `${game.sets.filter((s) => p.best[s.id]).length} of ${game.sets.length} sets`)
        : miniStars(p.best[game.id] ?? 0));
    })),
    world.parentNote ? h('details', { class: 'world-note' },
      h('summary', {}, '🧑‍🧑‍🧒 Note for grown ups'),
      h('p', {}, world.parentNote)) : null,
  );
}

const SET_KEYCAPS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

// Each set unlocks once the one before it has been played; grown ups can also open sets up to the one taught at school.
const setUnlocked = (p, group, i) => i === 0 || i < (p.phonicsSet ?? 1) || Boolean(p.best[group.sets[i - 1].id]);

function screenSets(world, group) {
  const p = activeProfile();
  return h('section', { class: 'screen' },
    topbar({ back: () => show(screenWorld, world) }),
    speakable(group.title),
    h('div', { class: 'grid' }, group.sets.map((set, i) => {
      const color = CARD_COLORS[i % CARD_COLORS.length];
      const body = [
        h('span', { class: 'emoji' }, SET_KEYCAPS[i] ?? '⭐'),
        h('span', { class: 'title' }, set.title),
        h('span', { class: 'set-preview letter' }, set.preview),
      ];
      if (!setUnlocked(p, group, i)) {
        return h('button', {
          class: `card ${color} locked`,
          onclick: () => Speech.say(`Play ${group.sets[i - 1].title} first to open this one!`),
        }, body, h('span', { class: 'sub' }, '🔒'));
      }
      return h('button', {
        class: `card ${color}`,
        onclick: () => {
          Sfx.pop();
          show(screenGame, world, { ...set, parent: group });
        },
      }, body, miniStars(p.best[set.id] ?? 0));
    })),
  );
}

const backFromGame = (world, game) => (game.parent ? show(screenSets, world, game.parent) : show(screenWorld, world));

/* Game runner */

// Finger tracing: completes once most of the faint guide glyph has been drawn over.
function tracePad(glyph, onDone) {
  const dpr = window.devicePixelRatio || 1;
  const wide = glyph.length > 2;
  const width = Math.max(240, Math.min(app.clientWidth - 80, wide ? 760 : 420));
  const height = wide ? Math.round(width * 0.45) : width;
  const canvas = h('canvas', { class: 'trace-canvas', width: width * dpr, height: height * dpr, style: `width:${width}px;height:${height}px` });
  const meter = h('span', { class: 'bar-fill', style: 'display:block;width:0%' });
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  let fontSize = height * 0.8;
  let targets = [];
  let hits = new Set();
  let last = null;
  let done = false;
  const font = () => `700 ${fontSize}px Andika, 'Baloo 2', sans-serif`;
  const lineWidth = () => Math.max(14, fontSize * 0.14);

  const drawText = (c, mode) => {
    c.font = font();
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    if (mode === 'fill') c.fillText(glyph, width / 2, height / 2);
    else c.strokeText(glyph, width / 2, height / 2);
  };

  const prepare = () => {
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = font();
    while (probe.measureText(glyph).width > width * 0.9 && fontSize > 20) {
      fontSize *= 0.9;
      probe.font = font();
    }
    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const m = mask.getContext('2d', { willReadFrequently: true });
    drawText(m, 'fill');
    const data = m.getImageData(0, 0, width, height).data;
    const step = Math.max(4, Math.round(fontSize / 30));
    targets = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (data[(y * width + x) * 4 + 3] > 128) targets.push([x, y]);
      }
    }
    hits = new Set();
    done = false;
    meter.style.width = '0%';
    const css = getComputedStyle(document.body);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = css.getPropertyValue('--lilac-soft').trim();
    drawText(ctx, 'fill');
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = css.getPropertyValue('--lilac').trim();
    drawText(ctx, 'stroke');
    ctx.setLineDash([]);
  };

  const mark = (x, y) => {
    const r2 = lineWidth() ** 2;
    targets.forEach(([tx, ty], i) => {
      if (!hits.has(i) && (tx - x) ** 2 + (ty - y) ** 2 <= r2) hits.add(i);
    });
  };

  const stroke = ([ax, ay], [bx, by]) => {
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--pink').trim();
    ctx.lineWidth = lineWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / (lineWidth() / 2)));
    for (let s = 0; s <= steps; s++) mark(ax + ((bx - ax) * s) / steps, ay + ((by - ay) * s) / steps);
    meter.style.width = `${Math.min(100, (hits.size / (targets.length * 0.65)) * 100)}%`;
  };

  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) * width) / r.width, ((e.clientY - r.top) * height) / r.height];
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (done) return;
    canvas.setPointerCapture(e.pointerId);
    last = point(e);
    stroke(last, last);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!last || done) return;
    const next = point(e);
    stroke(last, next);
    last = next;
  });
  const end = () => {
    last = null;
    if (!done && targets.length && hits.size / targets.length >= 0.65) {
      done = true;
      onDone();
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  (document.fonts ? document.fonts.load(font()) : Promise.resolve()).catch(() => {}).then(prepare);
  return { node: h('div', { class: 'trace-wrap' }, canvas, h('span', { class: 'bar trace-meter' }, meter)), clear: prepare };
}

// Question shape: { mode: 'choice'|'multi'|'order'|'learn'|'trace', text, say?, play?, silent?, slow?, pause?, stage?, options?, optionsClass?, after?, afterParts? }
// `play` replaces the spoken prompt; `silent` turns off all browser speech for that question.
// `slow` speaks the question more slowly; `pause` adds milliseconds before moving to the next question.
// `afterParts` replaces `after` with sayParts parts, so recorded clips can be used.
// order: options carry `key`, and `q.order` lists the keys to tap in turn. trace: `q.glyph` is traced by finger.
// Options may carry `speak`, said when a multi or order option is tapped correctly.
function screenGame(world, game) {
  const p = activeProfile();
  const questions = game.build(p);
  const root = h('section', { class: 'screen game' });
  let index = 0;
  let earned = 0;
  let possible = 0;

  const renderQuestion = () => {
    const q = questions[index];
    const mode = q.mode ?? 'choice';
    const prompt = q.play ?? (() => Speech.say(q.say, { slow: q.slow }));
    const maxStars = mode === 'learn' ? 1 : 3;
    let finished = false;
    let tries = 0;
    let stage = q.stage ?? null;
    let sequence = null;
    possible += maxStars;
    Clips.stop();

    const single = mode === 'learn' || mode === 'trace';
    const options = h('div', { class: `options ${q.optionsClass ?? (single ? 'single' : '')}` });

    const complete = (stars, lastWord) => {
      finished = true;
      earned += stars;
      options.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      root.querySelector('.star-count').textContent = p.stars + earned;
      if (mode === 'learn') {
        Sfx.pop();
      } else {
        Sfx.correct();
        floatStars(stars);
      }
      const line = mode === 'learn' || q.silent ? '' : [lastWord && `${lastWord}.`, q.after, pick(PRAISE)].filter(Boolean).join(' ');
      const spoken = line && q.afterParts ? sayParts([...q.afterParts, pick(PRAISE)], { slow: q.slow }) : Speech.say(line, { slow: q.slow });
      Promise.all([spoken, wait(mode === 'learn' ? 300 : 1100)]).then(() => wait(q.pause ?? 0)).then(() => {
        if (!root.isConnected) return;
        index += 1;
        if (index < questions.length) renderQuestion();
        else finishGame(world, game, earned, possible);
      });
    };

    if (mode === 'learn') {
      options.append(h('button', { class: 'opt opt-next', onclick: () => complete(1) }, q.completeLabel ?? 'Next ➡️'));
    } else if (mode === 'trace') {
      const pad = tracePad(q.glyph, () => complete(3));
      stage = pad.node;
      options.append(h('button', { class: 'opt opt-clear', onclick: () => pad.clear() }, '↺ Start again'));
    } else if (mode === 'order') {
      let next = 0;
      let misses = 0;
      const slots = q.order.map(() => h('span', { class: 'slot' }));
      sequence = h('div', { class: `sequence ${q.options.some((o) => o.content.classList?.contains('pic-opt')) ? 'pic-sequence' : ''}` }, slots);
      for (const o of q.options) {
        const btn = h('button', {
          class: `opt ${o.cls ?? ''}`,
          onclick: () => {
            if (finished || btn.classList.contains('placed')) return;
            if (o.key === q.order[next]) {
              btn.classList.add('placed');
              btn.disabled = true;
              slots[next].replaceChildren(o.content.cloneNode(true));
              slots[next].classList.add('filled');
              next += 1;
              Sfx.pop();
              if (next === q.order.length) complete(misses === 0 ? 3 : misses <= 2 ? 2 : 1, o.speak);
              else if (o.speak && !q.silent) Speech.say(o.speak, { slow: q.slow });
            } else {
              misses += 1;
              shake(btn);
              Sfx.wrong();
              if (o.speak && !q.silent) Speech.say(`${o.speak}? Not yet!`, { slow: q.slow });
            }
          },
        }, o.content);
        options.append(btn);
      }
    } else if (mode === 'multi') {
      let left = q.options.filter((o) => o.correct).length;
      let misses = 0;
      for (const o of q.options) {
        const btn = h('button', {
          class: `opt ${o.cls ?? ''}`,
          onclick: () => {
            if (finished || btn.classList.contains('popped')) return;
            if (o.correct) {
              btn.classList.add('popped');
              Sfx.pop();
              left -= 1;
              if (!left) complete(misses === 0 ? 3 : misses <= 2 ? 2 : 1, o.speak);
              else if (o.speak && !q.silent) Speech.say(o.speak);
            } else {
              misses += 1;
              shake(btn);
              Sfx.wrong();
            }
          },
        }, o.content);
        options.append(btn);
      }
    } else {
      for (const o of q.options) {
        const btn = h('button', {
          class: `opt ${o.cls ?? ''}`,
          onclick: () => {
            if (finished) return;
            if (o.correct) {
              btn.classList.add('correct');
              complete(tries === 0 ? 3 : tries === 1 ? 2 : 1);
            } else {
              tries += 1;
              btn.disabled = true;
              btn.classList.add('wrong');
              Sfx.wrong();
              if (!q.silent) Speech.say(pick(TRY_AGAIN));
            }
          },
        }, o.content);
        options.append(btn);
      }
    }

    root.replaceChildren(...[
      topbar({ back: () => backFromGame(world, game) }),
      h('div', { class: 'dots' }, questions.map((_, i) => h('span', { class: `dot ${i < index ? 'done' : i === index ? 'now' : ''}` }))),
      h('div', { class: 'prompt' },
        h('button', { class: 'speak-btn', 'aria-label': 'Hear again', onclick: prompt }, '🔊'),
        h('span', {}, q.text)),
      stage ? h('div', { class: `stage ${mode === 'trace' ? 'stage-trace' : ''}` }, stage) : null,
      sequence,
      options,
    ].filter(Boolean));
    root.querySelector('.star-count').textContent = p.stars + earned;
    prompt();
  };

  renderQuestion();
  return root;
}

function finishGame(world, game, earned, possible) {
  const p = activeProfile();
  const gameStars = Math.max(1, Math.round((earned / possible) * 3));
  const setIndex = game.parent ? game.parent.sets.findIndex((s) => s.id === game.id) : -1;
  const nextSet = setIndex >= 0 && !p.best[game.id] ? game.parent.sets[setIndex + 1] : null;
  p.stars += earned;
  p.best[game.id] = Math.max(p.best[game.id] ?? 0, gameStars);
  const result = {
    gameStars,
    earned,
    sticker: grantSticker(p),
    toys: grantToys(p),
    crown: grantCrown(p, world),
    unlocked: nextSet ?? null,
  };
  saveStore();
  show(screenResults, world, game, result);
}

function screenResults(world, game, r) {
  const p = activeProfile();
  const lines = [`Ka pai, ${p.name}!`, `You got ${r.gameStars} ${r.gameStars === 1 ? 'star' : 'stars'}.`];
  const rewards = [];
  const rewardCard = (emoji, label) => h('div', { class: 'reward' }, h('span', { class: 'emoji' }, emoji), h('span', { class: 'label' }, label));

  if (r.sticker) {
    rewards.push(rewardCard(r.sticker, 'New sticker!'));
    lines.push('You won a new sticker for your sticker book!');
  }
  for (const toy of r.toys) {
    rewards.push(rewardCard(toy.emoji, `New toy: ${toy.name}!`));
    lines.push(`Wow! You won a ${toy.name} for your toy shelf!`);
  }
  if (r.crown) {
    rewards.push(rewardCard('👑', 'World crown!'));
    lines.push(`You earned the crown for ${world.title}!`);
  }
  if (r.unlocked) {
    rewards.push(rewardCard('🔓', `${r.unlocked.title} is open!`));
    lines.push(`You opened ${r.unlocked.title}!`);
  }

  setTimeout(() => {
    confetti();
    Sfx.fanfare();
    Speech.say(lines.join(' '));
  }, 150);

  return h('section', { class: 'screen results' },
    h('div', { class: 'result-stars' },
      [1, 2, 3].map((i) => h('span', { class: i <= r.gameStars ? 'on' : 'off', style: `animation-delay:${i * 0.2}s` }, '⭐'))),
    h('h1', { class: 'big-title' }, `Ka pai, ${p.name}!`),
    h('p', { class: 'earned' }, `+${r.earned} ⭐`),
    rewards.length ? h('div', { class: 'rewards' }, rewards) : null,
    h('div', { class: 'row' },
      h('button', { class: 'big-btn alt', onclick: () => show(screenGame, world, game) }, '🔁 Again'),
      h('button', { class: 'big-btn', onclick: () => backFromGame(world, game) }, 'Done ✅')),
  );
}

/* Screen: profile, toys and stickers */

function screenProfile() {
  const p = activeProfile();
  const crowns = allWorlds().filter((w) => p.crowns.includes(w.id));

  return h('section', { class: 'screen' },
    topbar({ back: () => show(screenHome) }),
    h('div', { class: 'hero' },
      h('div', { class: 'hero-avatar' }, animalOf(p).emoji),
      h('h1', { class: 'big-title' }, p.name),
      h('div', { class: 'pill' }, `⭐ ${p.stars} stars`)),
    crowns.length ? h('div', { class: 'crowns' }, crowns.map((w) => h('span', { class: 'crown-chip' }, `👑 ${w.title}`))) : null,
    speakable('My Toy Shelf', 'h2', 'section-title'),
    h('div', { class: 'shelf' }, toyQueue(p).map((t) => {
      const owned = p.toys.includes(t.id);
      return h('button', {
        class: `shelf-item ${owned ? '' : 'mystery'}`,
        'aria-label': owned ? t.name : 'Mystery toy',
        onclick: (e) => {
          shake(e.currentTarget);
          Speech.say(owned ? `My ${t.name}!` : 'Keep collecting stars to win this toy!');
        },
      }, h('span', {}, t.emoji));
    })),
    speakable('My Sticker Book', 'h2', 'section-title'),
    h('div', { class: 'sticker-book' }, STICKERS.map((s, i) => {
      const owned = p.stickers.includes(s);
      return h('button', {
        class: `sticker ${owned ? 'owned' : 'mystery'}`,
        style: `--tilt:${(i % 5) * 3 - 6}deg`,
        onclick: (e) => {
          shake(e.currentTarget);
          if (owned) Sfx.pop();
          else Speech.say('Finish a game to win a sticker!');
        },
      }, h('span', {}, s));
    })),
    h('div', { class: 'row' }, holdButton('🗑️ Grown ups: hold to delete this player', () => {
      if (removePlayer(p)) show(store.profiles.length ? screenProfiles : screenNewProfile);
    })),
  );
}

// Asks for confirmation first; returns true when the player was deleted.
function removePlayer(p) {
  if (!window.confirm(`Delete ${p.name}? All stars, stickers and toys will be lost. This cannot be undone.`)) return false;
  store.profiles = store.profiles.filter((x) => x.id !== p.id);
  if (store.activeId === p.id) store.activeId = null;
  saveStore();
  return true;
}

window.addEventListener('DOMContentLoaded', () => {
  Speech.init();
  show(store.profiles.length ? screenProfiles : screenNewProfile);
  // Offline play needs a secure origin (https or localhost); the Android app already has everything built in.
  if (!window.AndroidTTS && 'serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
});
