'use strict';

/* Builders for School Ready Castle, Talk and Listen Garden, Story Book Nook, Writing Studio and the extra maths games.
   Loaded before games.js; shared helpers such as SET_1, letterNode and playSound are only used when a game starts. */

const picOption = (emoji, label, extra = {}) => ({
  content: h('span', { class: 'pic-opt' },
    h('span', { class: 'pic-emoji' }, emoji),
    label ? h('span', { class: 'pic-label' }, label) : null),
  label,
  ...extra,
});

// Children cannot read the labels yet, so choices are read aloud in the order they appear.
const sayChoices = (labels) => (labels.length > 1
  ? `${labels.slice(0, -1).join('? ')}? Or ${labels[labels.length - 1]}?`
  : `${labels[0]}?`);

const scene = (...emojis) => h('div', { class: 'scene' }, emojis.map((e) => h('span', {}, e)));

// `choices` lists [emoji, label] pairs with the correct answer first.
function pictureChoice({ text, ask, pics, choices, after, optionsClass }) {
  const options = shuffle(choices.map(([emoji, label], i) => picOption(emoji, label, { correct: i === 0 })));
  return {
    text,
    say: `${ask} ${sayChoices(options.map((o) => o.label))}`,
    stage: pics ? scene(...pics) : null,
    options,
    optionsClass,
    after,
  };
}

/* School Ready Castle */

const ROUTINES = [
  { name: 'Getting ready for school', steps: [['🛏️', 'wake up'], ['👕', 'get dressed'], ['🥣', 'eat breakfast'], ['🎒', 'put on my school bag']] },
  { name: 'Arriving at school', steps: [['👋', 'say goodbye'], ['🧥', 'hang up my bag and jacket'], ['🪑', 'sit on the mat'], ['👂', 'listen to the teacher']] },
  { name: 'Lunch time', steps: [['🧼', 'wash my hands'], ['🍱', 'eat my lunch'], ['🗑️', 'put rubbish in the bin'], ['⚽', 'go and play']] },
  { name: 'Home time', steps: [['🎒', 'get my bag'], ['👋', 'say goodbye to my teacher'], ['🚗', 'go home'], ['🤗', 'hug my family']] },
  { name: 'Bed time', steps: [['🛁', 'have a bath'], ['🪥', 'brush my teeth'], ['📖', 'read a story'], ['😴', 'go to sleep']] },
];

function buildRoutines() {
  return shuffle(ROUTINES).slice(0, 4).map((r) => ({
    mode: 'order',
    text: r.name,
    say: `${r.name}. Tap the pictures in order. What do we do first?`,
    order: r.steps.map(([, label]) => label),
    options: shuffle(r.steps.map(([emoji, label]) => picOption(emoji, label, { key: label, speak: label }))),
    optionsClass: 'two',
    after: `First ${r.steps.map(([, label]) => label).join(', then ')}.`,
  }));
}

const PACKING = [
  {
    text: 'Pack my school bag!',
    say: 'Pop everything that goes in your school bag!',
    yes: [['🍱', 'lunchbox'], ['🥤', 'drink bottle'], ['🧢', 'sun hat'], ['📚', 'reading book'], ['🧥', 'jacket']],
    no: [['🧸', 'teddy'], ['📺', 'TV'], ['🛏️', 'bed'], ['🐶', 'dog'], ['🎂', 'birthday cake'], ['🚲', 'bike']],
    after: 'Your bag is ready for school!',
  },
  {
    text: 'Healthy lunchbox!',
    say: 'Pop all the healthy food for your lunchbox!',
    yes: [['🍎', 'apple'], ['🥪', 'sandwich'], ['🥕', 'carrot'], ['🧀', 'cheese'], ['🍌', 'banana']],
    no: [['🍭', 'lollipop'], ['🍩', 'doughnut'], ['🍫', 'chocolate'], ['🍟', 'chips'], ['🥤', 'fizzy drink']],
    after: 'Yum! A healthy lunch gives you energy to learn.',
  },
  {
    text: 'Ready to go!',
    say: 'Pop the things you wear to school!',
    yes: [['👟', 'shoes'], ['🧢', 'sun hat'], ['👕', 'T shirt'], ['🧥', 'jacket']],
    no: [['👑', 'crown'], ['🩱', 'swimsuit'], ['🤿', 'snorkel'], ['🎃', 'pumpkin'], ['🥽', 'goggles']],
    after: 'You are dressed and ready!',
  },
];

