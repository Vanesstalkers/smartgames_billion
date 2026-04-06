<template>
  <div
    :class="{ 'buster-card': true, selectable: isSelectable }"
    :style="getCustomStyle"
    v-on:click.stop="playCard"
  >
  </div>
</template>

<script>
import { inject } from 'vue';

import baseCard from '~/lib/game/front/components/card.vue';

export default {
  name: 'buster-card',
  inheritAttrs: false,
  components: {
    baseCard,
  },
  props: {
    cardId: String,
    canPlay: Boolean,
    myCard: Boolean,
  },
  setup() {
    return inject('gameGlobals');
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      return this.getStore() || {};
    },
    game() {
      return this.getGame();
    },
    player() {
      return this.sessionPlayer();
    },
    card() {
      const card = this.store.card?.[this.cardId];
      return card?._id ? card : { _id: this.cardId };
    },
    isSelectable() {
      return this.player.eventData.buster?.[this.cardId]?.selectable;
    },
    getCustomStyle() {
      return this.getCardCustomStyle(this);
    },
  },
  methods: {
    async playCard() {
      await this.handleGameApi(
        {
          name: 'playCard',
          data: {
            cardId: this.cardId,
            targetPlayerId: this.$parent.playerId,
          },
        },
        {
          onSuccess: () => {
            this.preventDoubleClick = false;
          },
          onError: () => {
            this.preventDoubleClick = false;
          },
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.buster-card {
  width: 94px;
  height: 130px;
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
