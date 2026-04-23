<template>
  <div
    v-if="player._id || viewer._id"
    :class="[
      'player',
      ...customClass,
      iam ? 'iam' : '',
      player.active ? 'active' : '',
      selected ? 'selected' : '',
      hovered ? 'hovered' : '',
    ]"
    @click="selectPlayer()"
    @mouseover="mouseOverPlayer()"
    @mouseleave="mouseLeavePlayer()"
  >
    <div class="inner-content">
      <div class="player-hands">
        <div class="hand-cards-list" ref="scrollbar">
          <div class="hand-cards" :style="{ width: handCardsWidth }">
            <company-card
              v-for="card in handCards"
              :key="card.id"
              :cardId="card.id"
              :cardGroup="'company'"
              :myCard="iam"
              :imgExt="'png'"
              :class="{ 'acquired-company': card.acquired }"
            />
          </div>
          <div v-if="busterCards.length > 0" class="buster-cards">
            <buster-card
              v-for="card in busterCards"
              :key="card.id"
              :cardId="card.id"
              :cardGroup="'buster'"
              :myCard="iam || isGameMaster()"
              :content="card.title"
              :imgExt="'png'"
              :canPlay="iam && sessionPlayerIsActive()"
              :_playCard="playBusterCard"
            />
          </div>
        </div>
      </div>
      <div v-if="busterCards.length > 0" class="buster-cards-counter">
        <buster-card
          class="deck-card-layer deck-card--top"
          :content="busterCards.length"
          :cardData="{
            played: false,
            group: 'buster',
          }"
          :imgExt="'png'"
          :myCard="true"
        />
      </div>
      <div class="workers">
        <slot name="worker" :playerId="playerId" :viewerId="viewerId" :iam="iam">
          <card-worker :playerId="playerId" :viewerId="viewerId" :iam="iam" :playerSelected="selected">
            <template #money="{ money } = {}">
              <div class="money">{{ money + '₽' }}</div>
            </template>
          </card-worker>
        </slot>
      </div>
      <div
        v-if="iam"
        :class="[
          'player-helper',
          staticHelper?.text ? 'new-tutorial' : '',
          helperChecked ? 'helper-checked' : '',
          `scale-${state.guiScale}`,
        ]"
      >
        <dialog-helper
          v-if="iam && (staticHelper?.text || staticHelper?.html)"
          style="display: block"
          :dialogStyle="{}"
          :customData="staticHelper"
          :action="action"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';
import { PerfectScrollbar } from 'vue2-perfect-scrollbar';

import companyCard from './company.vue';
import busterCard from './buster.vue';
import cardWorker from './cardWorker.vue';
import dialogHelper from '~/lib/helper/front/components/dialog.vue';

