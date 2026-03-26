<template>
  <div :class="['game-zones']">
    <div class="roulette" />
    <!-- Сетка карточек 3 ряда × 4 колонки -->
    <div class="cards-grid">
      <div 
        v-for="i in 12" 
        :key="i" 
        :class="['card-slot', `card-${i}`]"
      >
        <div class="card-background" />
        <div class="chips-container">
          <div 
            v-for="j in 3" 
            :key="j" 
            :class="['chip', `chip-${j}`]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { provide, reactive, inject } from 'vue';

import { prepareGameGlobals } from '~/lib/game/front/gameGlobals.mjs';
import card from '~/lib/game/front/components/card.vue';

export default {
  components: {
    card,
  },
  props: {},
  setup() {
    return inject('gameGlobals');
  },
  watch: {
    gameDataLoaded: function () {
      // тут ловим обновление страницы
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
    gameDataLoaded() {
      return this.game.addTime;
    },

    tableCardZones() {
      return Object.keys(this.game.deckMap)
        .map((id) => this.store.deck?.[id])
        .filter(({ placement } = {}) => placement == 'table');
    },
    clientDopCard() {
      return Object.keys(this.tableCardZones.find((deck) => deck.subtype === 'zone_client_dop')?.itemMap || {})?.[0];
    },

    handCardsWidth() {
      const cardWidth = 130;
      const maxCardStack = 4;
      return state.isMobile ? `${cardWidth}px` : `${Math.ceil(1 / maxCardStack) * cardWidth}px`;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
#game {
  #gamePlane {
    .game-zones {
      width: 100%;
      height: 100%;

      .roulette {
        position: absolute;
        left: calc(50% - 300px);
        top: calc(50% - 300px);
        background-image: url(../assets/roulette.png);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        width: 600px;
        height: 600px;
        z-index: 2;
      }

      .cards-grid {
        position: absolute;
        width: 100%;
        height: 100%;
        // Размещение карточек вокруг рулетки
        // Рулетка в центре: left: calc(50% - 300px), top: calc(50% - 300px), размер 600x600
        
        .card-slot {
          position: absolute;
          width: 152px; // примерная ширина карточки
          height: 296px; // примерная высота карточки
          
          .card-background {
            width: 100%;
            height: 100%;
            background-image: url(../assets/cards.png);
            background-size: 720px auto; // 4 колонки × 180px = 720px (или реальная ширина спрайта)
            background-repeat: no-repeat;
            position: relative;
          }

          .chips-container {
            position: absolute;
            left: -25px; // вырезы на левой стороне
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 8px;
            
            .chip {
              width: 20px;
              height: 20px;
              background-image: url(../assets/chips.png);
              background-size: auto 60px; // если 3 фишки вертикально
              background-repeat: no-repeat;
              border-radius: 50%;
            }
          }
        }

        // Первый ряд (сверху) - карточки 1-3
        // Позиция в спрайте: колонка 0, ряд 0
        .card-1 { 
          left: calc(50% - 600px); 
          top: calc(50% - 600px); 
          .card-background { background-position: 0 0; } // первая карточка (колонка 0, ряд 0)
        }
        // Позиция в спрайте: колонка 1, ряд 0
        .card-2 { 
          left: calc(50% - 400px); 
          top: calc(50% - 600px); 
          .card-background { background-position: -180px 0; } // вторая карточка (колонка 1, ряд 0)
        }
        // Позиция в спрайте: колонка 2, ряд 0
        .card-3 { 
          left: calc(50% - 200px); 
          top: calc(50% - 600px); 
          .card-background { background-position: -360px 0; } // третья карточка (колонка 2, ряд 0)
        }
        // Карточка 4 справа от первого ряда - позиция в спрайте: колонка 3, ряд 0
        .card-4 { 
          left: calc(50% + 400px); 
          top: calc(50% - 600px); 
          .card-background { background-position: -540px 0; } // четвертая карточка (колонка 3, ряд 0)
        }
        
        // Второй ряд - карточки 5-8
        // Позиция в спрайте: колонка 0, ряд 1
        .card-5 { 
          left: calc(50% - 600px); 
          top: calc(50% - 300px); 
          .card-background { background-position: 0 -250px; } // пятая карточка (колонка 0, ряд 1)
        }
        // Позиция в спрайте: колонка 1, ряд 1
        .card-6 { 
          left: calc(50% - 400px); 
          top: calc(50% - 300px); 
          .card-background { background-position: -180px -250px; } // шестая карточка (колонка 1, ряд 1)
        }
        // Позиция в спрайте: колонка 2, ряд 1
        .card-7 { 
          left: calc(50% - 200px); 
          top: calc(50% - 300px); 
          .card-background { background-position: -360px -250px; } // седьмая карточка (колонка 2, ряд 1)
        }
        // Позиция в спрайте: колонка 3, ряд 1
        .card-8 { 
          left: calc(50% + 400px); 
          top: calc(50% - 300px); 
          .card-background { background-position: -540px -250px; } // восьмая карточка (колонка 3, ряд 1)
        }
        
        // Третий ряд (снизу) - карточки 9-12
        // Позиция в спрайте: колонка 0, ряд 2
        .card-9 { 
          left: calc(50% - 600px); 
          top: calc(50% + 350px); 
          .card-background { background-position: 0 -500px; } // девятая карточка (колонка 0, ряд 2)
        }
        // Позиция в спрайте: колонка 1, ряд 2
        .card-10 { 
          left: calc(50% - 400px); 
          top: calc(50% + 350px); 
          .card-background { background-position: -180px -500px; } // десятая карточка (колонка 1, ряд 2)
        }
        // Позиция в спрайте: колонка 2, ряд 2
        .card-11 { 
          left: calc(50% - 200px); 
          top: calc(50% + 350px); 
          .card-background { background-position: -360px -500px; } // одиннадцатая карточка (колонка 2, ряд 2)
        }
        // Позиция в спрайте: колонка 3, ряд 2
        .card-12 { 
          left: calc(50% + 400px); 
          top: calc(50% + 350px); 
          .card-background { background-position: -540px -500px; } // двенадцатая карточка (колонка 3, ряд 2)
        }

        // Фишки для каждой карточки - позиционирование в chips.png
        .card-1 .chip-1 { background-position: 0 0; }
        .card-1 .chip-2 { background-position: 0 -20px; }
        .card-1 .chip-3 { background-position: 0 -40px; }
        
        .card-2 .chip-1 { background-position: -20px 0; }
        .card-2 .chip-2 { background-position: -20px -20px; }
        .card-2 .chip-3 { background-position: -20px -40px; }
        
        .card-3 .chip-1 { background-position: -40px 0; }
        .card-3 .chip-2 { background-position: -40px -20px; }
        .card-3 .chip-3 { background-position: -40px -40px; }
        
        .card-4 .chip-1 { background-position: -60px 0; }
        .card-4 .chip-2 { background-position: -60px -20px; }
        .card-4 .chip-3 { background-position: -60px -40px; }
        
        .card-5 .chip-1 { background-position: -80px 0; }
        .card-5 .chip-2 { background-position: -80px -20px; }
        .card-5 .chip-3 { background-position: -80px -40px; }
        
        .card-6 .chip-1 { background-position: -100px 0; }
        .card-6 .chip-2 { background-position: -100px -20px; }
        .card-6 .chip-3 { background-position: -100px -40px; }
        
        .card-7 .chip-1 { background-position: -120px 0; }
        .card-7 .chip-2 { background-position: -120px -20px; }
        .card-7 .chip-3 { background-position: -120px -40px; }
        
        .card-8 .chip-1 { background-position: -140px 0; }
        .card-8 .chip-2 { background-position: -140px -20px; }
        .card-8 .chip-3 { background-position: -140px -40px; }
        
        .card-9 .chip-1 { background-position: -160px 0; }
        .card-9 .chip-2 { background-position: -160px -20px; }
        .card-9 .chip-3 { background-position: -160px -40px; }
        
        .card-10 .chip-1 { background-position: -180px 0; }
        .card-10 .chip-2 { background-position: -180px -20px; }
        .card-10 .chip-3 { background-position: -180px -40px; }
        
        .card-11 .chip-1 { background-position: -200px 0; }
        .card-11 .chip-2 { background-position: -200px -20px; }
        .card-11 .chip-3 { background-position: -200px -40px; }
        
        .card-12 .chip-1 { background-position: -220px 0; }
        .card-12 .chip-2 { background-position: -220px -20px; }
        .card-12 .chip-3 { background-position: -220px -40px; }
      }
    }
  }

  &.mobile-view {
    #gamePlane {
      .game-zones {
        width: 100%;
        height: 100%;

        &.has-client-dop {
          [code='Deck[card_zone_credit]'] {
            left: calc(50% + 130px + 10px + 28px);
          }
        }

        [code='Deck[card_zone_client]'] {
          position: absolute;
          left: calc(50% - 130px - 10px);
          top: calc(50% - 90px);
          z-index: 1;
        }
        [code='Deck[card_zone_feature]'] {
          position: absolute;
          left: calc(50%);
          top: calc(50% - 90px);
        }
        [code='Deck[card_zone_client_dop]'] {
          position: absolute;
          left: calc(50% + 28px);
          top: calc(50% - 90px);
          z-index: 1;
        }
        [code='Deck[card_zone_credit]'] {
          position: absolute;
          left: calc(50% + 130px + 10px);
          top: calc(50% - 90px);
        }
      }
    }
  }
}
</style>
