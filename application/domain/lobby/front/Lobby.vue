<template>
  <lobby :customInitSession="insideIframe ? customInitSession : null">
    <template #menu-item-game>
      <games
        class="menu-item-content"
        :games="gamesMap"
        :deckType="'billion'"
      >
        <!-- <template
          #new-game-controls="{
            gameType,
            gameConfig,
            gameTypeList,
            gameConfigList,
            selectGameType,
            selectGameConfig,
            updateGameTimer,
            updateGameRoundLimit,
            updateTeamsCount,
            updateMaxPlayersInGame,
            updateDifficulty,
            handleAddGame,
            gameTimer,
            teamsCount,
            maxPlayersInGame,
            difficultyList,
            difficulty,
          }"
        >
          <div v-if="!gameType" :class="['game-block']">
            <div
              v-for="[code, game] in gameTypeList"
              :key="code"
              :class="[
                'select-btn',
                'wait-for-select',
                code,
                game.disabled ? 'disabled' : '',
              ]"
              :style="game.style || {}"
              @click="selectGameType(code)"
            >
              <font-awesome-icon :icon="game.icon" /> {{ game.title }}
            </div>
          </div>

          <div v-if="!gameConfig" :class="['game-config-block']">
            <div
              v-for="[code, config] in gameConfigList"
              :key="code"
              :class="[
                'select-btn',
                'wait-for-select',
                code,
                config.disabled ? 'disabled' : '',
              ]"
              :style="config.style || {}"
              v-on:click="selectGameConfig(code)"
            >
              {{ config.title }}
            </div>
          </div>

          <div v-if="gameConfig" class="game-start-block">
            <div v-if="teamsCount.val">
              <div class="flex-block">
                <div class="timer">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateGameTimer(15)"
                    />
                    {{ gameTimer }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateGameTimer(-15)"
                    />
                  </span>
                  <span class="label"> секунд на ход</span>
                </div>
                <div class="rounds">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateGameRoundLimit(1)"
                    />
                    {{ gameRoundLimit }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateGameRoundLimit(-1)"
                    />
                  </span>
                  <span class="label"> лимит раундов на игру</span>
                </div>
              </div>
              <div class="flex-block">
                <div class="teams">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateTeamsCount(1)"
                    />
                    {{ teamsCount.val }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateTeamsCount(-1)"
                    />
                  </span>
                  <span class="label"> всего команд</span>
                </div>
                <button class="select-btn active" @click="handleAddGame()">
                  Начать игру
                </button>
              </div>
            </div>
            <div v-else-if="maxPlayersInGame.val">
              <div class="flex-block">
                <div class="timer">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateGameTimer(15)"
                    />
                    {{ gameTimer }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateGameTimer(-15)"
                    />
                  </span>
                  <span class="label"> секунд на ход</span>
                </div>
                <div class="rounds">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateGameRoundLimit(1)"
                    />
                    {{ gameRoundLimit }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateGameRoundLimit(-1)"
                    />
                  </span>
                  <span class="label"> лимит раундов на игру</span>
                </div>
              </div>
              <div class="flex-block">
                <div class="max-players">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateMaxPlayersInGame(1)"
                    />
                    {{ maxPlayersInGame.val }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateMaxPlayersInGame(-1)"
                    />
                  </span>
                  <span class="label"> максимум игроков</span>
                </div>
                <button class="select-btn active" @click="handleAddGame()">
                  Начать игру
                </button>
              </div>
            </div>
            <div v-else class="flex-block wrap">
              <div v-if="difficultyList.length" class="flex-block ai-config">
                <span class="label">Уровень ИИ</span>
                <select
                  :value="difficulty"
                  class="select-input"
                  @change="updateDifficulty"
                >
                  <option
                    v-for="option in difficultyList"
                    :key="option.code"
                    :value="option.code"
                  >
                    {{ option.title }}
                  </option>
                </select>
              </div>
              <div class="flex-block">
                <div class="timer">
                  <span class="controls">
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      @click="updateGameTimer(15)"
                    />
                    {{ gameTimer }}
                    <font-awesome-icon
                      :icon="['fas', 'minus']"
                      @click="updateGameTimer(-15)"
                    />
                  </span>
                  <span class="label"> секунд на ход</span>
                </div>
                <button class="select-btn active" @click="handleAddGame()">
                  Начать игру
                </button>
              </div>
            </div>
          </div>
        </template> -->
      </games>
    </template>
  </lobby>
</template>

<script>
import Lobby from "~/lib/lobby/front/Lobby.vue";
import games from "~/lib/lobby/front/components/games.vue";

export default {
  name: "BillionLobby",
  components: { Lobby, games },
  data() {
    return {
      gamesMap: {
        billion: {
          selected: true,
          title: "Игра на миллиард",
          icon: ["fa", "money"],
          items: {
            playtable: {
              timer: 60,
              title: "Игровой стол",
            },
            trainer: {
              disabled: true,
              title: "Тренажёр",
            },
          },
        },
      },
    };
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    insideIframe() {
      return new URLSearchParams(document.location.search).get("userId");
    },
  },
  methods: {
    async customInitSession() {
      await this.$root.initSessionIframe();
    },
  },
  created() {
    // this.state.emit.logout = async () => {
    //   window.parent.postMessage({ emit: { name: 'hideGameIframe' } }, '*');
    // };
  },
  mounted() {
    console.log("domain.lobby mounted() {");
  },
  async beforeDestroy() {},
};
</script>
<style lang="scss"></style>
