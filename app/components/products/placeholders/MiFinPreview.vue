<script setup lang="ts">
import { formatNumber } from '~/utils/text'

/**
 * PROVISIONAL. Coded illustration of MiFin, used until real product
 * screenshots exist. It shows the verified areas (income and expenses,
 * shared groups and settlements, suggestions). Amounts are illustrative
 * and carry no currency. All text comes from the locale files.
 */
const { t, locale } = useI18n()
const m = (k: string, p?: Record<string, string>) => t(`mock.mifin.${k}`, p ?? {})
const n = (v: number) => formatNumber(v, locale.value)

const categories = computed(() => [
  { label: m('home'), pct: 64, tone: 'a' },
  { label: m('food'), pct: 46, tone: 'b' },
  { label: m('transport'), pct: 22, tone: 'c' },
])
const transactions = computed(() => [
  { label: m('tx1'), amount: 42000, in: true, tone: 'a' },
  { label: m('tx2'), amount: 1850, in: false, tone: 'b' },
  { label: m('tx3'), amount: 320, in: false, tone: 'c' },
])
</script>

<template>
  <div class="mock" aria-hidden="true">
    <section class="month" data-layer>
      <header class="month__head">
        <span class="month__name">{{ m('month') }}</span>
        <span class="chev"><i /><i /></span>
      </header>
      <div class="totals">
        <div class="total">
          <span class="total__label"><span class="dot dot--in" />{{ m('income') }}</span>
          <span class="total__val">{{ n(48500) }}</span>
        </div>
        <div class="total">
          <span class="total__label"><span class="dot dot--out" />{{ m('expenses') }}</span>
          <span class="total__val">{{ n(31260) }}</span>
        </div>
      </div>
      <div class="ring">
        <svg viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#e6efe9" stroke-width="5" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#0b8a5a" stroke-width="5" stroke-dasharray="64 36" stroke-dashoffset="25" stroke-linecap="round" />
        </svg>
        <ul class="cats">
          <li v-for="c in categories" :key="c.label">
            <span class="cats__label">{{ c.label }}</span>
            <span class="cats__bar"><span :class="`tone-${c.tone}`" :style="{ inlineSize: c.pct + '%' }" /></span>
          </li>
        </ul>
      </div>
      <div class="recent">
        <span class="recent__title">{{ m('recent') }}</span>
        <div v-for="tx in transactions" :key="tx.label" class="tx">
          <span class="tx__ico" :class="`tone-${tx.tone}`" />
          <span class="tx__label">{{ tx.label }}</span>
          <b :class="tx.in ? 'pos' : ''" dir="ltr">{{ tx.in ? '+' : '−' }}{{ n(tx.amount) }}</b>
        </div>
      </div>
    </section>

    <section class="group" data-layer>
      <header class="group__head">
        <span class="group__emoji" />
        <span class="group__title"><b>{{ m('groupTitle') }}</b><small>{{ m('members') }}</small></span>
      </header>
      <div class="bal">
        <i>S</i><span>{{ m('owesYou', { name: m('n1') }) }}</span><b class="pos">{{ n(1240) }}</b>
      </div>
      <div class="bal">
        <i>A</i><span>{{ m('youOwe', { name: m('n2') }) }}</span><b class="neg">{{ n(860) }}</b>
      </div>
      <span class="settle">{{ m('settle') }}</span>
    </section>

    <section class="tip" data-layer>
      <span class="tip__icon" />
      <span class="tip__text"><b>{{ m('suggestionTitle') }}</b>{{ m('suggestion') }}</span>
    </section>
  </div>
</template>

