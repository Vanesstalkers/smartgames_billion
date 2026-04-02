<template>
  <roulette
    v-bind="$attrs"
    v-on="$listeners"
    indicator-mode="arrow"
    :wheel-image-url="domainRouletteWheel"
    :wheel-extra-style="{ rotate: '7deg' }"
    :stop-slot-gutter-px="stopSlotGutterPx"
    :stop-outward-offset-ratio="stopOutwardOffsetRatio"
    :roulette-id="rouletteId"
  >
    <template #stop="{ sectorAngleDeg }">
      <div v-if="rouletteChipId" :style="{ transform: `rotate(${-sectorAngleDeg}deg)` }">
        <chip
          :chip-id="rouletteChipId"
          :value="rouletteValue"
          :size="48"
          subtype="roulette-stop"
          :on-click="useRouletteChip"
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
    game() {
      return this.getGame();
    },
    rouletteId() {
      return Object.keys(this.game.rouletteMap)[0] || '';
    },
    roulette() {
      return this.game.store.roulette[this.rouletteId] || {};
    },
    rouletteValue() {
      return this.roulette?.value;
    },
    rouletteChipId() {
      const deckId = Object.keys(this.roulette.deckMap)[0];
      return Object.keys(this.store.deck?.[deckId]?.itemMap || {})[0] || '';
    },
  },
  methods: {
    async useRouletteChip() {
      if (!this.sessionPlayerIsActive()) return;
      await this.handleGameApi({ name: 'useRouletteChip', data: { chipId: this.rouletteChipId } }).then(() => {
        this.$set(this.gameCustom, 'selectedChipId', this.rouletteChipId);
      });
    },
  },
};
</script>
<style scoped lang="scss">
.roulette {
  .chip.selectable {
    box-shadow: 0 0 20px 8px yellow !important;
    border-radius: 50%;
    &:hover {
      box-shadow: none !important;
      width: 60px !important;
      height: 60px !important;
    }
  }
}
</style>
