<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useLocale } from '../i18n';
import { botContent, matchTopic, type Topic } from '../content/bot';
import BotFace from './BotFace.vue';

// The site's assistant, in place of a contact form: a small bot at the end of the navbar whose bubble always
// types "…".
// It answers short questions about Quentin's work from what it knows (content/bot.ts), and turns into a message
// to Quentin when asked, or when it doesn't know: name, email and message, one at a time, sent to the contact
// API with the questions asked first. The links to Quentin's profiles sit at the bottom.
const { t, locale } = useLocale();
const route = useRoute();
const content = botContent[locale];

interface Line {
  id: number;
  from: 'bot' | 'you';
  text: string;
  link?: Topic['link'];
}
type Step = 'chat' | 'name' | 'email' | 'message' | 'sending';
type Mode = 'topics' | 'offer' | 'unknown' | 'retry';

const panel = ref<HTMLElement | null>(null);
const log = ref<HTMLElement | null>(null);
const field = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const open = ref(false);
const lines = ref<Line[]>([{ id: 0, from: 'bot', text: content.greeting }]);
const typing = ref(false);
const step = ref<Step>('chat');
const mode = ref<Mode>('topics');
const entry = ref('');
// Left empty by people; bots fill it in.
const trap = ref('');
const asked = ref<string[]>([]);
const visitor = { name: '', email: '' };
// A question the assistant couldn't answer, offered as the message; the message being sent.
let question: string | null = null;
let pending = '';
// The question to ask for the message, from the answer that offered it (about a role, a bar, an app…).
let prompt: string | null = null;
let openedAt = 0;
let nextId = 1;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrollDown() {
  await nextTick();
  log.value?.scrollTo({
    top: log.value.scrollHeight,
    behavior: reduceMotion() ? 'auto' : 'smooth',
  });
}
function add(from: Line['from'], text: string, link?: Line['link']) {
  lines.value.push({ id: nextId++, from, text, link });
  void scrollDown();
}
// The assistant types for a moment before each answer, a little longer for longer answers.
async function say(text: string, link?: Line['link']) {
  typing.value = true;
  void scrollDown();
  await wait(reduceMotion() ? 0 : Math.min(1000, 350 + text.length * 5));
  typing.value = false;
  add('bot', text, link);
}

const topicById = (id: string) => content.topics.find((topic) => topic.id === id)!;
// The reply buttons: the questions not asked yet, or what to do after an answer.
const buttons = computed<{ label: string; run: () => void }[]>(() => {
  if (step.value !== 'chat' || typing.value) return [];
  if (mode.value === 'offer')
    return [
      { label: content.writeMessage, run: () => void startMessage(content.writeMessage) },
      { label: content.somethingElse, run: () => void somethingElse() },
    ];
  if (mode.value === 'unknown')
    return [
      { label: content.sendIt, run: () => void startMessage(content.sendIt) },
      { label: content.somethingElse, run: () => void somethingElse() },
    ];
  if (mode.value === 'retry') return [{ label: content.tryAgain, run: () => void send() }];
  const left = content.suggested
    .map(topicById)
    .filter((topic) => !asked.value.includes(topic.ask))
    .slice(0, 4);
  return [
    ...left.map((topic) => ({ label: topic.ask, run: () => void answer(topic, topic.ask) })),
    { label: content.writeMessage, run: () => void startMessage(content.writeMessage) },
  ];
});

async function answer(topic: Topic, typed: string, shown = false) {
  if (!shown) add('you', typed);
  if (topic.id !== 'hello' && !asked.value.includes(topic.ask)) asked.value.push(topic.ask);
  if (topic.offerMessage) prompt = topic.prompt ?? null;
  await say(topic.answer, topic.link);
  mode.value = topic.offerMessage ? 'offer' : 'topics';
}
async function somethingElse() {
  add('you', content.somethingElse);
  question = null;
  await say(content.cancelled);
  mode.value = 'topics';
}
async function startMessage(label: string) {
  add('you', label);
  step.value = 'name';
  await say(content.askName);
  focusField();
}
async function cancel() {
  step.value = 'chat';
  question = null;
  entry.value = '';
  await say(content.cancelled);
  mode.value = 'topics';
}

