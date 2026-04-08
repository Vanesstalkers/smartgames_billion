<template>
  <div class="company-card">
    <div
      :class="{ 'company-card-background': true, played: card.played, selected: isSelected }"
      :style="{ backgroundImage: getCustomStyle.backgroundImage }"
    />
    <base-card
      v-bind="baseCardBindings"
      v-on="$listeners"
      @click.native.stop="triggerCardEvent"
      :class="{ selectable: isSelectable }"
    >
      <template #additional>
        <div v-if="innerChipIds.length || outerChipIds.length" class="chips-overlay">
          <div class="chip-lane chip-lane-inner">
            <chip
              v-for="chipId in innerChipIds"
              :key="chipId"
              :chip-id="chipId"
              :size="26"
              :on-click="() => triggerChipEvent(chipId)"
              :in-my-hand="myCard"
            />
          </div>
          <div :class="['chip-lane', 'chip-lane-outer', { selectable: outedDeckSelectable }]">
            <chip
              v-for="chipId in outerChipIds"
              :key="chipId"
              :chip-id="chipId"
              :size="26"
              :on-click="() => triggerChipEvent(chipId)"
              :in-my-hand="myCard"
            />
            <chip
              v-if="outerChipIds.length === 0 && gameCustom.selectedChipId"
              :chip-id="gameCustom.selectedChipId"
              :size="26"
              class="fake-chip"
              :on-click="() => triggerOutedDeckEvent()"
            />
          </div>
        </div>
      </template>
    </base-card>
  </div>
</template>

<script>
import { inject } from 'vue';

import baseCard from '~/lib/game/front/components/card.vue';
import chip from './chip.vue';

export default {
  name: 'company-card',
  inheritAttrs: false,
  components: {
    baseCard,
    chip,
  },
  props: {
    customStyle: {
      type: Object,
      default: () => null,
    },
    cardId: String,
    canPlay: Boolean,
    myCard: Boolean,
    playerActive: {
      type: Boolean,
      default: true,
    },
    cardData: Object,
    deckEvent: Function,
    deck: Object,
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
      return card?._id ? card : { _id: this.cardId, eventData: {} };
    },
    cardDecks() {
      const deckIds = Object.keys(this.card.deckMap || {});
      return deckIds.map((id) => this.store.deck?.[id]);
    },
    outedDeck() {
      return this.cardDecks.find((d) => d.subtype === 'outer');
    },
    isSelected() {
      return this.cardId === this.gameCustom.selectedCard;
    },
    isSelectable() {
      return this.player.eventData.company?.[this.cardId]?.selectable;
    },
    outedDeckSelectable() {
      return this.player.eventData.deck?.[this.outedDeck._id]?.selectable;
    },
    innerChipIds() {
      return this.getChipIdsBySubtype('inner');
    },
    outerChipIds() {
      return this.getChipIdsBySubtype('outer');
    },
    getCustomStyle() {
      return this.getCardCustomStyle(this);
    },
  },
  methods: {
    async triggerCardEvent() {
      if (this.deckEvent) {
        await this.deckEvent(this.deck);
        return;
      }

      if (!this.isSelectable) return;
      await this.handleGameApi({
        name: 'eventTrigger',
        data: { eventData: { targetId: this.cardId } },
      });
    },
    isChipSelectable(chipId) {
      return this.player.eventData.chip?.[chipId]?.selectable;
    },
    async triggerChipEvent(chipId) {
      if (this.isChipSelectable(chipId)) {
        await this.handleGameApi({
          name: 'eventTrigger',
          data: { eventData: { targetId: chipId } },
        });
      } else {
        await this.handleGameApi({ name: 'useChip', data: { chipId } });
      }
    },
    getChipIdsBySubtype(subtype) {
      const targetDeck = this.cardDecks.find((deck) => deck.subtype === subtype);
      if (!targetDeck?.itemMap) return [];
      return Object.entries(targetDeck.itemMap)
        .filter(([, meta]) => Boolean(meta))
        .map(([id]) => id);
    },
    async triggerOutedDeckEvent() {
      if (!this.outedDeckSelectable) return;

      await this.handleGameApi({
        name: 'eventTrigger',
        data: { eventData: { targetId: this.outedDeck._id } },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.company-card {
  position: relative;
  background-image: url(@/assets/clear-black-back.png);
  border-radius: 10px;

  .company-card-background {
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-size: cover;
    position: absolute;
    // z-index: 1;
    &.played {
      filter: grayscale(1);
    }

    &.selected {
      z-index: 1;
    }
  }

  .card-event {
    background-image: none !important;
    &.played {
      filter: none !important;
    }

    .chip.canPlay {
      border-radius: 12px;

      &:hover {
        cursor: pointer;
        margin-left: -2px;
        margin-top: -2px;
        padding-bottom: 2px;
        box-shadow: 1px 2px 2px 1px black !important;

        &:active {
          margin-left: -1px;
          margin-top: -1px;
          box-shadow: 1px 1px 2px 1px black !important;
        }
      }
    }

    &:before {
      position: absolute;
      top: 0px;
      left: 0px;
      font-size: 30px;
      text-shadow: none;
      text-shadow: 2px 1px 0 #fff;
    }
  }
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
    top: 108px;
    left: 11px;
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
    top: -16px;
    left: 16px;
    width: 40px;

    .fake-chip {
      display: none;
    }
    &.selectable {
      box-shadow: none !important;

      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 26px;
        height: 26px;
        border-radius: 10px;
        box-shadow: inset 0 0 8px 4px yellow !important;
      }

      &:hover {
        box-shadow: none !important;
        &:after {
          display: none !important;
        }
        .fake-chip {
          display: block;
          opacity: 0.7;
        }
      }
    }
  }
}
</style>