function buildPackMyBag() {
  return shuffle(PACKING).map((set) => {
    const yes = shuffle(set.yes).slice(0, 4);
    const no = shuffle(set.no).slice(0, 5);
    return {
      mode: 'multi',
      text: set.text,
      say: set.say,
      options: shuffle([
        ...yes.map(([emoji, label]) => picOption(emoji, label, { correct: true, speak: label })),
        ...no.map(([emoji, label]) => picOption(emoji, label)),
      ]),
      after: set.after,
    };
  });
}

const SCHOOL_SCENES = [
  { ask: 'You need to go to the toilet. What should you do?', pic: '🚽', choices: [['🙋', 'ask the teacher'], ['🏃', 'run home'], ['🤐', 'say nothing']], after: 'Put up your hand and ask the teacher.' },
  { ask: 'You cannot open your lunchbox. What should you do?', pic: '🍱', choices: [['🙋', 'ask for help'], ['😭', 'cry and cry'], ['🗑️', 'throw it away']], after: 'It is good to ask for help.' },
  { ask: 'The teacher is talking. What should you do?', pic: '👩‍🏫', choices: [['👂', 'listen'], ['📢', 'shout'], ['🤸', 'do cartwheels']], after: 'We listen when the teacher is talking.' },
  { ask: 'Your friend is sad. What should you do?', pic: '😢', choices: [['🤗', 'be kind'], ['😝', 'laugh'], ['🚶', 'walk away']], after: 'Being kind helps our friends feel better.' },
  { ask: 'The bell rings for play time. What should you do?', pic: '🔔', choices: [['🧢', 'put on my hat and play'], ['😴', 'go to sleep'], ['📺', 'watch TV']], after: 'No hat, no play!' },
  { ask: 'You made a mistake. What should you do?', pic: '✏️', choices: [['💪', 'try again'], ['😡', 'get cross'], ['🙈', 'give up']], after: 'Mistakes help us learn. Try again!' },
  { ask: 'You want a turn on the swing. What should you do?', pic: '🎠', choices: [['⏳', 'wait for my turn'], ['🤛', 'push in'], ['😤', 'stamp my feet']], after: 'We take turns.' },
];

function buildWhatShouldIDo() {
  return shuffle(SCHOOL_SCENES).slice(0, 5).map((s) => pictureChoice({
    text: 'What should I do?',
    ask: s.ask,
    pics: [s.pic],
    choices: s.choices,
    after: s.after,
  }));
}

const TE_REO_WORDS = [
  ['Kia ora', 'hello', '👋'],
  ['Mōrena', 'good morning', '🌅'],
  ['Ka kite anō', 'see you again', '🙋'],
  ['Ka pai', 'well done', '👍'],
  ['Āe', 'yes', '✅'],
  ['Kāo', 'no', '❌'],
  ['Whānau', 'family', '👨‍👩‍👧'],
  ['Kai', 'food', '🍎'],
  ['Kura', 'school', '🏫'],
];

function buildTeReoWords() {
  return TE_REO_WORDS.map(([reo, english, emoji]) => {
    const say = `${reo}. ${reo} means ${english}.`;
    return {
      mode: 'learn',
      text: 'New words in te reo Māori',
      say,
      stage: h('button', { class: 'reo-card', 'aria-label': 'Hear again', onclick: () => Speech.say(say) },
        h('span', { class: 'big-pic' }, emoji),
        h('span', { class: 'reo-word' }, reo),
        h('span', { class: 'reo-english' }, english)),
    };
  });
}

function buildTeReoGame() {
  return shuffle(TE_REO_WORDS).slice(0, 5).map(([reo, english, emoji]) => {
    const others = shuffle(TE_REO_WORDS.filter((w) => w[0] !== reo)).slice(0, 2);
    return pictureChoice({
      text: `Which word means "${english}"?`,
      ask: `Which word means ${english}?`,
      choices: [[emoji, reo], ...others.map(([r, , e]) => [e, r])],
      after: `${reo} means ${english}.`,
    });
  });
}

/* Talk and Listen Garden */

