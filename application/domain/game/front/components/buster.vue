<template>
  <div :class="{ 'buster-card': true, selectable: isSelectable }">
    <base-card :canPlay="!isDisabled" v-bind="baseCardBindings" v-on="$listeners" @click.native.stop="triggerCardEvent">
      <template #additional v-if="chip._id">
        <chip :chip-id="chip._id" :value="chip.value" :size="48" subtype="roulette-stop" />
      </template>
    </base-card>
  </div>
</template>

<script>
import { inject } from 'vue';

import baseCard from '~/lib/game/front/components/card.vue';
import chip from './chip.vue';
export default {
  name: 'buster-card',
  inheritAttrs: false,
  components: {
    baseCard,
    chip,
  },
  props: {
    cardId: String,
    cardData: Object,
    canPlay: Boolean,
    myCard: Boolean,
    deckEvent: Function,
    deck: Object,
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
      if (this.cardData) {
        if (!this.cardData.eventData) this.cardData.eventData = {};
        return this.cardData;
      }
      const card = this.store.card?.[this.cardId];
      return card?._id ? card : { _id: this.cardId };
    },
    chip() {
      return this.store.chip?.[this.card?.eventData?.chipId] || {};
    },
    isSelectable() {
      return this.player.eventData.buster?.[this.cardId]?.selectable;
    },
    isDisabled() {
      return this.card.played || this.card.disabled || this.sessionPlayer().eventData.playDisabled;
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
    async triggerCardEvent() {
      console.log('triggerCardEvent', this.deckEvent);
      if (this.deckEvent) {
        await this.deckEvent(this.deck);
        return;
      }
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

  .card-event {
    width: 100%;
    height: 100%;
    &:before {
      display: none;
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

  .chip {
    filter: none;
  }
}
</style>
