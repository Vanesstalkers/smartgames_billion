<template>
  <roulette
    v-bind="$attrs"
    v-on="$listeners"
    indicator-mode="arrow"
    :wheel-image-url="domainRouletteWheel"
    :wheel-extra-style="{ rotate: '7deg' }"
    :stop-slot-gutter-px="stopSlotGutterPx"
    :stop-outward-offset-ratio="stopOutwardOffsetRatio"
    :roulette-id="resolvedRouletteId"
  >
    <template #stop="{ sectorAngleDeg }">
      <div :style="{ transform: `rotate(${-sectorAngleDeg}deg)` }">
        <chip
          :chip-id="rouletteStopChipId"
          :value="rouletteValue"
          :size="48"
          subtype="roulette-stop"
          custom-class="roulette-stop-chip"
        />
      </div>
    </template>
  </roulette>
</template>

<script>
import { inject } from 'vue';

import roulette from '~/lib/game/front/components/roulette.vue';
import chip from './chip.vue';
import domainRouletteWheel from '../assets/roulette.png';

export default {
  name: 'domain-roulette',
  components: {
    roulette,
    chip,
  },
  inheritAttrs: false,
  setup() {
    return inject('gameGlobals');
  },
  props: {
    /** Если не задан — берётся единственная рулетка из `game.rouletteMap`. */
    rouletteId: { type: String, default: '' },
    /** Запас вокруг колеса, чтобы слот `stop` мог выпирать за диск без обрезки. */
    stopSlotGutterPx: { type: Number, default: 40 },
    /** Доп. вынос якоря слота наружу от обода (доля от `size`). */
    stopOutwardOffsetRatio: { type: Number, default: 0.07 },
  },
  data() {
    return {
      domainRouletteWheel,
    };
  },
  computed: {
    store() {
      return this.getStore() || {};
    },
    resolvedRouletteId() {
      if (this.rouletteId) return this.rouletteId;
      return Object.keys(this.getGame()?.rouletteMap || {})[0] || '';
    },
    rouletteRecord() {
      const rid = this.resolvedRouletteId;
      return rid ? this.store.roulette?.[rid] : null;
    },
    rouletteValue() {
      return this.rouletteRecord?.value;
    },
    /** id фишки маркера из itemMap колоды, на которую ссылается roulette.deckMap (подтип selected). */
    rouletteStopChipId() {
      const r = this.rouletteRecord;
      if (!r?.deckMap) return '';
      const deckIds = Object.keys(r.deckMap);
      const deckId =
        deckIds.find((id) => this.store.deck?.[id]?.subtype === 'selected') ?? deckIds[0];
      if (!deckId) return '';
      const itemMap = this.store.deck?.[deckId]?.itemMap;
      if (!itemMap) return '';
      const chipId = Object.keys(itemMap).find((id) => itemMap[id]);
      return chipId || '';
    },
  },
};
</script>