const WH_SCENES = [
  { ask: 'A girl is playing at the beach. Where is she?', pics: ['👧', '🏖️'], choices: [['🏖️', 'at the beach'], ['🏫', 'at school'], ['🛏️', 'in bed']] },
  { ask: 'The baker makes a cake. Who makes the cake?', pics: ['🧑‍🍳', '🎂'], choices: [['🧑‍🍳', 'the baker'], ['👮', 'the police officer'], ['🧑‍🚀', 'the astronaut']] },
  { ask: 'The puppy is playing with a ball. What is the puppy playing with?', pics: ['🐶', '⚽'], choices: [['⚽', 'a ball'], ['🧸', 'a teddy'], ['🍎', 'an apple']] },
  { ask: 'The boy is climbing a tree. Where is the boy?', pics: ['👦', '🌳'], choices: [['🌳', 'in a tree'], ['🏊', 'in the pool'], ['🚗', 'in the car']] },
  { ask: 'The cat is sleeping on the bed. Who is sleeping?', pics: ['🐱', '🛏️'], choices: [['🐱', 'the cat'], ['🐶', 'the dog'], ['🐰', 'the bunny']] },
  { ask: 'The doctor works at the hospital. Where does the doctor work?', pics: ['🧑‍⚕️', '🏥'], choices: [['🏥', 'at the hospital'], ['🏪', 'at the shop'], ['🏫', 'at school']] },
  { ask: 'Nana is knitting with wool. What is Nana using?', pics: ['👵', '🧶'], choices: [['🧶', 'wool'], ['🔨', 'a hammer'], ['✂️', 'scissors']] },
  { ask: 'The farmer is driving a tractor. Who is driving?', pics: ['🧑‍🌾', '🚜'], choices: [['🧑‍🌾', 'the farmer'], ['👩‍🏫', 'the teacher'], ['🤡', 'the clown']] },
];

function buildWhoWhatWhere() {
  return shuffle(WH_SCENES).slice(0, 5).map((s) => pictureChoice({
    text: 'Listen and look',
    ask: `Look! ${s.ask}`,
    pics: s.pics,
    choices: s.choices,
    after: `Yes, ${s.choices[0][1]}.`,
  }));
}

const BECAUSE = [
  { start: 'I put on my jacket because', pic: '🧥', choices: [['🥶', 'it is cold'], ['🥵', 'it is hot'], ['🎂', 'it is my birthday']] },
  { start: 'I take my umbrella because', pic: '☂️', choices: [['🌧️', 'it is raining'], ['🌙', 'it is night time'], ['🍕', 'I want pizza']] },
  { start: 'I eat my lunch because', pic: '🍱', choices: [['😋', 'I am hungry'], ['😴', 'I am sleepy'], ['🥶', 'I am cold']] },
  { start: 'I go to bed because', pic: '🛏️', choices: [['😴', 'I am tired'], ['😋', 'I am hungry'], ['🌞', 'it is sunny']] },
  { start: 'I wear my sun hat because', pic: '🧢', choices: [['☀️', 'it is sunny'], ['🌙', 'it is night time'], ['🌧️', 'it is raining']] },
  { start: 'I wash my hands because', pic: '🧼', choices: [['🦠', 'they are dirty'], ['🎵', 'I like music'], ['🐶', 'I have a dog']] },
  { start: 'The ice cream melts because', pic: '🍦', choices: [['☀️', 'it is hot'], ['❄️', 'it is cold'], ['🌙', 'it is night time']] },
];

function buildBecause() {
  return shuffle(BECAUSE).slice(0, 5).map((b) => pictureChoice({
    text: `${b.start}...`,
    ask: `${b.start}...`,
    pics: [b.pic],
    choices: b.choices,
    after: `${b.start} ${b.choices[0][1]}.`,
  }));
}

const FOLLOW_THINGS = [['⭐', 'star'], ['❤️', 'heart'], ['🌙', 'moon'], ['🌸', 'flower'], ['🍎', 'apple'], ['🐟', 'fish'], ['🚗', 'car'], ['🎈', 'balloon'], ['☀️', 'sun']];

function buildFollowMe() {
  return [1, 2, 2, 3, 3].map((steps) => {
    const picks = shuffle(FOLLOW_THINGS).slice(0, 6);
    const targets = picks.slice(0, steps).map(([, name]) => name);
    const instruction = targets.map((name, i) => `${i === 0 ? 'Tap the' : 'then the'} ${name}`).join(', ');
    return {
      mode: 'order',
      text: steps === 1 ? 'Listen and tap!' : `Listen! Tap ${steps} things.`,
      say: `Listen carefully. ${instruction}.`,
      order: targets,
      options: shuffle(picks).map(([emoji, name]) => ({ content: h('span', { class: 'pic-emoji' }, emoji), key: name })),
      after: 'You listened so well!',
    };
  });
}