<style scoped>
.mock {
  --green: #0b8a5a;
  --green-soft: #dcf1e6;
  --ink: #15201b;
  --mute: #66726c;
  --hair: #e3e9e5;
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 1.1em;
  padding: 1.6em;
  font-size: 16px;
  line-height: 1.35;
  color: var(--ink);
  background: linear-gradient(160deg, #f3f7f4, #eaf1ec);
  font-family: var(--font-sans);
  letter-spacing: 0;
  user-select: none;
}
section { background: #fff; border-radius: 0.9em; box-shadow: 0 0 0 1px var(--hair), 0 0.3em 1em rgb(21 32 27 / 0.05); }

.month { grid-row: 1 / 3; padding: 1.3em; display: grid; gap: 1.2em; align-content: start; }
.month__head { display: flex; justify-content: space-between; align-items: center; }
.month__name { font-size: 1.3em; font-weight: 650; }
.chev { display: flex; gap: 0.4em; }
.chev i { width: 1.6em; height: 1.6em; border-radius: 50%; background: #f1f5f2; }
.totals { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8em; }
.total { display: grid; gap: 0.3em; padding: 0.8em; border-radius: 0.7em; background: #f6f9f7; }
.total__label { display: flex; align-items: center; gap: 0.45em; font-size: 0.78em; color: var(--mute); }
.total__val { font-size: 1.45em; font-weight: 650; font-variant-numeric: tabular-nums; }
.dot { width: 0.6em; height: 0.6em; border-radius: 50%; }
.dot--in { background: var(--green); }
.dot--out { background: #e0884d; }
.ring { display: grid; grid-template-columns: 7.5em 1fr; gap: 1.2em; align-items: center; }
.ring svg { width: 100%; transform: rotate(-90deg); }
.cats { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75em; }
.cats li { display: grid; gap: 0.3em; }
.cats__label { font-size: 0.8em; color: var(--mute); }
.cats__bar { height: 0.5em; border-radius: 1em; background: #eef3f0; overflow: hidden; }
.cats__bar span { display: block; height: 100%; border-radius: 1em; }
.tone-a { background: var(--green); }
.tone-b { background: #e0884d; }
.tone-c { background: #8fb9a6; }

.recent { display: grid; gap: 0.55em; padding-block-start: 0.9em; border-top: 1px solid var(--hair); }
.recent__title { font-size: 0.78em; font-weight: 650; color: var(--mute); }
.tx { display: grid; grid-template-columns: auto 1fr auto; gap: 0.7em; align-items: center; font-size: 0.82em; }
.tx__ico { width: 1.8em; height: 1.8em; border-radius: 0.5em; opacity: 0.25; }
.tx b { font-weight: 600; font-variant-numeric: tabular-nums; }

.group { padding: 1.1em 1.2em; display: grid; gap: 0.75em; align-content: start; }
.group__head { display: flex; gap: 0.7em; align-items: center; }
.group__emoji { width: 2.3em; height: 2.3em; border-radius: 0.6em; background: var(--green-soft); box-shadow: inset 0 0 0 0.55em #fff, inset 0 0 0 0.8em var(--green-soft); }
.group__title { display: grid; line-height: 1.25; }
.group__title b { font-size: 0.95em; font-weight: 650; }
.group__title small { font-size: 0.72em; color: var(--mute); }
.bal { display: grid; grid-template-columns: auto 1fr auto; gap: 0.6em; align-items: center; font-size: 0.8em; }
.bal i {
  display: grid; place-items: center; width: 2em; height: 2em; border-radius: 50%;
  font-style: normal; font-weight: 600; font-size: 0.85em; font-family: 'Instrument Sans Variable', sans-serif;
  background: #f6e3cf; color: #7a4a16;
}
.bal + .bal i { background: #dfe3f3; color: #3a4170; }
.bal b { font-variant-numeric: tabular-nums; font-weight: 650; }
.pos { color: var(--green); }
.neg { color: #b4562a; }
.settle {
  justify-self: start;
  padding: 0.45em 1.1em; border-radius: 2em;
  background: var(--ink); color: #fff; font-size: 0.75em; font-weight: 600;
}

.tip { padding: 1em 1.1em; display: flex; gap: 0.8em; align-items: flex-start; align-self: start; background: #10241b; color: #e9f2ed; }
.tip__icon { flex: none; width: 1.9em; height: 1.9em; border-radius: 50%; background: radial-gradient(circle at 50% 50%, #7fe0b3 0 28%, transparent 30%), #1d3d2f; }
.tip__text { display: grid; gap: 0.25em; font-size: 0.8em; line-height: 1.45; }
.tip__text b { font-size: 0.85em; color: #7fe0b3; font-weight: 600; }
</style>
