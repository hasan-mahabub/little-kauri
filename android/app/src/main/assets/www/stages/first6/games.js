'use strict';

// Letters and order from the Ministry of Education "Sounds and letters cards, Set 1".
// `clip` is the Ministry recording under sounds/ (see sounds/CREDITS.txt).
const SET_1 = [
  { letter: 'm', ipa: '/m/', clip: 'set1/m_mouse', example: ['mouse', '🐭'], words: [['mouse', '🐭'], ['moon', '🌙'], ['monkey', '🐒'], ['milk', '🥛']] },
  { letter: 'a', ipa: '/a/', clip: 'set1/a_apple', example: ['apple', '🍎'], words: [['apple', '🍎'], ['ant', '🐜'], ['alligator', '🐊']] },
  { letter: 'd', ipa: '/d/', clip: 'set1/d_dog', example: ['dog', '🐶'], words: [['dog', '🐶'], ['duck', '🦆'], ['drum', '🥁'], ['dinosaur', '🦕']] },
  { letter: 'p', ipa: '/p/', clip: 'set1/p_pot', example: ['pot', '🍲'], words: [['pig', '🐷'], ['pizza', '🍕'], ['penguin', '🐧'], ['panda', '🐼']] },
  { letter: 'o', ipa: '/o/', clip: 'set1/o_octopus', example: ['octopus', '🐙'], words: [['octopus', '🐙'], ['otter', '🦦'], ['orange', '🍊']] },
  { letter: 't', ipa: '/t/', clip: 'set1/t_tent', example: ['tent', '⛺'], words: [['tiger', '🐯'], ['tomato', '🍅'], ['turtle', '🐢'], ['tent', '⛺']] },
  { letter: 'n', ipa: '/n/', clip: 'set1/n_nest', example: ['nest', '🪺'], words: [['nose', '👃'], ['nut', '🥜'], ['net', '🥅']] },
  { letter: 'i', ipa: '/i/', clip: 'set1/i_igloo', example: ['igloo', '🏠'], words: [['insect', '🐞'], ['iguana', '🦎']] },
  { letter: 's', ipa: '/s/', clip: 'set1/s_sun', example: ['sun', '☀️'], words: [['sun', '☀️'], ['snake', '🐍'], ['sock', '🧦'], ['star', '⭐']] },
];

const phonicsSet = (n, pairs) => pairs.map(([letter, clip]) => ({ letter, clip: `set${n}/${clip}` }));

// All 7 Ministry "Sounds and letters cards" sets, in teaching order.
const PHONICS_SETS = [
  SET_1,
  phonicsSet(2, [['l', 'l_lion'], ['e', 'e_egg'], ['c', 'c_cat'], ['f', 'f_fish'], ['u', 'u_umbrella'], ['b', 'b_bird'], ['g', 'g_goat'], ['r', 'r_rainbow'], ['h', 'h_house']]),
  phonicsSet(3, [['k', 'k_key'], ['j', 'j_jelly'], ['v', 'v_van'], ['w', 'w_watch'], ['y', 'y_yoyo'], ['z', 'z_zip'], ['ck', 'ck_lock'], ['th', 'th_thumb'], ['ch', 'ch_chick'], ['sh', 'sh_sheep'], ['ng', 'ng_wing']]),
  phonicsSet(4, [['ff', 'ff_cliff'], ['ll', 'll_gull'], ['ss', 'ss_kiss'], ['zz', 'zz_buzz'], ['x', 'x_box'], ['tch', 'tch_hatch'], ['qu', 'qu_queen'], ['wh', 'wh_whistle'], ['dge', 'dge_badge'], ['cr', 'cr_crab'], ['st', 'st_rest']]),
  phonicsSet(5, [['a_e', 'a_e_wave'], ['e_e', 'e_e_pete'], ['i_e', 'i_e_bike'], ['o_e', 'o_e_rope'], ['u_e', 'u_e_tune'], ['ee', 'ee_sleep'], ['c', 'soft_c_dice'], ['oo', 'oo_moon'], ['oo', 'oo_book'], ['all', 'all_ball'], ['ell', 'ell_bell']]),
  phonicsSet(6, [['ing', 'ing_jumping'], ['ed', 'ed_smiled_walked_melted'], ['s', 's_dogs_runs'], ['es', 'es_brushes']]),
  phonicsSet(7, [['ai', 'ai_rain'], ['ay', 'ay_play'], ['ea', 'ea_team'], ['igh', 'igh_light'], ['ie', 'ie_pie'], ['oa', 'oa_boat'], ['ow', 'ow_snow'], ['oe', 'oe_toe'], ['ew', 'ew_screw'], ['ue', 'ue_blue']]),
];

