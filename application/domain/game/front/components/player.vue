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
              :canPlay="canPlay(card)"
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
              :content="card.title"
              :cardData="{
                name: 'buster',
                group: 'company',
              }"
              :imgExt="'png'"
              :canPlay="iam && sessionPlayerIsActive()"
              :_playCard="playBusterCard"
            />
          </div>
        </div>
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
        :class="['player-helper', staticHelper?.text ? 'new-tutorial' : '', helperChecked ? 'helper-checked' : '']"
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
      const cards = deck
        ? Object.entries(deck.itemMap).map(([id, { group }]) => ({ id, group, deck, ...this.store.card?.[id] }))
        : [];
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
            Object.entries(deck.itemMap).map(([id, { group }]) => {
              return { id, group, deck, acquired: this.sessionPlayer().acquired?.company?.[id] };
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
      if (this.isGameMaster()) {
        await this.handleGameApi({ name: 'gm-dealAction', data: { ...button } });
      } else if (button.triggerEvent) {
        await this.handleGameApi({ name: 'eventTrigger', data: { eventData: { button } } });
      } else if (button.resetEvent) {
        await this.handleGameApi({ name: 'eventReset' });
      } else if (this.player.eventData?.deal) {
        await this.handleGameApi({ name: 'dealAction', data: { ...button } });
      }
    },
    canPlay(card) {
      const playerAvailable =
        (this.sessionPlayerIsActive() || this.player.eventData.canPlay) && !this.player.eventData.playDisabled;
      const deckAvailable = !card.deck.eventData.playDisabled;

      return this.iam && playerAvailable && deckAvailable;
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
  position: absolute;
  right: 0px;
  bottom: 170px;

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
    }
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

.hand-cards {
  display: flex;
  flex-wrap: nowrap;
  margin-left: 50px;

  &[cardcount='0'] {
    margin-left: 0px;
  }

  & > .card-event,
  & > .company-card {
    margin-left: -40px;
    margin-bottom: 12px;
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

.buster-cards {
  display: flex;
  padding-bottom: 60px;
  height: 120px;
  width: 212px;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: end;

  .buster-card {
    margin-bottom: -80px;
  }
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
}
.player:not(.iam):not(.selected):not(.hovered) {
  padding-top: 0px;

  .card-worker {
    width: 72px;
    height: 108px;
    .end-round-timer {
      font-size: 32px;
      bottom: 0px;
      height: auto;
      line-height: 32px;
      // display: none;
    }
    .handshake-action {
      width: 40px;
      height: 40px;
      top: calc(100% - 50px);
      left: calc(50% - 20px);
    }
    .income-block {
      display: none;
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
  }
}
</style>
