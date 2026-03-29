<template>
  <roulette
    v-bind="$attrs"
    v-on="$listeners"
    indicator-mode="arrow"
    :wheel-image-url="domainRouletteWheel"
    :wheel-extra-style="{ rotate: '7deg' }"
    :stop-slot-gutter-px="stopSlotGutterPx"
    :stop-outward-offset-ratio="stopOutwardOffsetRatio"
  >
    <template v-if="hasStopSlot" #stop="slotProps">
      <slot name="stop" v-bind="slotProps" />
    </template>
  </roulette>
</template>

<script>
import roulette from '~/lib/game/front/components/roulette.vue';
import domainRouletteWheel from '../assets/roulette.png';

export default {
  name: 'domain-roulette',
  components: {
    roulette,
  },
  inheritAttrs: false,
  props: {
    /** Запас вокруг колеса, чтобы слот `stop` мог выпирать за диск без обрезки. */
    stopSlotGutterPx: { type: Number, default: 40 },
    /** Доп. вынос якоря слота наружу от обода (доля от `size`). */
    stopOutwardOffsetRatio: { type: Number, default: 0.07 },
  },
  computed: {
    hasStopSlot() {
      return Boolean(
        (this.$scopedSlots && this.$scopedSlots.stop) || (this.$slots && this.$slots.stop)
      );
    },
  },
  data() {
    return {
      domainRouletteWheel,
    };
  },
};
</script>