interface ServerReply {
  id?: string;
  answer: string | null;
  link?: Line['link'];
  offer?: Topic['id'];
}
// The server matches the question to what it knows by meaning (apps/api/src/assistant.ts). It types while the
// server looks, for at least as long as it would type the answer. Null when the server can't answer at all.
async function askServer(question: string): Promise<ServerReply | null> {
  typing.value = true;
  void scrollDown();
  const started = Date.now();
  let reply: ServerReply | null = null;
  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ question, locale }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) reply = (await response.json()) as ServerReply;
  } catch {
    // Unreachable or too slow: the keyword topics answer.
  }
  const typed = reduceMotion() ? 0 : Math.min(1000, 350 + (reply?.answer?.length ?? 40) * 5);
  await wait(Math.max(0, typed - (Date.now() - started)));
  typing.value = false;
  return reply;
}

async function submit() {
  const text = entry.value.trim();
  if (!text || typing.value || step.value === 'sending') return;
  entry.value = '';
  if (step.value === 'chat') {
    add('you', text);
    const reply = await askServer(text);
    // Without the server's model (turned off, busy or unreachable), the keyword topics answer instead.
    if (reply === null) {
      const topic = matchTopic(content, text);
      if (topic) return answer(topic, text, true);
    } else if (reply.answer) {
      const offer = reply.offer ? topicById(reply.offer) : null;
      if (!['hello', 'thanks', 'off-topic'].includes(reply.id ?? ''))
        asked.value.push(text.length > 90 ? `${text.slice(0, 88)}…` : text);
      if (reply.offer) prompt = offer?.prompt ?? null;
      add('bot', reply.answer, reply.link);
      mode.value = reply.offer ? 'offer' : 'topics';
      return focusField();
    }
    question = text;
    await say(content.unknown);
    mode.value = 'unknown';
  } else if (step.value === 'name') {
    add('you', text);
    visitor.name = text.slice(0, 100);
    step.value = 'email';
    await say(content.askEmail(visitor.name));
  } else if (step.value === 'email') {
    add('you', text);
    if (!EMAIL.test(text)) return say(content.badEmail);
    visitor.email = text;
    step.value = 'message';
    if (question) {
      entry.value = question;
      await say(content.askDraft);
    } else await say(prompt ?? content.askMessage);
  } else if (step.value === 'message') {
    add('you', text);
    pending = text;
    await send();
  }
  focusField();
}

async function send() {
  step.value = 'sending';
  mode.value = 'topics';
  let reply: string;
  let next: Step = 'chat';
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: visitor.name,
        email: visitor.email,
        message: pending,
        website: trap.value,
        locale,
        page: route.fullPath,
        elapsed: Date.now() - openedAt,
        asked: asked.value.join(' · '),
      }),
    });
    if (response.ok) {
      reply = content.sent;
      cheer();
      question = null;
      prompt = null;
    } else if (response.status === 400) {
      const fields: string[] = (await response.json().catch(() => ({})))?.fields ?? [];
      next = fields.includes('email') ? 'email' : fields.includes('name') ? 'name' : 'message';
      reply = next === 'email' ? content.badEmail : t('contact.invalid');
    } else if (response.status === 429) reply = t('contact.limited');
    else {
      reply = t('contact.failed');
      mode.value = 'retry';
    }
  } catch {
    reply = t('contact.failed');
    mode.value = 'retry';
  }
  step.value = next;
  await say(reply);
  focusField();
}

function focusField() {
  void nextTick(() => field.value?.focus({ preventScroll: true }));
}
function onToggle(event: Event) {
  open.value = (event as ToggleEvent).newState === 'open';
  // With the chat open, the bot looks down at it.
  look.value = open.value ? LOOK.chat : LOOK.ahead;
  if (!open.value) return;
  openedAt ||= Date.now();
  void scrollDown();
  // On phones the keyboard would cover the conversation before it's read.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) focusField();
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    void submit();
  }
}
function close() {
  panel.value?.hidePopover();
}

