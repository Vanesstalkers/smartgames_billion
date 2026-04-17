<template>
  <game
    :debug="false"
    :gamePlaneFillWidth="0.2"
    :planeScaleMax="[1.5, 2, 3, 4, 6][state.guiScale - 1]"
    :roulette="rouletteTable.value?.split('-')[0] || ''"
  >
    <template
      #gameplane="{
        /* game = {}, gamePlaneScale */
      } = {}"
    >
      <div :class="['game-zones']">
        <div class="roulette-layout">
          <roulette :stop-outward-offset-ratio="0.22">
            <template #additional>
              <div class="roulette-additional-tools">
                <div class="deck-list deck-list--beside-dice">
                  <div
                    v-if="busterDropDeck"
                    :class="{
                      deck: true,
                      drop: true,
                      selectable: player.eventData.deck?.[busterDropDeck._id]?.selectable,
                      empty: deckItemCount(busterDropDeck) === 0,
                    }"
                    :code="busterDropDeck.code"
                  >
                    <div class="deck-cards-stack" :style="deckSingleFaceStackStyle()">
                      <company-card
                        class="deck-card-layer deck-card--top"
                        :content="deckItemCount(busterDropDeck)"
                        :cardData="{
                          name: busterDropDeck.subtype,
                          group: 'company',
                        }"
                        :imgExt="'png'"
                        :deckEvent="null"
                        :deck="busterDropDeck"
                      />
                    </div>
                  </div>
                </div>
                <div class="deck-list deck-list--beside-dice">
                  <div
                    v-if="busterDeck"
                    :class="{
                      deck: true,
                      drop: busterDeck.code.includes('_drop'),
                      selectable: player.eventData.deck?.[busterDeck._id]?.selectable,
                      empty: deckItemCount(busterDeck) === 0,
                    }"
                    :code="busterDeck.code"
                  >
                    <div class="deck-cards-stack" :style="deckSingleFaceStackStyle()">
                      <company-card
                        class="deck-card-layer deck-card--top"
                        :content="deckItemCount(busterDeck)"
                        :cardData="{
                          name: busterDeck.subtype,
                          group: 'company',
                        }"
                        :imgExt="'png'"
                        :deckEvent="deckItemCount(busterDeck) !== 0 ? useDeck : null"
                        :deck="busterDeck"
                      />
                    </div>
                  </div>
                </div>
                <div class="dicecube-container">
                  <dicecube v-for="cubeId in dicecubesIds" :key="cubeId" :dicecubeId="cubeId" />
                </div>
                <div class="buster-cards">
                  <div class="buster-cards-container">
                    <buster-card
                      v-for="card in rouletteBusterCards"
                      :key="card.id"
                      :cardId="card.id"
                      :content="card.title"
                      :cardData="{
                        name: 'buster',
                        group: 'company',
                      }"
                      :imgExt="'png'"
                      :canPlay="false"
                    />
                  </div>
                </div>
              </div>
            </template>
          </roulette>
          <div class="deck-list deck-list--roulette-orbit">
            <div
              v-for="(deck, deckIndex) in deckListOrbit"
              :key="deck._id"
              :class="{
                deck: true,
                drop: deck.code.includes('_drop'),
                selectable: player.eventData.deck?.[deck._id]?.selectable === true,
                'selectable-chip': player.eventData.deck?.[deck._id]?.selectable === 'chip',
                empty: deckItemCount(deck) === 0,
              }"
              :code="deck.code"
              :style="deckOrbitStyle(deckIndex, deckListOrbit.length)"
            >
              <div class="deck-cards-stack" :style="deckCardsStackSizeStyle(deck)">
                <company-card
                  v-for="stackIndex in deckItemCount(deck)"
                  :key="`${deck._id}-${stackIndex}`"
                  class="deck-card-layer"
                  :class="{ 'deck-card--top': stackIndex === deckItemCount(deck) }"
                  :style="deckCardStackStyle(stackIndex)"
                  :_content="stackIndex === deckItemCount(deck) ? deckItemCount(deck) : ''"
                  :cardData="{
                    name: deck.subtype,
                    group: 'company',
                  }"
                  :imgExt="'png'"
                  :deckEvent="deckItemCount(deck) !== 0 ? useDeck : null"
                  :deck="deck"
                />
              </div>
              <chip :chipId="'fake'" :value="deck.subtype" :size="26" :on-click="() => useDeckChip(deck)" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #gameinfo="{} = {}">
      <div class="wrapper">
        <div class="game-status-label">
          {{ game.statusLabel }}
          <small v-if="game.status === 'RESTORING_GAME'">{{ subStatusLabel }}</small>
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
import companyCard from './components/company.vue';
import dicecube from '~/lib/game/front/components/dicecube.vue';
import roulette from './components/roulette.vue';
import busterCard from './components/buster.vue';
import chip from './components/chip.vue';
import player from './components/player.vue';
import tutorial from '~/lib/helper/front/helper.vue';

