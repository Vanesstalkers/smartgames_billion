<template>
  <lobby :gameServerTitle="gameServerTitle" :disableAvatarSelection="true">
    <template v-if="lobby.__gameServerConfig" #menu-item-game>
      <games class="menu-item-content" :gamesMap="gamesMap" :defaultGameCode="defaultGameCode">
        <template #players-count-controls="{ minPlayersInGame, updateMinPlayersInGame }">
          <div class="min-players">
            <span class="controls">
              <font-awesome-icon :icon="['fas', 'plus']" @click="updateMinPlayersInGame(1)" />
              {{ minPlayersInGame.val }}
              <font-awesome-icon :icon="['fas', 'minus']" @click="updateMinPlayersInGame(-1)" />
            </span>
            <span class="label"> минимум игроков</span>
          </div>
        </template>
        <template #tutorial-games>
          <tutorial-games class="tutorial-games" />
        </template>
      </games>
    </template>
  </lobby>
</template>

<script>
import Lobby from '~/lib/lobby/front/Lobby.vue';
import games from '~/lib/lobby/front/components/games.vue';
import tutorialGames from './components/tutorial-games.vue';

export default {
  components: { Lobby, games, tutorialGames },
  data() {
    return {};
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    store() {
      return this.state.store || {};
    },
    lobby() {
      return this.store.lobby?.[this.state.currentLobby] || {};
    },
    gameServerTitle() {
      return this.lobby.__gameServerConfig?.title;
    },
    defaultGameCode() {
      return this.lobby.__gameServerConfig?.code;
    },
    gamesMap() {
      return {
        [this.defaultGameCode]: this.lobby.__gameServerConfig,
      };
    },
  },
  methods: {},
  created() {},
  mounted() {
    if (this.lobby.code) {
      // дублирует логику из App.vue на случай, если страница была перезагружена в процессе игры
      this.$root.state.viewLoaded = true;
    }
  },
  async beforeDestroy() {},
};
</script>
<style lang="scss">
.viewer-container.group-buster {
  .viewer-canvas {
    img {
      border-radius: 28px;
    }
  }
  .viewer-navbar {
    img {
      border-radius: 4px;
    }
  }
}
</style>