const MEET_EXAMPLES = {
  b: ['bird', '🐦'],
  c: ['cat', '🐱'],
  e: ['egg', '🥚'],
  f: ['fish', '🐟'],
  g: ['goat', '🐐'],
  h: ['house', '🏠'],
  j: ['jelly', '🫙'],
  k: ['key', '🔑'],
  l: ['lion', '🦁'],
  q: ['queen', '👑'],
  r: ['rainbow', '🌈'],
  u: ['umbrella', '☂️'],
  v: ['van', '🚐'],
  w: ['watch', '⌚'],
  x: ['box', '📦'],
  y: ['yoyo', '🪀'],
  z: ['zip', '🤐'],
};

const phonicsCards = PHONICS_SETS.flat();
const alphabetSounds = new Map();
for (const item of phonicsCards) {
  if (item.letter.length === 1 && !alphabetSounds.has(item.letter)) alphabetSounds.set(item.letter, item);
}
alphabetSounds.set('q', { ...phonicsCards.find((item) => item.letter === 'qu'), letter: 'q' });

const MEET_LETTERS = [...'abcdefghijklmnopqrstuvwxyz'].map((letter) => ({
  ...alphabetSounds.get(letter),
  example: alphabetSounds.get(letter).example || MEET_EXAMPLES[letter],
}));

const preloadClips = (items) => Clips.preload(items.map((x) => x.clip));

// Phonetic sounds use the Ministry recording only; unavailable audio stays silent.
function playSound(item) {
  return Clips.play(item.clip).catch(() => {});
}

// showIpa is off in quiz games so the button does not give away the letter.
const soundButton = (item, showIpa = true) => h('button', {
  class: 'sound-btn',
  'aria-label': 'Play the letter sound',
  onclick: (e) => {
    e.stopPropagation();
    playSound(item);
  },
}, h('span', { class: 'sound-icon' }, '▶️'), h('span', { class: 'sound-label' }, showIpa && item.ipa ? item.ipa : 'Sound'));

const TE_REO_NUMBERS = [
  'kore', 'tahi', 'rua', 'toru', 'whā', 'rima', 'ono', 'whitu', 'waru', 'iwa', 'tekau',
  'tekau mā tahi', 'tekau mā rua', 'tekau mā toru', 'tekau mā whā', 'tekau mā rima',
  'tekau mā ono', 'tekau mā whitu', 'tekau mā waru', 'tekau mā iwa', 'rua tekau',
];

const COUNT_THINGS = [
  ['🍓', 'strawberries'], ['🐞', 'ladybirds'], ['🦋', 'butterflies'], ['🍎', 'apples'], ['⭐', 'stars'],
  ['🐟', 'fish'], ['🌸', 'flowers'], ['🧁', 'cupcakes'], ['🐥', 'chicks'], ['🎈', 'balloons'],
];

// Dot positions on a 3 by 3 grid, like a real dice.
const DICE_PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8] };

const letterNode = (letter) => h('span', { class: 'letter' }, letter);

// Distractors never share the answer's spelling (Set 5 has two "oo" sounds).
function letterOptions(item, pool = SET_1) {
  const others = shuffle(pool.filter((x) => x.letter !== item.letter)).slice(0, 2);
  return shuffle([item, ...others]).map((x) => ({ content: letterNode(x.letter), correct: x === item }));
}

function numberOptions(answer, min, max) {
  const near = [];
  for (let n = Math.max(min, answer - 3); n <= Math.min(max, answer + 3); n++) {
    if (n !== answer) near.push(n);
  }
  return shuffle([answer, ...shuffle(near).slice(0, 2)]).map((n) => ({
    content: h('span', { class: 'num-wrap' }, h('span', {}, n), h('small', { class: 'reo' }, TE_REO_NUMBERS[n])),
    correct: n === answer,
  }));
}

const groupNode = (emoji, n, cls = 'items small') =>
  h('span', { class: cls }, Array.from({ length: n }, () => h('span', { class: 'item' }, emoji)));

/* Letter Sounds Fairyland */

