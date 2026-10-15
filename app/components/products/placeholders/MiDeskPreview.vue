<script setup lang="ts">
import { formatNumber } from '~/utils/text'

/**
 * PROVISIONAL. Coded illustration of a MiDesk workspace, used until real
 * product screenshots exist. It only shows the verified areas (tasks,
 * finance, people) and contains no metrics or claims. All text comes from
 * the locale files, so it is legible and localized.
 *
 * Sizing: laid out at 1000×625 px with a 16px base, then scaled as one
 * image by ProductVisual.
 */
const { t, locale } = useI18n()
const m = (k: string) => t(`mock.midesk.${k}`)

const columns = computed(() => [
  {
    title: m('todo'),
    tone: 'todo',
    cards: [
      { title: m('t1'), tag: m('finance'), who: 'S' },
      { title: m('t4'), tag: m('workspace'), who: 'O' },
    ],
  },
  {
    title: m('doing'),
    tone: 'doing',
    cards: [
      { title: m('t2'), tag: m('people'), who: 'L' },
      { title: m('t5'), tag: m('workspace'), who: 'O' },
    ],
  },
  { title: m('done'), tone: 'done', cards: [{ title: m('t3'), tag: m('finance'), who: 'S' }] },
])
const team = computed(() => [
  { name: m('p1'), role: m('r1'), i: 'L' },
  { name: m('p2'), role: m('r2'), i: 'O' },
  { name: m('p3'), role: m('r3'), i: 'S' },
])
</script>

<template>
  <div class="mock" aria-hidden="true">
    <aside class="side">
      <div class="side__ws"><span class="side__logo">M</span>{{ m('workspace') }}</div>
      <ul class="side__nav">
        <li><span class="ico" />{{ m('projects') }}</li>
        <li class="is-on"><span class="ico" />{{ m('tasks') }}</li>
        <li><span class="ico" />{{ m('finance') }}</li>
        <li><span class="ico" />{{ m('people') }}</li>
      </ul>
    </aside>

    <section class="main" data-layer>
      <header class="main__head">
        <span class="main__title">{{ m('board') }}</span>
        <span class="avatars"><i>L</i><i>O</i><i>S</i></span>
      </header>
      <div class="board">
        <div v-for="c in columns" :key="c.tone" class="col" :class="`col--${c.tone}`">
          <div class="col__title"><span class="col__dot" />{{ c.title }}<b>{{ formatNumber(c.cards.length, locale) }}</b></div>
          <div v-for="card in c.cards" :key="card.title" class="card">
            <span class="card__title">{{ card.title }}</span>
            <span class="card__meta"><span class="tag">{{ card.tag }}</span><i>{{ card.who }}</i></span>
          </div>
        </div>
      </div>
    </section>

    <aside class="rail">
      <div class="panel" data-layer>
        <div class="panel__title">{{ m('financeTitle') }}</div>
        <div class="flow">
          <span class="flow__label">{{ m('incoming') }}</span>
          <span class="flow__bar"><span class="flow__fill flow__fill--in" /></span>
        </div>
        <div class="flow">
          <span class="flow__label">{{ m('outgoing') }}</span>
          <span class="flow__bar"><span class="flow__fill flow__fill--out" /></span>
        </div>
        <div class="spark">
          <span v-for="h in [38, 52, 44, 63, 58, 72, 66]" :key="h" :style="{ height: h + '%' }" />
        </div>
      </div>
      <div class="panel" data-layer>
        <div class="panel__title">{{ m('teamTitle') }}</div>
        <div v-for="p in team" :key="p.name" class="person">
          <i>{{ p.i }}</i>
          <span><b>{{ p.name }}</b><small>{{ p.role }}</small></span>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.mock {
  --blue: #2f54eb;
  --blue-soft: #e4e9fd;
  --ink: #1b1d26;
  --mute: #6b6f80;
  --hair: #e7e8ee;
  --bg: #f6f7fa;
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 17% 1fr 25%;
  font-size: 16px;
  line-height: 1.35;
  color: var(--ink);
  background: var(--bg);
  font-family: var(--font-sans);
  letter-spacing: 0;
  user-select: none;
}
.side {
  padding: 1.4em 1em;
  background: #fff;
  border-inline-end: 1px solid var(--hair);
}
.side__ws { display: flex; align-items: center; gap: 0.6em; font-weight: 600; font-size: 0.95em; margin-block-end: 1.6em; }
.side__logo {
  display: grid; place-items: center;
  width: 1.8em; height: 1.8em; border-radius: 0.45em;
  background: var(--blue); color: #fff; font-size: 0.85em; font-family: 'Instrument Sans Variable', sans-serif;
}
.side__nav { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25em; }
.side__nav li {
  display: flex; align-items: center; gap: 0.6em;
  padding: 0.55em 0.65em; border-radius: 0.5em;
  font-size: 0.9em; color: var(--mute);
}
.side__nav li.is-on { background: var(--blue-soft); color: var(--blue); font-weight: 600; }
.ico { width: 0.9em; height: 0.9em; border-radius: 0.25em; border: 1.5px solid currentColor; opacity: 0.8; }

