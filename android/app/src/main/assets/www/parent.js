'use strict';

/* Parent Corner: progress, letter set taught at school, reset and remove players. */

// Opens only after a continuous press, so little fingers do not wander in by accident.
function holdButton(label, onDone, ms = 3000) {
  let timer = null;
  const btn = h('button', { class: 'hold-btn', style: `--hold:${ms}ms` },
    h('span', { class: 'hold-fill' }),
    h('span', { class: 'hold-label' }, label));
  const cancel = () => {
    clearTimeout(timer);
    btn.classList.remove('holding');
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    timer = setTimeout(() => {
      cancel();
      onDone();
    }, ms);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
  return btn;
}

function worldProgress(p, world) {
  const games = world.games.filter(isReady);
  const rows = games.flatMap((g) => (g.sets
    ? g.sets.map((s) => h('li', {}, h('span', {}, `${g.title}: ${s.title}`), miniStars(p.best[s.id] ?? 0)))
    : [h('li', {}, h('span', {}, g.title), miniStars(p.best[g.id] ?? 0))]));
  return h('details', { class: 'world-progress' },
    h('summary', {}, `${world.emoji} ${world.title}: ${games.filter((g) => gameDone(p, g)).length} of ${games.length} played${p.crowns.includes(world.id) ? ' 👑' : ''}`),
    h('ul', {}, rows));
}

function playerPanel(p, refresh) {
  const current = p.phonicsSet ?? 1;
  return h('div', { class: 'parent-panel' },
    h('div', { class: 'parent-head' },
      h('span', { class: 'parent-avatar' }, animalOf(p).emoji),
      h('div', {},
        h('h2', {}, p.name),
        h('p', {}, `⭐ ${p.stars} stars  ·  🌈 ${p.stickers.length} of ${STICKERS.length} stickers  ·  🧸 ${p.toys.length} toys`))),
    STAGES.flatMap((s) => [h('h3', {}, `${s.emoji} ${s.title}`), ...s.worlds.map((w) => worldProgress(p, w))]),
    h('h3', {}, 'Colour theme'),
    h('div', { class: 'set-picker' }, THEMES.map((t) => h('button', {
      class: `set-btn ${(p.theme ?? 'girl') === t.id ? 'selected' : ''}`,
      onclick: () => {
        p.theme = t.id;
        saveStore();
        refresh();
      },
    }, `${t.emoji} ${t.label}`))),
    h('h3', {}, 'Letter set taught at school'),
    h('p', { class: 'parent-note' }, 'Listen and Tap opens every set up to this one. Later sets still unlock one by one as your child plays.'),
    h('div', { class: 'set-picker' }, PHONICS_SETS.map((_, i) => h('button', {
      class: `set-btn ${current === i + 1 ? 'selected' : ''}`,
      onclick: () => {
        p.phonicsSet = i + 1;
        saveStore();
        refresh();
      },
    }, `Set ${i + 1}`))),
    h('div', { class: 'row parent-actions' },
      h('button', {
        class: 'small-btn',
        onclick: () => {
          if (!window.confirm(`Reset all stars, stickers, toys and crowns for ${p.name}?`)) return;
          Object.assign(p, { stars: 0, stickers: [], toys: [], crowns: [], best: {} });
          saveStore();
          refresh();
        },
      }, '↺ Reset progress'),
      h('button', {
        class: 'small-btn danger',
        onclick: () => {
          if (removePlayer(p)) refresh();
        },
      }, '🗑️ Delete player')),
  );
}

function voicePanel(refresh) {
  if (!Speech.ok) {
    return h('div', { class: 'parent-panel' }, h('h3', {}, '🗣️ Voice'), h('p', { class: 'parent-note' }, 'This browser has no speech voices.'));
  }
  const voices = Speech.englishVoices();
  const current = Speech.voice;
  const label = (v) => `${v.name} (${v.lang})${Speech.isPreferred(v) ? ' ⭐ app default' : ''}${Speech.quality(v) >= 400 ? ' ✨ higher quality' : ''}${v.localService ? '' : ' ☁️ needs internet'}`;

  const select = h('select', {
    class: 'parent-select',
    'aria-label': 'Voice',
    onchange: (e) => {
      Speech.save({ voiceURI: e.target.value });
      Speech.say('Kia ora! This is my voice.');
      refresh();
    },
  },
  h('option', { value: '', selected: !Speech.settings.voiceURI }, 'Automatic: downloaded Google UK Female when available'),
  voices.map((v) => h('option', { value: v.voiceURI, selected: v.voiceURI === Speech.settings.voiceURI }, label(v))));

  const slider = (name, key, min, max) => {
    const value = h('span', { class: 'slider-value' }, Speech.settings[key].toFixed(2));
    const input = h('input', {
      type: 'range', min, max, step: '0.05', value: Speech.settings[key], 'aria-label': name,
      oninput: (e) => { value.textContent = Number(e.target.value).toFixed(2); },
      onchange: (e) => {
        Speech.save({ [key]: Number(e.target.value) });
        Speech.say('Ka pai! Well done!');
      },
    });
    return h('label', { class: 'slider-row' }, h('span', {}, name), input, value);
  };

  return h('div', { class: 'parent-panel' },
    h('h3', {}, '🗣️ Voice on this device'),
    h('p', { class: 'parent-note' }, current
      ? `Now using: ${label(current)}. Automatic chooses downloaded Google UK English Female when available; otherwise it prefers another downloaded English voice.`
      : 'No downloaded English voice is available. Install voice data in device settings or choose another listed voice.'),
    select,
    slider('Speed', 'rate', '0.5', '1.3'),
    slider('Pitch', 'pitch', '0.6', '1.6'),
    h('div', { class: 'row parent-actions' },
      h('button', { class: 'small-btn', onclick: () => Speech.say('Kia ora! Let\'s play and learn together. Ka pai!') }, '▶️ Test voice'),
      h('button', {
        class: 'small-btn',
        onclick: () => {
          Speech.save({ ...VOICE_DEFAULTS });
          refresh();
        },
      }, '↺ Default voice'),
      window.AndroidTTS ? h('button', {
        class: 'small-btn',
        onclick: () => window.AndroidTTS.installVoiceData(),
      }, '⬇️ Install voice data') : null,
      window.AndroidTTS ? h('button', {
        class: 'small-btn',
        onclick: () => window.AndroidTTS.openSettings(),
      }, '⚙️ Speech settings') : null),
    h('p', { class: 'parent-note' }, 'Only voices that work offline are listed. On Android, install Google speech voice data, then choose Google UK English Female if it appears. '
      + 'On iPad: Settings, Accessibility, Spoken Content, Voices. On Android: Text to speech settings, install voice data. '
      + 'Voice data availability depends on your device and speech engine. Downloaded voices can work offline.'));
}

function screenParent() {
  const root = h('section', { class: 'screen parent' });
  const render = () => root.replaceChildren(...[
    h('header', { class: 'topbar' },
      h('button', { class: 'round-btn', 'aria-label': 'Back', onclick: () => show(store.profiles.length ? screenProfiles : screenNewProfile) }, '⬅️')),
    h('h1', { class: 'big-title' }, 'Parent Corner'),
    h('div', { class: 'parent-panel parent-tip' },
      h('p', {}, 'The Ministry of Education suggests practising sounds and letters for up to 10 minutes a day.'),
      h('p', {}, 'Sit with your child, talk about the pictures, and praise effort more than right answers.')),
    voicePanel(render),
    store.profiles.length ? store.profiles.map((p) => playerPanel(p, render)) : h('p', { class: 'hint' }, 'No players yet.'),
    h('div', { class: 'parent-panel' },
      h('h3', {}, 'About Little Kauri'),
      h('p', { class: 'parent-note' }, 'Little Kauri was built for fun by Hasan for his daughter Manha, '
        + 'to help her play and learn as she gets ready for school.'),
      h('p', { class: 'parent-note' }, 'Stage 1 follows the Ministry of Education guide "First 6 months at school". '
        + 'Letter sounds are the Ministry\'s "Sounds and letters cards", Sets 1 to 7 (Crown copyright, CC BY NC 4.0). '
        + 'Progress is saved on this device only.'),
      h('p', { class: 'parent-note app-meta' }, `Version ${APP_VERSION}  ·  Developed in ${APP_YEAR}  ·  © ${APP_YEAR} Hasan. All rights reserved.`)),
    h('a', { class: 'small-btn privacy-link', href: 'privacy.html' }, 'Privacy Policy'),
  ].flat());
  // Some browsers list their voices a moment after the page loads.
  if (Speech.ok && !Speech.voices.length) speechSynthesis.addEventListener('voiceschanged', () => root.isConnected && render(), { once: true });
  render();
  return root;
}
