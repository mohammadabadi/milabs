<script setup lang="ts">
import { splitHeadline } from '~/utils/text'

/**
 * Heading whose words can be animated individually. Each word sits in an
 * overflow mask (.w) with an inner span (.wi) that motion code translates.
 * Without JavaScript or with reduced motion it is a normal heading.
 */
const props = withDefaults(defineProps<{ text: string; as?: 'h1' | 'h2' | 'h3' | 'p' }>(), { as: 'h2' })
const words = computed(() => splitHeadline(props.text))
</script>

<template>
  <component :is="as" class="split">
    <template v-for="(w, i) in words" :key="i">
      <span class="w"><span class="wi"><span :class="{ 'serif-accent': w.em }">{{ w.text }}</span>{{ w.tail }}</span></span>
      <template v-if="i < words.length - 1">{{ ' ' }}</template>
    </template>
  </component>
</template>

<style scoped>
.w {
  display: inline-block;
  overflow: clip;
  overflow-clip-margin: 0.12em;
  vertical-align: top;
  /* Room for descenders and Persian diacritics inside the mask */
  padding-block: 0.06em 0.1em;
  margin-block: -0.06em -0.1em;
}
.wi { display: inline-block; will-change: transform; }
.serif-accent { color: var(--accent-ink, inherit); }
</style>
