<template>
  <chip
    v-bind="$attrs"
    v-on="$listeners"
    :sprite-image-url="domainChipsSprite"
    :sprite-frame-count="domainChipsFrameCount"
    :chip-id="chipId || undefined"
    :value="innerFrameValue"
  />
</template>

<script>
import chip from '~/lib/game/front/components/chip.vue';
import domainChipsSprite from '../assets/chips.png';

/** Порядок отраслей в `chips.png` (префикс ключа сектора рулетки до `-`). */
export const DOMAIN_CHIP_SECTOR_ORDER = [
  ...['light', 'art', 'construction', 'electronic', 'finance', 'distribution'],
  ...['it', 'media', 'chemistry', 'mining', 'engineering'],
];

/** Кадр 1…N в спрайте фишек по ключу сектора рулетки. */
export function rouletteSectorKeyToChipFrame(value) {
  const key = value == null ? '' : String(value);
  const prefix = key.split('-')[0];
  const idx = DOMAIN_CHIP_SECTOR_ORDER.indexOf(prefix);
  return idx >= 0 ? idx + 1 : 1;
}

export default {
  name: 'domain-chip',
  components: {
    chip,
  },
  inheritAttrs: false,
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
  },
  data() {
    return {
      domainChipsSprite,
      /** Кадров в `chips.png` (одна горизонтальная полоса). */
      domainChipsFrameCount: 11,
    };
  },
  computed: {
    innerFrameValue() {
      if (this.chipId) return 1;
      if (typeof this.value === 'number' && Number.isFinite(this.value)) return this.value;
      return rouletteSectorKeyToChipFrame(this.value);
    },
  },
};
</script>