const FEELINGS = [
  { ask: 'Your ice cream fell on the ground. How do you feel?', pic: '🍦', choices: [['😢', 'sad'], ['😀', 'happy'], ['😴', 'sleepy']] },
  { ask: 'It is your birthday party! How do you feel?', pic: '🎂', choices: [['😀', 'happy'], ['😢', 'sad'], ['😠', 'cross']] },
  { ask: 'Someone took your toy without asking. How do you feel?', pic: '🧸', choices: [['😠', 'cross'], ['😀', 'happy'], ['😴', 'sleepy']] },
  { ask: 'There is a very loud thunder storm. How do you feel?', pic: '⛈️', choices: [['😨', 'scared'], ['😀', 'happy'], ['😋', 'hungry']] },
  { ask: 'You played all day at the beach. How do you feel?', pic: '🏖️', choices: [['😴', 'tired'], ['😨', 'scared'], ['😠', 'cross']] },
  { ask: 'Your tummy is rumbling and it is lunch time. How do you feel?', pic: '🍱', choices: [['😋', 'hungry'], ['😢', 'sad'], ['😨', 'scared']] },
  { ask: 'Your friend gave you a big hug. How do you feel?', pic: '🤗', choices: [['🥰', 'loved'], ['😠', 'cross'], ['😨', 'scared']] },
];

function buildFeelings() {
  return shuffle(FEELINGS).slice(0, 5).map((f) => pictureChoice({
    text: 'How do I feel?',
    ask: f.ask,
    pics: [f.pic],
    choices: f.choices,
    after: `You might feel ${f.choices[0][1]}. It is good to tell a grown up how you feel.`,
  }));
}

const TALK_PROMPTS = [
  { say: 'Look at this picture. Tell a grown up what is happening and what might happen next.', pics: ['👧', '🏖️', '🏐'] },
  { say: 'Tell a grown up about something you like doing. Why do you like it?', pics: ['🎨', '⚽', '📚'] },
  { say: 'Make up a silly story about these friends. What are their names?', pics: ['🐱', '🐸', '🎈'] },
  { say: 'Explain how you get ready to go outside. What do you do first?', pics: ['🧢', '👟', '🎒'] },
  { say: 'Pretend you are the teacher. Give a grown up three instructions.', pics: ['👩‍🏫', '👂', '🪑'] },
  { say: 'Think of a word that rhymes with cat. Can you make up a funny one?', pics: ['🐱', '🎩', '🦇'] },
  { say: 'Tell a grown up about a fun thing you did with your family.', pics: ['👨‍👩‍👧', '🌳', '🍦'] },
];

function buildTalkTogether() {
  return shuffle(TALK_PROMPTS).slice(0, 5).map((item) => ({
    mode: 'learn',
    text: 'Your turn to talk!',
    say: `${item.say} Take your time. There are no wrong answers.`,
    stage: scene(...item.pics),
    completeLabel: 'I shared my idea!',
  }));
}

/* Story Book Nook */

// Words made only from Set 1 letters, so they can be sounded out with what she has learned.
const DECODABLE = [
  ['map', '🗺️'], ['mop', '🧹'], ['pin', '📌'], ['pot', '🍲'], ['tap', '🚰'], ['pan', '🍳'], ['ant', '🐜'],
  ['sad', '😢'], ['nap', '😴'], ['dot', '🔴'], ['sit', '🪑'], ['tin', '🥫'], ['dad', '👨'], ['mad', '😠'],
];

function buildSoundItOut() {
  preloadClips(SET_1);
  const byLetter = Object.fromEntries(SET_1.map((x) => [x.letter, x]));
  return shuffle(DECODABLE).slice(0, 5).map(([word, emoji]) => {
    const others = shuffle(DECODABLE.filter((w) => w[0] !== word)).slice(0, 2);
    return {
      text: 'Sound it out. Which picture is it?',
      say: 'Tap each letter to hear its sound. Say the sounds together. Which picture is it?',
      stage: h('div', { class: 'word-tiles' }, [...word].map((ch) =>
        h('button', { class: 'word-tile letter', onclick: () => playSound(byLetter[ch]) }, ch))),
      options: shuffle([[emoji, true], ...others.map(([, e]) => [e, false])])
        .map(([e, correct]) => ({ content: h('span', { class: 'pic-emoji' }, e), correct })),
      after: `${word}!`,
    };
  });
}

// Spoken hints for words a speech voice might say oddly on their own.
const SIGHT_WORDS = [
  ['I', 'I, like I am happy'], ['the', 'the, like the dog'], ['a', 'a, like a cat'], ['is', 'is'], ['it', 'it'],
  ['and', 'and'], ['to', 'to'], ['my', 'my'], ['go', 'go'], ['we', 'we'], ['see', 'see'], ['in', 'in'], ['on', 'on'], ['at', 'at'],
];

