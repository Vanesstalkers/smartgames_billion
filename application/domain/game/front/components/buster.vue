<template>
  <base-card v-bind="baseCardBindings" v-on="$listeners" :class="{ 'buster-card': true, selectable: isSelectable }">
  </base-card>
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
    baseCardBindings() {
      return {
        ...this.$attrs,
        ...this.$props,
        name: this.card?.name || this.card?.subtype || '',
        subtype: this.card?.subtype || '',
      };
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

  &:before {
    box-shadow: inset 0px 10px 20px 0px #111;
    padding: 4px 0px 0px 0px;
    font-size: 10px;
    text-shadow: none;
    color: white;
    top: 0px;
    position: absolute;
    width: 100%;
    text-align: center;
    height: 20px;
    border-radius: 10px;
  }
}
</style>
