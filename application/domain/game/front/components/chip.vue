<template>
  <chip-component
    v-bind="$attrs"
    v-on="$listeners"
    :sprite-image-url="domainChipsSprite"
    :sprite-frame-count="domainChipsFrameCount"
    :chip-id="chipId || undefined"
    :value="innerFrameValue"
    :on-click="canPlay ? onClick : null"
    :ownerId="chip.ownerId"
    :class="{ canPlay }"
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
export function rouletteSectorKeyToChipFrame(value, chipId) {
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
    inMyHand: {
      type: Boolean,
      default: false,
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
    player() {
      return this.sessionPlayer();
    },
    /** Данные фишки из стора при `chipId` (значение сектора рулетки — строка). */
    chip() {
      return this.store.chip?.[this.chipId] || {};
    },
    isSelectable() {
      return this.sessionPlayerIsActive() && this.player.eventData.chip?.[this.chipId]?.selectable;
    },
    canPlay() {
      return (
        this.sessionPlayerIsActive() &&
        ((this.inMyHand && !this.chip.ownerId) || this.chip.ownerId === this.gameState.sessionPlayerId || this.isSelectable)
      );
    },
    innerFrameValue() {
      if (this.chipId && this.chipId !== 'fake') {
        const raw = this.chip?.value;
        if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
        return rouletteSectorKeyToChipFrame(raw);
      }
      if (typeof this.value === 'number' && Number.isFinite(this.value)) return this.value;
      return rouletteSectorKeyToChipFrame(this.value, this.chipId);
    },
  },
};
</script>
<style scoped lang="scss">
.chip:not(.canPlay),
.chip[ownerId]:not(.selectable):not(.canPlay) {
  filter: brightness(0.5);
}
</style>