function buildSightWords() {
  return shuffle(SIGHT_WORDS).slice(0, 5).map(([word, spoken]) => {
    const others = shuffle(SIGHT_WORDS.filter((w) => w[0] !== word)).slice(0, 2).map(([w]) => w);
    return {
      text: 'Find the word',
      say: `Find the word. ${spoken}.`,
      stage: h('button', { class: 'ear-btn', 'aria-label': 'Hear the word', onclick: () => Speech.say(spoken) }, '👂'),
      options: shuffle([word, ...others]).map((w) => ({ content: h('span', { class: 'word' }, w), correct: w === word })),
      after: `${spoken}!`,
    };
  });
}

const STORIES = [
  {
    pages: [['Nan has a pot.', ['👵', '🍲']], ['Tim sits and sniffs.', ['👦', '👃']], ['It is hot!', ['🍲', '🔥']]],
    who: { ask: 'Who has the pot?', choices: [['👵', 'Nan'], ['👦', 'Tim'], ['🐶', 'the dog']] },
    next: { ask: 'What will they do next?', choices: [['🥣', 'eat the soup'], ['🚀', 'fly a rocket'], ['🏊', 'go swimming']], after: 'Yum! They eat the soup.' },
  },
  {
    pages: [['Sam is a cat.', ['🐱']], ['Sam sat on a mat.', ['🐱', '🟫']], ['Sam naps and naps.', ['🐱', '💤']]],
    who: { ask: 'Who is the story about?', choices: [['🐱', 'Sam the cat'], ['🐶', 'a dog'], ['🐭', 'a mouse']] },
    next: { ask: 'Sam wakes up. What will Sam do next?', choices: [['🥛', 'drink some milk'], ['🚗', 'drive a car'], ['📚', 'read a book']], after: 'Sam drinks some milk.' },
  },
  {
    pages: [['Pip is a dog.', ['🐶']], ['Pip digs and digs.', ['🐶', '🕳️']], ['Pip sniffs in the pit.', ['🐶', '👃']]],
    who: { ask: 'Who is digging?', choices: [['🐶', 'Pip the dog'], ['🐱', 'a cat'], ['🐰', 'a bunny']] },
    next: { ask: 'What will Pip find?', choices: [['🦴', 'a bone'], ['🎂', 'a cake'], ['🚲', 'a bike']], after: 'Pip finds a bone!' },
  },
  {
    pages: [['Dad has a map.', ['👨', '🗺️']], ['Dad and Tim go to the sand.', ['👨', '👦', '🏖️']], ['Tim digs in the sand.', ['👦', '🏝️']]],
    who: { ask: 'Who has the map?', choices: [['👨', 'Dad'], ['👵', 'Nan'], ['🐱', 'the cat']] },
    next: { ask: 'What will Tim make in the sand?', choices: [['🏰', 'a sand castle'], ['🍰', 'a cake'], ['⛄', 'a snowman']], after: 'Tim makes a sand castle!' },
  },
];