export default {
  components: {
    Game,
    player,
    companyCard,
    dicecube,
    roulette,
    busterCard,
    chip,
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
    /** Колода бустеров рядом с кубиками, не на дуге вокруг рулетки. */
    busterDeck() {
      return (this.deckList || []).find((d) => d && d.subtype === 'buster') || null;
    },
    /** Сброс бустеров — слева от основной колоды buster. */
    busterDropDeck() {
      return (this.deckList || []).find((d) => d && d.subtype === 'buster_drop') || null;
    },
    /** Нижняя дуга без колод buster и buster_drop. */
    deckListOrbit() {
      return (this.deckList || []).filter((d) => d && d.subtype !== 'buster' && d.subtype !== 'buster_drop');
    },
    dicecubesIds() {
      return Object.keys(this.game.dicecubeMap) || [];
    },
    rouletteId() {
      return Object.keys(this.game.rouletteMap || {})[0] || '';
    },
    rouletteTable() {
      return this.game.store?.roulette?.[this.rouletteId] || {};
    },
    rouletteDecksFromTable() {
      return Object.keys(this.rouletteTable.deckMap || {}).map((id) => this.store.deck?.[id] || {});
    },
    /** Карты бустеров из колоды рулетки — рядом с кубиками справа. */
    rouletteBusterCards() {
      const deck = this.rouletteDecksFromTable.find((d) => d.subtype === 'buster');
      return deck
        ? Object.entries(deck.itemMap || {}).map(([id, { group }]) => ({ id, group, deck, ...this.store.card?.[id] }))
        : [];
    },
  },
  methods: {
    /** Нижний полукруг (0°…180°: справа через низ до слева); радиус в px; верх карты к центру (`angleDeg − 90`). */
    deckOrbitStyle(index, total) {
      const n = total || 1;
      let angleDeg;
      if (n === 1) {
        angleDeg = 90;
      } else {
        angleDeg = (180 * index) / (n - 1);
      }
      const rad = (angleDeg * Math.PI) / 180;
      const radiusPx = 520;
      const x = Math.cos(rad) * radiusPx;
      const y = Math.sin(rad) * radiusPx;
      const rotateInwardDeg = angleDeg - 90;
      return {
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotateInwardDeg}deg)`,
      };
    },
    /** Одна лицевая карта с числом (бустеры): контейнер без «ступеней» стопки. */
    deckSingleFaceStackStyle() {
      return { width: '100px', height: '200px' };
    },
    /** Размер контейнера стопки: базовая карта 100×200 + шаги вниз/вправо (см. game.css .card-event). */
    deckCardsStackSizeStyle(deck) {
      const n = this.deckItemCount(deck);
      const step = 6;
      const extra = Math.max(0, n - 1) * step;
      const w = 100;
      const h = 200;
      return {
        width: `${w + extra}px`,
        height: `${h + extra}px`,
      };
    },
    /** Карты в одной точке (0,0), смещение только вниз и вправо. */
    deckCardStackStyle(stackIndex) {
      const step = 6;
      const t = (stackIndex - 1) * step;
      return {
        position: 'absolute',
        left: `${t}px`,
        top: `${t}px`,
        zIndex: stackIndex,
      };
    },
    deckItemCount(deck) {
      return Object.keys(deck.itemMap || {}).length;
    },
    async useDeck(deck) {
      if (this.player.eventData.deck?.[deck._id]?.selectable) {
        this.handleGameApi({ name: 'eventTrigger', data: { eventData: { targetId: deck._id } } });
        return;
      }

      if (deck.subtype === 'buster_drop') return;
      const gmPrefix = this.isGameMaster() ? 'gm-' : '';
      await this.handleGameApi({ name: `${gmPrefix}useDeck`, data: { deckId: deck._id } });
    },
    async useDeckChip(deck) {
      if (this.player.eventData.deck?.[deck._id]?.selectable !== 'chip') {
        if (this.isGameMaster()) {
          await this.handleGameApi({ name: `takeChip`, data: { selectedChipSubtype: deck.subtype } });
        }
        return;
      }

      const gmPrefix = this.isGameMaster() ? 'gm-' : '';
      await this.handleGameApi({ name: `${gmPrefix}useChip`, data: { selectedChipSubtype: deck.subtype } });
    },
  },
};
</script>
<style lang="scss">
@import './css/game.css';

#gamePlane {
  .game-zones {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .roulette-layout {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .roulette {
      pointer-events: auto;
    }
  }
}

.roulette-additional-tools {
  position: absolute;
  top: -200px;
  left: calc(50% - 325px);
  width: 650px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 14px;
  pointer-events: none;
  z-index: 5;

  > * {
    pointer-events: auto;
  }
}

.dicecube-container {
  position: relative;
  display: flex;
  gap: 4px;
  padding: 0px 40px;

  .dicecube[subtype='black'] {
    filter: invert(1);
  }
}

.roulette-additional-tools .buster-cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  width: 212px;
  flex-shrink: 0;
  align-items: flex-end;

  padding-bottom: 0px;

  .buster-cards-container {
    display: flex;
    gap: 14px;

    .card-event {
      width: 100px;
      height: 140px;
      margin-bottom: 0px;
    }
  }
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