function buildMeetLetters() {
  const letters = shuffle(MEET_LETTERS).slice(0, 10);
  preloadClips(letters);
  return letters.map((item) => {
    const [word, emoji] = item.example;
    return {
      mode: 'learn',
      text: 'Meet a letter!',
      play: () => playSound(item),
      stage: h('div', { class: 'learn-card' },
        letterNode(item.letter),
        soundButton(item),
        h('button', { class: 'learn-pics', 'aria-label': 'Hear the word', onclick: () => Speech.say(word) },
          h('span', { class: 'learn-pic' }, h('span', { class: 'pic' }, emoji), h('span', {}, word)))),
    };
  });
}

function buildListenAndTap(items) {
  preloadClips(items);
  return shuffle(items).slice(0, 5).map((item) => ({
    text: 'Which letter makes this sound?',
    play: () => playSound(item),
    silent: true,
    stage: h('div', { class: 'sound-row' }, soundButton(item, false)),
    options: letterOptions(item, items),
  }));
}

function buildPictureMatch() {
  preloadClips(SET_1);
  return shuffle(SET_1).slice(0, 5).map((item) => {
    const [word, emoji] = item.example;
    return {
      text: 'What does it start with?',
      say: `Look! ${word}. Which letter does ${word} start with?`,
      stage: h('div', { class: 'sound-row' },
        h('button', { class: 'big-pic', 'aria-label': word, onclick: () => Speech.say(word) }, emoji),
        soundButton(item, false)),
      options: letterOptions(item),
      after: `${word} starts with this letter!`,
    };
  });
}

function buildBalloonPop() {
  preloadClips(SET_1);
  return shuffle(SET_1).slice(0, 5).map((item) => {
    const [word, emoji] = item.example;
    const others = shuffle(SET_1.filter((x) => x !== item)).slice(0, 6).map((x) => x.letter);
    const letters = shuffle([item.letter, item.letter, item.letter, ...others]);
    return {
      mode: 'multi',
      text: 'Pop the matching balloons!',
      say: 'Pop all the balloons with the matching letter!',
      stage: h('div', { class: 'target' },
        h('span', { class: 'target-label' }, 'Find this letter'),
        letterNode(item.letter),
        h('div', { class: 'target-sound' },
          h('span', { class: 'learn-pic' }, h('span', { class: 'pic' }, emoji), h('span', {}, word)),
          soundButton(item))),
      optionsClass: 'balloons',
      options: letters.map((l) => ({ content: letterNode(l), correct: l === item.letter, cls: `balloon b${randInt(1, 5)}` })),
      after: 'You found them all!',
    };
  });
}

/* Maths Magic Meadow: Number */

function buildCountWithMe() {
  const sizes = shuffle(Array.from({ length: 21 }, (_, n) => n)).slice(0, 5).sort((a, b) => a - b);
  return sizes.map((n) => {
    const [emoji, plural] = pick(COUNT_THINGS);
    let counted = 0;
    const items = h('div', { class: 'items' }, Array.from({ length: n }, () => {
      const item = h('button', {
        class: 'item',
        'aria-label': 'Count me',
        onclick: () => {
          if (item.classList.contains('counted')) return;
          counted += 1;
          item.dataset.n = counted;
          item.classList.add('counted');
          Speech.say(String(counted));
        },
      }, emoji);
      return item;
    }));
    return {
      text: `How many ${plural}?`,
      say: `How many ${plural}? Tap each one to count.`,
      stage: items,
      options: numberOptions(n, 0, 20),
      after: `${n}! In te reo Māori, ${n} is ${TE_REO_NUMBERS[n]}.`,
    };
  });
}

function buildDiceDots() {
  return shuffle([1, 2, 3, 4, 5]).map((n) => ({
    text: 'How many dots?',
    say: 'How many dots? Can you see it without counting?',
    stage: h('div', { class: 'dice' }, Array.from({ length: 9 }, (_, i) => h('span', { class: DICE_PIPS[n].includes(i) ? 'pip' : '' }))),
    options: numberOptions(n, 1, 5),
    after: `${n}!`,
  }));
}

function buildWhatComesNext() {
  return shuffle(Array.from({ length: 18 }, (_, n) => n)).slice(0, 5).map((start) => {
    const seq = [start, start + 1, start + 2];
    const answer = start + 3;
    return {
      text: 'What comes next?',
      say: `${seq.join(', ')}. What number comes next?`,
      stage: h('div', { class: 'sum' }, seq.map((n) => h('span', { class: 'num-tile' }, n)), h('span', { class: 'num-tile q' }, '?')),
      options: numberOptions(answer, 0, 20),
      after: `${[...seq, answer].join(', ')}!`,
    };
  });
}