// Its character, in the navbar. Several small things run at once, so it never seems to wait between moods: it
// breathes, its eyes make little movements every second or two and blink at random, its head leans toward where
// it looks, and every few seconds it does something bigger (a hop, a wiggle, a nod, a look around, a turn, or "…"
// in its bubble). Its eyes follow a mouse, it perks up when one comes near, glances the way the page scrolls and
// looks down at the chat while it's open. Hovering it, or a message sent, makes it happy. With reduced motion it
// keeps still and only the bubble comes and goes.
type Move = '' | 'hop' | 'spin' | 'wiggle' | 'nod';
const look = ref({ x: 0, y: 0 });
const mood = ref<'calm' | 'happy'>('calm');
const blinking = ref(false);
const talking = ref(false);
const near = ref(false);
const move = ref<Move>('');
const launcher = ref<HTMLButtonElement | null>(null);
const tilt = computed(() => `${(look.value.x * 2.4).toFixed(1)}deg`);
const LOOK = {
  ahead: { x: 0, y: 0 },
  chat: { x: -1.2, y: 1.6 },
  bubble: { x: -1.3, y: 1.4 },
};
const timers = new Set<ReturnType<typeof setTimeout>>();
function after(ms: number, run: () => void) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    run();
  }, ms);
  timers.add(timer);
}
const between = (min: number, max: number) => min + Math.random() * (max - min);
let hovered = false;
let followedAt = 0;
let scrolledAt = 0;
let spokeAt = 0;
let lastScroll = 0;
let frame = 0;
const quiet = () => open.value || document.hidden;
const following = () => Date.now() - followedAt < 1600;

function blink() {
  if (!document.hidden) {
    blinking.value = true;
    after(120, () => {
      blinking.value = false;
      // Now and then, twice.
      if (Math.random() < 0.2)
        after(150, () => {
          blinking.value = true;
          after(110, () => (blinking.value = false));
        });
    });
  }
  after(between(2200, 5600), blink);
}
// Little eye movements, as when someone is thinking or looking about.
function wander() {
  if (!quiet() && !following() && !talking.value && Date.now() - scrolledAt > 900) {
    const far = Math.random() < 0.22;
    look.value =
      Math.random() < 0.25
        ? LOOK.ahead
        : { x: between(-1, 1) * (far ? 1.9 : 1.1), y: between(-0.8, 1) * (far ? 1.4 : 0.8) };
  }
  after(between(700, 2200), wander);
}
function perform(name: Exclude<Move, ''>, ms: number) {
  move.value = name;
  after(ms, () => (move.value = ''));
}
function speak() {
  spokeAt = Date.now();
  talking.value = true;
  look.value = LOOK.bubble;
  after(3400, () => {
    talking.value = false;
    if (!following() && !open.value) look.value = LOOK.ahead;
  });
}
// Looks one way, then the other.
function sweep() {
  const side = Math.random() < 0.5 ? -1 : 1;
  look.value = { x: 1.9 * side, y: 0.2 };
  after(600, () => (look.value = { x: -1.9 * side, y: 0.2 }));
  after(1250, () => (look.value = LOOK.ahead));
}
// Something bigger every 2.5 to 6 seconds, over the breathing, blinking and wandering eyes.
function act(motion: boolean) {
  if (!quiet() && !move.value && !talking.value) {
    const roll = Math.random();
    if (!motion || (roll < 0.22 && Date.now() - spokeAt > 9000)) speak();
    else if (roll < 0.42) perform('hop', 650);
    else if (roll < 0.57) perform('wiggle', 700);
    else if (roll < 0.7) perform('nod', 600);
    else if (roll < 0.88 && !following()) sweep();
    else if (roll < 0.95) perform('spin', 1100);
  }
  after(motion ? between(2500, 6000) : between(10000, 18000), () => act(motion));
}
function cheer() {
  mood.value = 'happy';
  perform('hop', 650);
  after(2600, () => {
    if (!hovered) mood.value = 'calm';
  });
}
function follow(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || open.value || frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const box = launcher.value?.getBoundingClientRect();
    if (!box) return;
    const dx = event.clientX - (box.right - 18);
    const dy = event.clientY - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy);
    look.value =
      distance < 24 ? LOOK.ahead : { x: (dx / distance) * 1.9, y: (dy / distance) * 1.5 };
    near.value = distance < 140;
    followedAt = Date.now();
  });
}
function onScroll() {
  const moved = window.scrollY - lastScroll;
  lastScroll = window.scrollY;
  if (quiet() || following() || talking.value || Math.abs(moved) < 4) return;
  scrolledAt = Date.now();
  look.value = { x: look.value.x * 0.5, y: moved > 0 ? 1.4 : -1.2 };
}
function onHover(entering: boolean) {
  hovered = entering;
  mood.value = entering ? 'happy' : 'calm';
}
onMounted(() => {
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motion) {
    after(between(1200, 2600), blink);
    after(900, wander);
    lastScroll = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches)
      window.addEventListener('pointermove', follow, { passive: true });
  }
  after(2600, speak);
  after(motion ? 6500 : 14000, () => act(motion));
});
onBeforeUnmount(() => {
  timers.forEach(clearTimeout);
  cancelAnimationFrame(frame);
  window.removeEventListener('pointermove', follow);
  window.removeEventListener('scroll', onScroll);
});

