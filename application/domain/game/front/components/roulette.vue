<template>
  <roulette
    v-bind="$attrs"
    v-on="$listeners"
    indicator-mode="arrow"
    :wheel-image-url="domainRouletteWheel"
    :wheel-extra-style="{ rotate: '7deg' }"
  />
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
  data() {
    return {
      domainRouletteWheel,
    };
  },
};
</script>
