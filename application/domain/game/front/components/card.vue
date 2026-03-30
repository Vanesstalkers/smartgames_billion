<template>
  <div class="domain-card">
    <base-card class="custom-card-background" v-bind="baseCardBindings" v-on="$listeners" />

    <div v-if="innerChipIds.length || outerChipIds.length" class="chips-overlay">
      <div class="chip-lane chip-lane-inner">
        <chip v-for="chipId in innerChipIds" :key="chipId" :chip-id="chipId" :size="40" />
      </div>
      <div class="chip-lane chip-lane-outer">
        <chip v-for="chipId in outerChipIds" :key="chipId" :chip-id="chipId" :size="40" />
        <chip v-if="outerChipIds.length === 0" :chip-id="'fake'" :size="40" />
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';

import baseCard from '~/lib/game/front/components/card.vue';
import chip from './chip.vue';

export default {
  name: 'domain-card',
  inheritAttrs: false,
  components: {
    baseCard,
    chip,
  },
  props: {
    playCard: Function,
    customStyle: {
      type: Object,
      default: () => null,
    },
    cardId: String,
    canPlay: Boolean,
    playerActive: {
      type: Boolean,
      default: true,
    },
    cardData: Object,
    cardGroup: String,
    imgExt: String,
    imgFullPath: String,
  },
  setup() {
    return inject('gameGlobals');
  },
  computed: {
    baseCardBindings() {
      return {
        ...this.$attrs,
        ...this.$props,
        name: this.card?.name || this.card?.subtype || '',
        subtype: this.card?.subtype || '',
      };
    },
    store() {
      return this.getStore() || {};
    },
    card() {
      if (this.cardData) {
        if (!this.cardData.eventData) this.cardData.eventData = {};
        return this.cardData;
      }
      const card = this.store.card?.[this.cardId];
      return card?._id ? card : { _id: this.cardId, eventData: {} };
    },
    relatedDecks() {
      const deckIds = Object.keys(this.card.deckMap || {});
      return deckIds.map((id) => this.store.deck?.[id]).filter(Boolean);
    },
    innerChipIds() {
      return this.getChipIdsBySubtype('inner');
    },
    outerChipIds() {
      return this.getChipIdsBySubtype('outer');
    },
  },
  methods: {
    getChipIdsBySubtype(subtype) {
      const targetDeck = this.relatedDecks.find((deck) => deck.subtype === subtype);
      if (!targetDeck?.itemMap) return [];
      return Object.entries(targetDeck.itemMap)
        .filter(([, meta]) => Boolean(meta))
        .map(([id]) => id);
    },
  },
};
</script>

<style lang="scss" scoped>
.domain-card {
  position: relative;
}

.chips-overlay {
  position: absolute;
  top: 0px;
  left: 0px;
}

.chip-lane {
  display: flex;
  &.chip-lane-inner {
    position: absolute;
    top: 156px;
    left: 16px;
    flex-wrap: wrap;
    width: 40px;

    .chip:nth-child(4) {
      position: absolute;
      bottom: -80px;
      right: -72px;
    }
  }
  &.chip-lane-outer {
    position: absolute;
    top: -22px;
    left: 24px;
    width: 40px;

    &.selectable {
      border-radius: 16px;
      &:hover {
        box-shadow: inset 0 0 10px 4px yellow !important;
      }
    }
  }
}
</style>
