<template>
  <chip-component
    v-bind="$attrs"
    v-on="$listeners"
    :sprite-image-url="domainChipsSprite"
    :sprite-frame-count="domainChipsFrameCount"
    :chip-id="chipId || undefined"
    :value="innerFrameValue"
    :on-click="onClick"
  />
</template>

<script>
import { inject } from 'vue';

import chipComponent from '~/lib/game/front/components/chip.vue';
import domainChipsSprite from '../assets/chips.png';

/** Порядок отраслей в `chips.png` (префикс ключа сектора рулетки до `-`). */
export const DOMAIN_CHIP_SECTOR_ORDER = [
  ...['light', 'art', 'construction', 'electronic', 'finance', 'distribution'],
  ...['it', 'media', 'chemistry', 'mining', 'engineering'],
];

/** Кадр 1…N в спрайте фишек по ключу сектора рулетки. */
export function rouletteSectorKeyToChipFrame(value) {
  const key = value == null ? '' : String(value);
  const idx = DOMAIN_CHIP_SECTOR_ORDER.indexOf(key);
  return idx >= 0 ? idx + 1 : 1;
}

export default {
  name: 'domain-chip',
  components: {
    chipComponent,
  },
  inheritAttrs: false,
  setup() {
    return inject('gameGlobals');
  },
  props: {
    chipId: {
      type: String,
      default: '',
    },
    /**
     * Без `chipId`: ключ сектора рулетки (строка) → кадр по `DOMAIN_CHIP_SECTOR_ORDER`;
     * число — номер кадра в спрайте (как у lib).
     */
    value: {
      type: [String, Number],
      default: 1,
    },
    onClick: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      domainChipsSprite,
      /** Кадров в `chips.png` (одна горизонтальная полоса). */
      domainChipsFrameCount: 11,
    };
  },
  computed: {
    store() {
      return this.getStore() || {};
    },
    /** Данные фишки из стора при `chipId` (значение сектора рулетки — строка). */
    chip() {
      return this.store.chip?.[this.chipId] || {};
    },
    innerFrameValue() {
      if (this.chipId) {
        const raw = this.chip?.value;
        if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
        return rouletteSectorKeyToChipFrame(raw);
      }
      if (typeof this.value === 'number' && Number.isFinite(this.value)) return this.value;
      return rouletteSectorKeyToChipFrame(this.value);
    },
  },
};
</script>