function buildCountBackwards() {
  return Array.from({ length: 5 }, () => {
    const start = randInt(3, 20);
    const sequence = Array.from({ length: 4 }, (_, i) => String(start - i));
    return {
      mode: 'order',
      text: 'Count backwards',
      say: `Count backwards from ${start}. Tap the numbers in order.`,
      order: sequence,
      options: shuffle(sequence.map((n) => ({ content: h('span', { class: 'num-tile' }, n), key: n }))),
      optionsClass: 'four',
      after: `${sequence.join(', ')}!`,
    };
  });
}

function buildNumberOrder() {
  return Array.from({ length: 5 }, () => {
    const numbers = shuffle(Array.from({ length: 21 }, (_, n) => n)).slice(0, 3);
    const ordered = [...numbers].sort((a, b) => a - b).map(String);
    return {
      mode: 'order',
      text: 'Smallest to biggest',
      say: 'Tap the numbers from smallest to biggest.',
      order: ordered,
      options: shuffle(numbers.map((n) => ({ content: h('span', { class: 'num-tile' }, n), key: String(n) }))),
      optionsClass: 'three',
      after: `${ordered.join(', ')}!`,
    };
  });
}

function buildAppleAdding() {
  const pairs = [];
  for (let a = 1; a <= 4; a++) {
    for (let b = 1; a + b <= 5; b++) pairs.push([a, b]);
  }
  return shuffle(pairs).slice(0, 5).map(([a, b]) => ({
    text: 'How many altogether?',
    say: `${a} ${a === 1 ? 'apple' : 'apples'} and ${b} more. How many apples altogether?`,
    stage: h('div', { class: 'sum' },
      groupNode('🍎', a),
      h('span', { class: 'op' }, '+'),
      groupNode('🍎', b),
      h('div', { class: 'equation' }, `${a} + ${b} = ?`)),
    options: numberOptions(a + b, 1, 5),
    after: `${a} and ${b} make ${a + b}!`,
  }));
}

function buildAppleSubtracting() {
  return Array.from({ length: 5 }, () => {
    const start = randInt(1, 5);
    const take = randInt(1, start);
    const answer = start - take;
    return {
      text: 'How many apples are left?',
      say: `${start} apples. Take away ${take}. How many are left?`,
      stage: h('div', { class: 'sum' },
        groupNode('🍎', start),
        h('span', { class: 'op' }, '−'),
        groupNode('🍎', take),
        h('div', { class: 'equation' }, `${start} − ${take} = ?`)),
      options: numberOptions(answer, 0, 5),
      after: `${start} take away ${take} leaves ${answer}!`,
    };
  });
}

function buildWhichHasMore() {
  return Array.from({ length: 5 }, () => {
    const a = randInt(0, 20);
    let b;
    do {
      b = randInt(0, 20);
    } while (Math.abs(a - b) < 2);
    const [emoji, plural] = pick(COUNT_THINGS);
    const more = Math.max(a, b);
    return {
      text: 'Which group has more?',
      say: `Which group has more ${plural}?`,
      optionsClass: 'two',
      options: [a, b].map((n) => ({ content: groupNode(emoji, n), correct: n === more, cls: 'opt-group' })),
      after: `That group has ${more}. It has more!`,
    };
  });
}

/* Stage 1 follows the Ministry's "First 6 months at school" guide; each world matches a section of it.
   Builders for the other worlds live in worlds.js. Game ids are saved in progress, so never rename them. */