function storyPage(sentence, pics) {
  return {
    mode: 'learn',
    text: 'Read with me. Tap a word to hear it.',
    say: sentence,
    stage: h('div', { class: 'story-page' },
      scene(...pics),
      h('p', { class: 'story-text' }, sentence.split(' ').map((w) =>
        h('button', { class: 'story-word', onclick: () => Speech.say(w.replace(/[^A-Za-z']/g, '')) }, w)))),
  };
}

function buildStoryTime() {
  const story = pick(STORIES);
  return [
    ...story.pages.map(([sentence, pics]) => storyPage(sentence, pics)),
    pictureChoice({ text: 'Who is in the story?', ask: story.who.ask, choices: story.who.choices, after: `${story.who.choices[0][1]}!` }),
    pictureChoice({ text: 'What happens next?', ask: story.next.ask, choices: story.next.choices, after: story.next.after }),
  ];
}

/* Writing Studio */

function buildTraceLetters(count) {
  const letters = count >= SET_1.length ? SET_1 : shuffle(SET_1).slice(0, count);
  return letters.map((item) => ({
    mode: 'trace',
    glyph: item.letter,
    text: 'Trace the letter',
    say: `Trace the letter at the start of ${item.words[0][0]}. Use your finger!`,
  }));
}

function buildTraceNumbers() {
  return shuffle(Array.from({ length: 21 }, (_, n) => n)).slice(0, 5).sort((a, b) => a - b).map((n) => ({
    mode: 'trace',
    glyph: String(n),
    text: `Trace the number ${n}`,
    say: `Trace the number ${n}. In te reo Māori, ${n} is ${TE_REO_NUMBERS[n]}.`,
  }));
}

function buildTraceName(p) {
  const name = p.name;
  return [
    { mode: 'trace', glyph: [...name][0], text: 'The first letter of my name', say: `This is the first letter of your name, ${name}. Trace it with your finger.` },
    { mode: 'trace', glyph: name, text: 'My name', say: `Now trace your whole name. ${name}!` },
  ];
}

function buildWordBuilder() {
  return shuffle(DECODABLE).slice(0, 5).map(([word, emoji]) => {
    const letters = [...word];
    const extra = pick(SET_1.filter((x) => !letters.includes(x.letter))).letter;
    return {
      mode: 'order',
      text: 'Spell the word',
      say: `Let's spell ${word}. Tap the letters in order. ${word}.`,
      stage: h('button', { class: 'big-pic', 'aria-label': word, onclick: () => Speech.say(word) }, emoji),
      order: letters,
      options: shuffle([...letters, extra]).map((ch) => ({ content: letterNode(ch), key: ch })),
      optionsClass: 'four',
      after: `${word}!`,
    };
  });
}

/* Maths Magic Meadow: patterns, measuring and shapes */

const PATTERN_GROUPS = [
  ['🔴', '🔵', '🟢', '🟡', '🟣'],
  ['⭐', '❤️', '🔷', '🌙'],
  ['🍎', '🍌', '🍇', '🍓'],
  ['🐱', '🐶', '🐰', '🐸'],
];

const patternStage = (seq) => h('div', { class: 'pattern' },
  seq.map((e) => h('span', { class: 'pattern-item' }, e)),
  h('span', { class: 'num-tile q' }, '?'));

function buildPatterns() {
  const visual = shuffle(PATTERN_GROUPS).map((group) => {
    const [a, b, c] = shuffle(group);
    const seq = Array.from({ length: pick([4, 5]) }, (_, i) => (i % 2 ? b : a));
    const answer = seq.length % 2 ? b : a;
    return {
      text: 'What comes next?',
      say: 'Look at the pattern. What comes next?',
      stage: patternStage(seq),
      options: shuffle([a, b, c]).map((e) => ({ content: h('span', { class: 'pic-emoji' }, e), correct: e === answer })),
      after: 'You made the pattern!',
    };
  });
  const beats = Array.from({ length: pick([4, 5]) }, (_, i) => (i % 2 ? 'stamp' : 'clap'));
  const nextBeat = beats.length % 2 ? 'stamp' : 'clap';
  const beatEmoji = { clap: '👏', stamp: '🦶', sing: '🎵' };
  const sound = {
    text: 'What comes next?',
    say: `Listen. ${beats.join(', ')}... What comes next?`,
    stage: patternStage(beats.map((b) => beatEmoji[b])),
    options: shuffle(['clap', 'stamp', 'sing']).map((b) => picOption(beatEmoji[b], b, { correct: b === nextBeat })),
    after: `${[...beats, nextBeat].join(', ')}!`,
  };
  return shuffle([...visual, sound]);
}

const TALL_THINGS = [['🌳', 'tree'], ['🦒', 'giraffe'], ['🌻', 'sunflower'], ['🏠', 'house'], ['🕯️', 'candle']];
const WEIGHT_PAIRS = [
  [['🐘', 'elephant'], ['🐭', 'mouse']], [['🍉', 'watermelon'], ['🍒', 'cherry']], [['🚗', 'car'], ['🎈', 'balloon']],
  [['🧱', 'brick'], ['🪶', 'feather']], [['🐻', 'bear'], ['🐝', 'bee']],
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function sizeQuestion() {
  const [emoji, name] = pick(TALL_THINGS);
  const word = pick(['taller', 'shorter']);
  const target = word === 'taller' ? 130 : 70;
  return {
    text: `Which ${name} is ${word}?`,
    say: `Which ${name} is ${word}?`,
    optionsClass: 'two',
    options: shuffle([70, 130]).map((size) => ({
      content: h('span', { class: 'size-box' }, h('span', { style: `font-size:${size}px;line-height:1` }, emoji)),
      correct: size === target,
      cls: 'opt-group',
    })),
    after: `That ${name} is ${word}!`,
  };
}

function ribbonQuestion() {
  const word = pick(['longer', 'shorter']);
  const target = word === 'longer' ? 95 : 40;
  const colour = pick(['#ff8fc7', '#b79cff', '#4fcfae', '#64b5f6']);
  return {
    text: `Which ribbon is ${word}?`,
    say: `Which ribbon is ${word}?`,
    optionsClass: 'stack',
    options: shuffle([40, 95]).map((w) => ({
      content: h('span', { class: 'ribbon', style: `width:${w}%;background:${colour}` }),
      correct: w === target,
      cls: 'opt-ribbon',
    })),
    after: `That ribbon is ${word}!`,
  };
}

function weightQuestion() {
  const [heavy, light] = pick(WEIGHT_PAIRS);
  const word = pick(['heavier', 'lighter']);
  const [right, wrong] = word === 'heavier' ? [heavy, light] : [light, heavy];
  return pictureChoice({
    text: `Which is ${word}?`,
    ask: `Which is ${word}?`,
    choices: [right, wrong],
    optionsClass: 'two',
    after: `The ${right[1]} is ${word}.`,
  });
}

function cupQuestion() {
  const word = pick(['full', 'empty']);
  const target = word === 'full' ? 92 : 0;
  return {
    text: `Which glass is ${word}?`,
    say: `Which glass is ${word}?`,
    optionsClass: 'two',
    options: shuffle([92, 0]).map((level) => ({
      content: h('span', { class: 'cup' }, h('span', { class: 'cup-fill', style: `height:${level}%` })),
      correct: level === target,
      cls: 'opt-group',
    })),
    after: `That glass is ${word}!`,
  };
}

function dayQuestion() {
  if (Math.random() < 0.5) {
    const i = randInt(0, 5);
    const answer = DAYS[i + 1];
    const choices = shuffle([answer, ...shuffle(DAYS.filter((d) => d !== answer && d !== DAYS[i])).slice(0, 2)]);
    return {
      text: `What day comes after ${DAYS[i]}?`,
      say: `What day comes after ${DAYS[i]}? ${sayChoices(choices)}`,
      optionsClass: 'stack',
      options: choices.map((d) => ({ content: h('span', { class: 'word' }, d), correct: d === answer, cls: 'opt-word' })),
      after: `${DAYS[i]}, ${answer}!`,
    };
  }
  const start = randInt(0, 3);
  const days = DAYS.slice(start, start + 4);
  return {
    mode: 'order',
    text: 'Put the days in order',
    say: `Put the days in order. Start with ${days[0]}.`,
    order: days,
    optionsClass: 'two',
    options: shuffle(days).map((d) => ({ content: h('span', { class: 'word' }, d), key: d, speak: d, cls: 'opt-word' })),
    after: `${days.join(', ')}.`,
  };
}

function buildMeasuring() {
  return [sizeQuestion(), ribbonQuestion(), weightQuestion(), cupQuestion(), dayQuestion()];
}

const SHAPE_FACTS = {
  circle: 'A circle is round. It has no corners.',
  square: 'A square has 4 sides that are all the same.',
  triangle: 'A triangle has 3 sides and 3 corners.',
  rectangle: 'A rectangle has 4 sides. 2 are long and 2 are short.',
};
const SHAPE_COLOURS = ['#ff8fc7', '#b79cff', '#4fcfae', '#ffb74d', '#64b5f6'];
const shapeNode = (kind, colour = pick(SHAPE_COLOURS)) => h('span', { class: `shape shape-${kind}`, style: `--c:${colour}` });

function nameShapeQuestion(kind) {
  const others = shuffle(Object.keys(SHAPE_FACTS).filter((k) => k !== kind)).slice(0, 2);
  return {
    text: `Tap the ${kind}`,
    say: `Tap the ${kind}.`,
    options: shuffle([kind, ...others]).map((k) => ({ content: shapeNode(k), correct: k === kind })),
    after: SHAPE_FACTS[kind],
  };
}

function popShapesQuestion(kind) {
  const others = Object.keys(SHAPE_FACTS).filter((k) => k !== kind);
  const kinds = shuffle([kind, kind, kind, ...Array.from({ length: 6 }, () => pick(others))]);
  return {
    mode: 'multi',
    text: `Pop all the ${kind}s!`,
    say: `Pop all the ${kind}s!`,
    options: kinds.map((k) => ({ content: shapeNode(k), correct: k === kind })),
    after: `You found all the ${kind}s!`,
  };
}

const POSITION_EXAMPLES = [
  { word: 'on', a: '🐱', aName: 'cat', b: '📦', bName: 'box' },
  { word: 'under', a: '🐭', aName: 'mouse', b: '🪑', bName: 'chair' },
  { word: 'next to', a: '🐶', aName: 'dog', b: '🛏️', bName: 'bed' },
  { word: 'above', a: '🐦', aName: 'bird', b: '🌳', bName: 'tree' },
  { word: 'below', a: '🐟', aName: 'fish', b: '🪸', bName: 'coral' },
  { word: 'behind', a: '🐱', aName: 'cat', b: '📦', bName: 'box' },
  { word: 'inside', a: '🐭', aName: 'mouse', b: '📦', bName: 'box' },
  { word: 'over', a: '🐦', aName: 'bird', b: '🌳', bName: 'tree' },
  { word: 'through', a: '🐱', aName: 'cat', b: '🕳️', bName: 'tunnel' },
];

function positionNode(relation, example) {
  const { a, b } = example;
  if (relation === 'next to') return h('span', { class: 'pos pos-row' }, h('span', {}, a), h('span', {}, b));
  if (relation === 'behind') return h('span', { class: 'pos-behind' }, h('span', { class: 'pos-back' }, a), h('span', { class: 'pos-front' }, b));
  if (relation === 'inside') return h('span', { class: 'pos-container' }, h('span', { class: 'pos-contained' }, a), h('span', { class: 'pos-container-icon' }, b));
  if (relation === 'through') return h('span', { class: 'pos-through' }, h('span', {}, a), h('span', {}, '➡️'), h('span', { class: 'pos-tunnel' }, b), h('span', {}, '➡️'), h('span', {}, a));
  const above = ['on', 'above', 'over'].includes(relation);
  return h('span', { class: `pos pos-col pos-${relation.replaceAll(' ', '-')}` },
    h('span', {}, above ? a : b),
    relation === 'over' ? h('span', { class: 'pos-arc' }, '↷') : null,
    h('span', {}, above ? b : a));
}

function positionQuestion() {
  const example = pick(POSITION_EXAMPLES);
  const distractors = shuffle(POSITION_EXAMPLES.filter((x) => x.word !== example.word)).slice(0, 2);
  const choices = shuffle([example, ...distractors]);
  return {
    text: `Tap the picture with the ${example.aName} ${example.word} the ${example.bName}`,
    say: `Tap the picture with the ${example.aName} ${example.word} the ${example.bName}.`,
    options: choices.map((choice) => ({ content: positionNode(choice.word, choice), correct: choice.word === example.word, cls: 'opt-group' })),
    after: `The ${example.aName} is ${example.word} the ${example.bName}!`,
  };
}

function buildShapeSorting() {
  const colors = { red: '#f94144', blue: '#277da1', green: '#43aa8b', yellow: '#f9c74f', purple: '#9b5de5' };
  const shapes = [
    { kind: 'circle', color: colors.red }, { kind: 'circle', color: colors.blue },
    { kind: 'triangle', color: colors.red }, { kind: 'triangle', color: colors.yellow },
    { kind: 'square', color: colors.blue }, { kind: 'square', color: colors.green },
    { kind: 'rectangle', color: colors.red }, { kind: 'rectangle', color: colors.purple },
  ];
  const rounds = [
    { ask: 'Tap all the circles.', match: (s) => s.kind === 'circle', after: 'You sorted by shape. These are circles.' },
    { ask: 'Tap all the shapes with 3 corners.', match: (s) => s.kind === 'triangle', after: 'Triangles have 3 corners.' },
    { ask: 'Tap all the shapes with 4 sides.', match: (s) => ['square', 'rectangle'].includes(s.kind), after: 'Squares and rectangles have 4 sides.' },
    { ask: 'Tap all the red shapes.', match: (s) => s.color === colors.red, after: 'You sorted the shapes by colour.' },
    { ask: 'Tap all the blue shapes.', match: (s) => s.color === colors.blue, after: 'You sorted the shapes by colour.' },
  ];
  return shuffle(rounds).map((round) => ({
    mode: 'multi',
    text: round.ask,
    say: round.ask,
    options: shuffle(shapes).map((s) => ({ content: shapeNode(s.kind, s.color), correct: round.match(s) })),
    after: round.after,
  }));
}

function buildShapes() {
  const kinds = shuffle(Object.keys(SHAPE_FACTS));
  return [nameShapeQuestion(kinds[0]), nameShapeQuestion(kinds[1]), popShapesQuestion(kinds[2]), positionQuestion(), positionQuestion()];
}