export default {
  components: {
    PerfectScrollbar,
    companyCard,
    busterCard,
    cardWorker,
    dialogHelper,
  },
  props: {
    customClass: Array,
    playerId: String,
    viewerId: String,
    iam: Boolean,
  },
  data() {
    return { helperVisible: false, helperChecked: false, selected: false, hovered: false };
  },
  watch: {
    'staticHelper.text': function (val) {
      if (val) this.helperChecked = false;
    },
    staticHelper: function (val) {
      if (val) this.helperChecked = false;
    },
  },

  setup() {
    return inject('gameGlobals');
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      return this.getStore();
    },
    game() {
      return this.getGame();
    },
    player() {
      return this.store.player?.[this.playerId] || {};
    },
    viewer() {
      return this.store.viewer?.[this.viewerId] || {};
    },
    staticHelper() {
      return this.player.staticHelper || this.viewer.staticHelper;
    },
    busterCards() {
      const deck = this.cardDecks.find((deck) => deck.subtype === 'buster');
      const cards = deck ? Object.keys(deck.itemMap).map((id) => ({ id, deck, ...this.store.card?.[id] })) : [];
      return cards;
    },
    cardDecks() {
      return this.deckIds.map((id) => this.store.deck?.[id] || {});
    },
    handCards() {
      return this.cardDecks
        .filter((deck) => deck.type === 'company')
        .filter(({ placement }) => placement !== 'table')
        .reduce((arr, deck) => {
          return arr.concat(
            Object.keys(deck.itemMap).map((id) => {
              return { id, deck, acquired: this.sessionPlayer().acquired?.company?.[id] };
            })
          );
        }, [])
        .sort((a, b) => (a.cardOrder > b.cardOrder ? -1 : 1));
    },
    deckIds() {
      return Object.keys(this.player.deckMap || {});
    },
    handCardsWidth() {
      return state.isMobile && state.isPortrait ? `${window.innerWidth - 80}px` : 'auto';
    },
  },
  methods: {
    selectPlayer() {
      if (this.iam) return;
      this.selected = !this.selected;
    },
    mouseOverPlayer() {
      this.hovered = true;
    },
    mouseLeavePlayer() {
      this.hovered = false;
    },
    async action(button) {
      console.log('action', { button, eventData: this.player.eventData });
      if (button.gameMasterAction) {
        await this.handleGameApi({ name: 'gm-dealAction', data: { ...button } });
      } else if (button.triggerEvent) {
        await this.handleGameApi({ name: 'eventTrigger', data: { eventData: { button } } });
      } else if (button.resetEvent) {
        await this.handleGameApi({ name: 'eventReset' });
      } else if (this.player.eventData?.deal) {
        await this.handleGameApi({ name: 'dealAction', data: { ...button } });
      }
    },
    async playBusterCard() {
      console.log('playBusterCard');
    },
    tutorialAction() {
      this.helperChecked = true;
      this.helperVisible = !this.helperVisible;
    },
  },
};
</script>

<style lang="scss">
.player:not(.iam) {
  position: relative;
  margin-top: 10px;
}

.player:not(.iam) > .inner-content {
  display: flex;
  align-items: flex-end;
  flex-direction: row-reverse;
}

#game.mobile-view.portrait-view .player:not(.iam) > .inner-content {
  flex-wrap: nowrap;
  flex-direction: row;
}

.player.iam > .inner-content {
  display: flex;
  align-items: flex-end;
  position: absolute;
  right: 0px;
  bottom: 0px;
  height: 0px;
}

#game.mobile-view.portrait-view .player.iam > .inner-content > .player-hands {
  flex-wrap: nowrap;

  .hand-cards {
    flex-wrap: wrap;
  }
}

.workers {
  position: relative;
  z-index: 1;
  /* карточка воркера должна быть видна при размещении игровых зон из руки */
}

.player-hands {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  padding: 0px 10px;
  flex-direction: row;
  position: relative;
  height: 0px;
  width: 100%;
  z-index: 2;

  .hand-cards-list {
    display: flex;
    align-items: flex-end;
    flex-direction: row;

    &.tutorial-active {
      box-shadow: 0 0 10px 10px #f4e205 !important;
    }
  }
}

.player-helper {
  z-index: 10;
  position: absolute;
  right: 0px;
  bottom: 240px;
  transform-origin: bottom right;

  .static-helper.helper-link {
    position: absolute;
    bottom: 0px;
    right: 90px;
    box-shadow: none;
  }

  .helper-dialog {
    display: block;
    position: relative;
    transform-origin: right bottom;
    padding-bottom: 4px;

    .content {
      width: auto;
      margin: 0px;

      .controls {
        bottom: -24px;
      }
    }

    &.scale-1,
    &.scale-2,
    &.scale-3,
    &.scale-4,
    &.scale-5 {
      scale: 1;
    }
  }

  &.scale-1 {
    scale: 0.6;
  }

  &.scale-2 {
    scale: 0.8;
  }

  &.scale-3 {
    scale: 0.6;
  }

  &.scale-4 {
    scale: 0.8;
  }

  &.scale-5 {
    scale: 1;
  }
}

.player-helper.new-tutorial:not(.helper-checked) {
  .static-helper.helper-link {
    box-shadow: 0 0 10px 10px #f4e205;
  }
}