registerStage({
  id: 'first6',
  title: 'First 6 months at school',
  emoji: '🎒',
  color: 'c-pink',
  worlds: [
  {
    id: 'school',
    title: 'School Ready Castle',
    emoji: '🏰',
    color: 'c-lilac',
    games: [
      { id: 'school.routine', title: 'My Day in Order', emoji: '🌅', build: buildRoutines },
      { id: 'school.bag', title: 'Pack My Bag', emoji: '🎒', build: buildPackMyBag },
      { id: 'school.what', title: 'What Should I Do?', emoji: '🙋', build: buildWhatShouldIDo },
      { id: 'school.reo', title: 'Te Reo Words', emoji: '👋', build: buildTeReoWords },
      { id: 'school.reoquiz', title: 'Te Reo Game', emoji: '🌿', build: buildTeReoGame },
    ],
  },
  {
    id: 'talk',
    title: 'Talk and Listen Garden',
    emoji: '🌷',
    color: 'c-mint',
    games: [
      { id: 'talk.wh', title: 'Who, What, Where?', emoji: '🔎', build: buildWhoWhatWhere },
      { id: 'talk.because', title: 'Because...', emoji: '💭', build: buildBecause },
      { id: 'talk.follow', title: 'Follow Me', emoji: '👂', build: buildFollowMe },
      { id: 'talk.feelings', title: 'How Do I Feel?', emoji: '😊', build: buildFeelings },
      { id: 'talk.speak', title: 'Talk Together', emoji: '💬', build: buildTalkTogether },
    ],
    parentNote: 'Invite your child to answer aloud. Give them time to think, listen to their ideas, and ask a gentle follow up question. There are no wrong answers in Talk Together.',
  },
  {
    id: 'letters',
    title: 'Letter Sounds Fairyland',
    emoji: '🧚',
    color: 'c-pink',
    games: [
      { id: 'letters.meet', title: 'Meet the Letters', emoji: '👋', build: buildMeetLetters },
      {
        id: 'letters.listen',
        title: 'Listen and Tap',
        emoji: '👂',
        sets: PHONICS_SETS.map((items, i) => ({
          id: `letters.listen.set${i + 1}`,
          title: `Set ${i + 1}`,
          emoji: '👂',
          preview: [...new Set(items.map((x) => x.letter))].join(' '),
          build: () => buildListenAndTap(items),
        })),
      },
      { id: 'letters.picture', title: 'Picture Match', emoji: '🖼️', build: buildPictureMatch },
      { id: 'letters.pop', title: 'Balloon Pop', emoji: '🎈', build: buildBalloonPop },
      { id: 'letters.trace', title: 'Trace a Letter', emoji: '✍️', build: () => buildTraceLetters(5) },
    ],
  },
  {
    id: 'reading',
    title: 'Story Book Nook',
    emoji: '📚',
    color: 'c-sky',
    games: [
      { id: 'reading.blend', title: 'Sound It Out', emoji: '🧩', build: buildSoundItOut },
      { id: 'reading.sight', title: 'Sight Words', emoji: '👀', build: buildSightWords },
      { id: 'reading.story', title: 'Story Time', emoji: '📖', build: buildStoryTime },
    ],
  },
  {
    id: 'writing',
    title: 'Writing Studio',
    emoji: '✏️',
    color: 'c-peach',
    games: [
      { id: 'writing.letters', title: 'Letter Tracing', emoji: '🔤', build: () => buildTraceLetters(SET_1.length) },
      { id: 'writing.numbers', title: 'Number Tracing', emoji: '🔢', build: buildTraceNumbers },
      { id: 'writing.name', title: 'Write My Name', emoji: '📛', build: buildTraceName },
      { id: 'writing.words', title: 'Word Builder', emoji: '🧱', build: buildWordBuilder },
    ],
  },
  {
    id: 'maths',
    title: 'Maths Magic Meadow',
    emoji: '🌈',
    color: 'c-sun',
    games: [
      { id: 'maths.count', title: 'Count With Me', emoji: '🍓', build: buildCountWithMe },
      { id: 'maths.dice', title: 'Dice Dots', emoji: '🎲', build: buildDiceDots },
      { id: 'maths.next', title: 'What Comes Next?', emoji: '🔢', build: buildWhatComesNext },
      { id: 'maths.backwards', title: 'Count Backwards', emoji: '🔙', build: buildCountBackwards },
      { id: 'maths.order', title: 'Number Parade', emoji: '🔢', build: buildNumberOrder },
      { id: 'maths.add', title: 'Apple Adding', emoji: '🍎', build: buildAppleAdding },
      { id: 'maths.subtract', title: 'Apple Take Away', emoji: '🍏', build: buildAppleSubtracting },
      { id: 'maths.more', title: 'Which Has More?', emoji: '⚖️', build: buildWhichHasMore },
      { id: 'maths.sort', title: 'Shape Sort', emoji: '🟦', build: buildShapeSorting },
      { id: 'maths.patterns', title: 'Pattern Party', emoji: '🔴', build: buildPatterns },
      { id: 'maths.measure', title: 'Tall and Short', emoji: '📏', build: buildMeasuring },
      { id: 'maths.shapes', title: 'Shape Hunt', emoji: '🔺', build: buildShapes },
    ],
    parentNote: 'The Ministry describes recognising, saying, writing, comparing, and ordering numbers to 20, counting forwards and backwards, and addition and subtraction facts to 5. Little Kauri now includes games for these number ideas.',
  },
  ],
});