.main { padding: 1.4em 1.3em; min-width: 0; }
.main__head { display: flex; align-items: center; justify-content: space-between; margin-block-end: 1.2em; }
.main__title { font-weight: 650; font-size: 1.25em; }
.avatars { display: flex; }
.avatars i, .card__meta i, .person i {
  display: grid; place-items: center;
  width: 1.8em; height: 1.8em; border-radius: 50%;
  font-style: normal; font-size: 0.72em; font-weight: 600;
  font-family: 'Instrument Sans Variable', sans-serif;
  background: #dfe3f3; color: #3a4170; border: 2px solid #fff;
}
.avatars i + i { margin-inline-start: -0.5em; }
.avatars i:nth-child(2), .person:nth-of-type(2) i { background: #f6e3cf; color: #7a4a16; }
.avatars i:nth-child(3), .person:nth-of-type(3) i { background: #d8efe4; color: #1f6346; }

.board { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8em; }
.col { display: grid; gap: 0.6em; align-content: start; }
.col__title { display: flex; align-items: center; gap: 0.5em; font-size: 0.82em; font-weight: 600; color: var(--mute); padding-block-end: 0.2em; }
.col__title b { margin-inline-start: auto; font-weight: 500; }
.col__dot { width: 0.6em; height: 0.6em; border-radius: 50%; background: #b9bdcc; }
.col--doing .col__dot { background: var(--blue); }
.col--done .col__dot { background: #2fa36b; }
.card {
  display: grid; gap: 0.9em;
  padding: 0.85em 0.9em;
  background: #fff; border-radius: 0.6em;
  box-shadow: 0 0 0 1px var(--hair), 0 0.15em 0.4em rgb(27 29 38 / 0.04);
}
.card__title { font-size: 0.88em; font-weight: 550; }
.col--done .card__title { color: var(--mute); text-decoration: line-through; text-decoration-color: #c4c7d3; }
.card__meta { display: flex; align-items: center; justify-content: space-between; }
.card__meta i { border: 0; width: 1.6em; height: 1.6em; }
.tag { font-size: 0.72em; padding: 0.2em 0.6em; border-radius: 1em; background: var(--bg); color: var(--mute); }

.rail { padding: 1.4em 1.2em 1.4em 0; display: grid; gap: 0.9em; align-content: start; }
:root[dir='rtl'] .rail { padding: 1.4em 0 1.4em 1.2em; }
.panel {
  padding: 1em; background: #fff; border-radius: 0.7em;
  box-shadow: 0 0 0 1px var(--hair);
  display: grid; gap: 0.7em;
}
.panel__title { font-size: 0.82em; font-weight: 650; }
.flow { display: grid; gap: 0.3em; }
.flow__label { font-size: 0.72em; color: var(--mute); }
.flow__bar { height: 0.5em; border-radius: 1em; background: var(--bg); overflow: hidden; }
.flow__fill { display: block; height: 100%; border-radius: 1em; }
.flow__fill--in { width: 78%; background: var(--blue); }
.flow__fill--out { width: 52%; background: #a9b6f5; }
.spark { display: flex; align-items: flex-end; gap: 0.3em; height: 2.6em; }
.spark span { flex: 1; border-radius: 0.2em 0.2em 0 0; background: var(--blue-soft); }
.spark span:last-child { background: var(--blue); }
.person { display: flex; align-items: center; gap: 0.6em; }
.person i { width: 2em; height: 2em; border: 0; font-size: 0.75em; }
.person span { display: grid; line-height: 1.25; }
.person b { font-size: 0.8em; font-weight: 600; }
.person small { font-size: 0.7em; color: var(--mute); }
</style>