const placeholder = computed(
  () =>
    ({
      chat: t('bot.ask'),
      name: t('bot.name'),
      email: t('bot.email'),
      message: t('bot.message'),
      sending: t('bot.message'),
    })[step.value],
);
</script>

<template>
  <button
    ref="launcher"
    type="button"
    class="bot-launcher"
    :class="{
      'is-open': open,
      'is-talking': talking && !open,
      'is-near': near,
      [`is-${move}`]: move,
    }"
    :style="{ '--tilt': tilt }"
    popovertarget="hello-bot"
    :aria-label="t('bot.open')"
    @pointerenter="onHover(true)"
    @pointerleave="onHover(false)"
  >
    <span class="bot-bubble" aria-hidden="true"><i></i><i></i><i></i></span>
    <BotFace class="bot-launcher-face" :look="look" :mood="mood" :blink="blinking" />
  </button>

  <div
    id="hello-bot"
    ref="panel"
    popover
    class="bot-panel"
    aria-labelledby="hello-bot-title"
    @toggle="onToggle"
  >
    <div class="bot-head">
      <BotFace class="bot-head-face" />
      <div>
        <p id="hello-bot-title" class="bot-title">{{ t('bot.title') }}</p>
        <p class="bot-subtitle">{{ t('bot.subtitle') }}</p>
      </div>
      <button type="button" class="bot-close" @click="close">
        <span class="sr-only">{{ t('bot.close') }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </div>

    <div ref="log" class="bot-log" role="log" :aria-label="t('bot.conversation')">
      <div v-for="line in lines" :key="line.id" class="bot-line" :class="`from-${line.from}`">
        <p>{{ line.text }}</p>
        <template v-if="line.link">
          <a v-if="/^https?:/.test(line.link.to)" :href="line.link.to" class="bot-link"
            >{{ line.link.label }} <span aria-hidden="true">↗</span></a
          >
          <RouterLink v-else :to="line.link.to" class="bot-link" @click="close"
            >{{ line.link.label }} <span aria-hidden="true">→</span></RouterLink
          >
        </template>
      </div>
      <div v-if="typing" class="bot-line from-bot is-typing" :aria-label="t('bot.typing')">
        <span class="bot-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
    </div>

    <div v-if="buttons.length" class="bot-replies" role="group" :aria-label="t('bot.replies')">
      <button v-for="button in buttons" :key="button.label" type="button" @click="button.run">
        {{ button.label }}
      </button>
    </div>

    <form class="bot-form" novalidate @submit.prevent="submit">
      <p v-if="step === 'email' || step === 'message'" class="bot-privacy">
        {{ t('contact.privacy') }}
      </p>
      <div class="bot-entry">
        <textarea
          v-if="step === 'message' || step === 'sending'"
          ref="field"
          v-model="entry"
          rows="3"
          maxlength="3000"
          :placeholder="placeholder"
          :aria-label="placeholder"
          :disabled="step === 'sending'"
          @keydown="onKeydown"
        ></textarea>
        <input
          v-else
          ref="field"
          v-model="entry"
          :type="step === 'email' ? 'email' : 'text'"
          :autocomplete="step === 'name' ? 'name' : step === 'email' ? 'email' : 'off'"
          :maxlength="step === 'chat' ? 300 : step === 'name' ? 100 : 200"
          :placeholder="placeholder"
          :aria-label="placeholder"
          enterkeyhint="send"
        />
        <button
          type="submit"
          class="bot-send"
          :disabled="!entry.trim() || typing || step === 'sending'"
        >
          <span class="sr-only">{{ t('bot.send') }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
        </button>
      </div>
      <button
        v-if="step === 'name' || step === 'email' || step === 'message'"
        type="button"
        class="bot-cancel"
        @click="cancel"
      >
        {{ t('bot.cancel') }}
      </button>
      <label class="bot-trap" aria-hidden="true">
        Website <input v-model="trap" name="website" tabindex="-1" autocomplete="off" />
      </label>
    </form>

    <nav class="bot-elsewhere" :aria-label="t('bot.elsewhere')">
      <a href="https://www.linkedin.com/in/qdebeauchesne/">LinkedIn</a>
      <a href="https://github.com/ffmad">GitHub</a>
      <a href="https://x.com/quentinbdb">X</a>
    </nav>
  </div>
</template>
