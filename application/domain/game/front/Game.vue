<template>
  <game :debug="false" :gamePlaneFillWidth="0.2" :planeScaleMax="[1.5, 2, 3, 4, 6][state.guiScale - 1]">
    <template
      #gameplane="{
        /* game = {}, gamePlaneScale */
      } = {}"
    >
      <div :class="['game-zones']">
        <roulette :stop-outward-offset-ratio="0.22">
          <template #additional>
            <div class="dicecube-container">
              <dicecube v-for="cubeId in dicecubesIds" :key="cubeId" :dicecubeId="cubeId" />
            </div>
          </template>
        </roulette>
      </div>
    </template>

    <template #gameinfo="{} = {}">
      <div class="wrapper">
        <div class="game-status-label">
          {{ game.statusLabel }}
          <small v-if="game.status === 'RESTORING_GAME'">{{ subStatusLabel }}</small>
        </div>
        <div class="deck-list">
          <div
            v-for="deck in deckList"
            :key="deck._id"
            :class="['deck', deck.code.includes('_drop') ? 'drop' : '']"
            :code="deck.code"
          >
            <card
              :content="Object.keys(deck.itemMap).length"
              :cardData="{
                name: deck.subtype,
                group: 'industry',
              }"
              :imgExt="'png'"
            >
            </card>
          </div>
        </div>
      </div>
    </template>

    <template #shown-card="{ closeCardInfo } = {}">
      <div class="shown-card scroll-off" v-on:click.stop="closeCardInfo">
        <div class="close" v-on:click.stop="closeCardInfo" />
        <img class="img" :name="state.shownCard.code" />
      </div>
    </template>

    <template #player="{} = {}">
      <player
        :playerId="gameState.sessionPlayerId"
        :viewerId="gameState.sessionViewerId"
        :customClass="[`scale-${state.guiScale}`]"
        :iam="true"
        :showControls="showPlayerControls"
      />
    </template>
    <template #opponents="{} = {}">
      <player
        v-for="(id, index) in playerIds"
        :key="id"
        :playerId="id"
        :customClass="[`idx-${index}`]"
        :showControls="false"
      />
    </template>
  </game>
</template>

<script>
import { provide, reactive } from 'vue';

import { prepareGameGlobals } from '~/lib/game/front/gameGlobals.mjs';
import billionGameGlobals, { gameCustomArgs } from '~/domain/game/front/billionGameGlobals.mjs';
import Game from '~/lib/game/front/Game.vue';
import card from './components/card.vue';
import dicecube from '~/lib/game/front/components/dicecube.vue';
import roulette from './components/roulette.vue';
import player from './components/player.vue';
import tutorial from '~/lib/helper/front/helper.vue';

export default {
  components: {
    Game,
    player,
    card,
    dicecube,
    roulette,
    tutorial,
  },
  props: {},
  setup() {
    const gameGlobals = {
      ...prepareGameGlobals({
        defaultDeviceOffset: 0, // сдвиг gamePlane влево от центра
      }),
      gameCustomArgs: { ...gameCustomArgs },
    };

    Object.assign(gameGlobals, billionGameGlobals);

    provide('gameGlobals', gameGlobals);
    return gameGlobals;
  },
  watch: {
    gameDataLoaded: function () {
      // тут ловим обновление страницы
    },
    'player.eventData.triggerListenerEnabled': {
      handler(newVal) {
        if (!newVal) this.$set(this.gameCustom, 'selectedChipId', '');
      },
      deep: true,
    },
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
    gameDataLoaded() {
      return this.game.addTime;
    },
    showPlayerControls() {
      return this.game.status === 'IN_PROCESS' || this.game.status === 'PREPARE_START';
    },

    restoringGameState() {
      return this.game.status === 'RESTORING_GAME';
    },
    subStatusLabel() {
      const players = Object.values(this.store.player || {});
      return `Подключилось ${players.filter((player) => player.ready).length} из ${players.length} игроков`;
    },
    playerIds() {
      const ids = Object.keys(this.game.playerMap || {}).sort((id1, id2) => (id1 > id2 ? 1 : -1));
      if (this.gameState.viewerMode) return ids;
      const curPlayerIdx = ids.indexOf(this.gameState.sessionPlayerId);
      const result = ids.slice(curPlayerIdx + 1).concat(ids.slice(0, curPlayerIdx));
      return result;
    },
    sessionUserCardDeckLength() {
      return (
        Object.keys(
          Object.keys(this.sessionPlayer.deckMap || {})
            .map((id) => this.store.deck?.[id] || {})
            .filter((deck) => deck.type === 'card' && !deck.subtype)[0]?.itemMap || {}
        ).length || 0
      );
    },
    deckList() {
      return Object.keys(this.game.deckMap).map((id) => this.store.deck?.[id]) || [];
    },
    dicecubesIds() {
      return Object.keys(this.game.dicecubeMap) || [];
    },
  },
};
</script>
<style lang="scss">
@import './css/game.css';

#gamePlane {
  .game-zones {
    width: 100%;
    height: 100%;
  }
}

.dicecube-container {
  position: absolute;
  top: -120px;
  left: calc(50% - 60px);
  display: flex;
  gap: 2px;

  .dicecube[subtype='black'] {
    filter: invert(1);
  }
}

.card-event.played {
  filter: none !important;
}

.game-status-label {
  text-align: right;
  color: white;
  font-weight: bold;
  font-size: 2em;
  white-space: nowrap;
  text-shadow: black 1px 0 10px;
}

#game.mobile-view .game-status-label {
  font-size: 1.5em;
}

.chip.selectable {
  box-shadow: none !important;
  .chip-face {
    box-shadow: inset 0 0 10px 6px yellow;
    border-radius: 16px;
    &:hover {
      box-shadow: none !important;
    }
  }

  &:hover {
    box-shadow: 2px 4px 4px 0px #333 !important;
    border-radius: 16px;
    margin-left: -2px;
    margin-top: -2px;
    margin-bottom: 2px;
  }
}
</style>