.player.iam .player-hands {
  .hand-cards-list {
    flex-direction: row-reverse;

    .hand-cards:not(.at-table) {
      z-index: 1;
    }

    .hand-cards.at-table {
      position: absolute;
      left: auto;
      bottom: 200px;
      right: -120px;

      margin-bottom: 0px !important;
      box-shadow: -80px 0 60px 40px black;

      &[cardcount='0'] {
        box-shadow: none;
      }
    }
  }
}

#game.mobile-view.portrait-view .player-hands {
  justify-content: flex-start;
  height: initial;
}

#game:not(.mobile-view) .hand-cards-list {
  .hand-cards {
    max-height: 0px;
    align-items: flex-end;
    flex-direction: row;

    &.at-table {
      margin-bottom: 40px;
    }
  }
}

#game.mobile-view .hand-cards-list {
  overflow-y: auto;
  overflow-x: hidden;
}

#game.mobile-view.landscape-view .hand-cards-list {
  @media only screen and (max-height: 360px) {
    max-height: 300px;
  }
}

.player-hands {
  .hand-cards {
    display: flex;
    flex-wrap: nowrap;
    margin-left: 50px;
    margin-right: 10px;

    &[cardcount='0'] {
      margin-left: 0px;
    }

    & > .card-event,
    & > .company-card {
      margin-left: -40px;
      margin-bottom: 12px;
    }
  }
  .buster-cards {
    display: flex;
    padding-bottom: 70px;
    height: 120px;
    width: 212px;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: end;
    gap: 4px;

    .buster-card {
      margin-bottom: -80px;
    }
  }
}

#game.mobile-view.portrait-view .hand-cards-list {
  .hand-cards {
    margin-top: 70px;

    & > .card-event {
      margin-top: -70px;
    }
  }
}

.deck-counters {
  position: absolute;
  color: white;
  font-size: 24px;
  width: 100%;
  right: 0px;
  bottom: 0px;
  text-align: right;
}

.deck-counters b {
  font-size: 42px;
}

.acquired-company {
  .company-card-background {
    border-radius: 10px;
    box-shadow: inset 0 0 4px 4px green;
  }
}

.player:not(.iam) {
  cursor: pointer;
  padding-top: 70px;

  &.selected {
    .card-worker {
      outline: 2px solid green;
    }
    // box-shadow: 0 0 10px 10px #f4e205;
  }

  .player-hands {
    .buster-cards {
      align-content: start;
    }
  }
}
.player:not(.iam):not(.selected):not(.hovered) {
  padding-top: 0px;

  .card-worker {
    width: 72px;
    height: 108px;
    .handshake-action {
      width: 40px;
      height: 40px;
      top: calc(100% - 50px);
      left: calc(50% - 20px);
    }
    .income-block {
      z-index: 1;

      .income-counter,
      .income-plane {
        display: none;
      }

      .income-value {
        top: 44px;
        left: -98px;
      }
    }
  }
  .player-hands {
    z-index: -1;
    left: -68px;
    top: -108px;

    .hand-cards {
      flex-direction: column !important;

      .company-card {
        margin-bottom: 0px;
        height: 30px;

        .company-card-background {
          border-radius: 10px;
        }
        .card-event {
          width: 80px;
          height: 160px;
        }

        .chip-lane {
          display: none;
          &.chip-lane-all {
            display: flex;
          }
        }
      }
    }
    .buster-cards {
      display: none;
    }
  }
  .buster-cards-counter {
    z-index: 2;
    display: block;
    position: absolute;
    top: 29px;
    left: 44px;

    .buster-card {
      width: 29px;
      height: 29px;

      .card-event {
        border-radius: 50%;
        background-position: bottom;
        filter: none;

        &:before {
          display: block;
          font-size: 18px;
          border-radius: 50%;
          color: #fff;
          text-shadow: 2px 1px 0 #000;
          box-shadow: none;
          position: absolute;
          left: 0px;
          padding: 3px 0px 0px 0px;
        }
      }
    }
  }
}
.buster-cards-counter {
  display: none;
}
</style>
