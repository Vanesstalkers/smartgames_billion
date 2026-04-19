<template>
  <div
    v-if="player._id || viewer._id"
    :id="player._id"
    :class="[
      'card-worker',
      'card-worker-' + player.code,
      player.active ? 'active' : '',
      selectable ? 'selectable' : '',
      highlight ? 'highlight' : '',
      showControlBtn || showLeaveBtn ? 'has-action' : '',
    ]"
    :style="customStyle"
    @click="selectable ? triggerSelectable($event) : null"
  >
    <div v-if="!iam" class="user-name">{{ player.userName }}</div>
    <slot v-if="!viewerId" name="money" :money="player.money">
      <div class="money">{{ player.money || 0 }}</div>
    </slot>
    <slot name="timer" :timer="localTimer" :showTimer="showTimer">
      <div v-if="showTimer" class="end-round-timer">
        {{ localTimer }}
      </div>
    </slot>
    <slot v-if="!viewerId" name="custom">
      <div class="income-block">
        <div class="income-counter" :style="incomeCounterStyle" />
        <div class="income-plane" />
        <div class="income-value" :style="incomeValueStyle">{{ displayIncome }}</div>
      </div>
      <div
        v-if="!iam && !sessionPlayer().eventData.playDisabled"
        class="handshake-action"
        @click.stop="onWorkerHandshakeClick"
      />
    </slot>
    <slot name="control" :controlAction="controlAction">
      <div
        v-if="showControlBtn"
        :class="{
          'action-btn': true,
          'end-round-btn': true,
          [controlBtn.class || '']: true,
          'reset-event': controlBtn.resetEvent,
        }"
        @click.stop="controlAction()"
      >
        {{ controlBtn.label || 'Закончить раунд' }}
      </div>
    </slot>
    <div v-if="showLeaveBtn" class="action-btn leave-game-btn" @click="controlAction">Выйти из игры</div>
  </div>
</template>

<script>
import { inject } from 'vue';

export default {
  props: {
    playerId: String,
    viewerId: String,
    iam: Boolean,
    playerSelected: Boolean,
  },
  data() {
    return {
      localTimer: null,
      localTimerUpdateTime: null,
      localTimerId: null,
      /** позиция income-counter; во время броска кубиков не тянем за player.income до diceRollSettledSeq */
      displayIncome: 0,
    };
  },
  setup() {
    return inject('gameGlobals');
  },
  computed: {
    state() {
      return this.$root.state || {};
    },
    game() {
      return this.getGame();
    },
    store() {
      return this.getStore();
    },
    userData() {
      return this.state.store?.user?.[this.state.currentUser] || {};
    },
    player() {
      const player = this.store.player?.[this.playerId] || {};
      // через watch не осилил (проблема при создании игры - "Vue cannot detect property addition or deletion")
      if (player.timerEndTime && this.localTimerUpdateTime !== player.timerUpdateTime) {
        clearTimeout(this.localTimerId);
        this.localTimer = Math.floor((player.timerEndTime - state.serverTimeDiff - Date.now()) / 1000);
        this.localTimerUpdateTime = player.timerUpdateTime;
        this.localTimerId = setInterval(() => {
          if (this.localTimer !== null) {
            this.localTimer--;
            if (this.localTimer < 0) this.localTimer = 0;
          }
        }, 1000);
      }
      return player || {};
    },
    viewer() {
      return this.store.viewer?.[this.viewerId] || {};
    },
    customStyle() {
      const style = {};
      const gender = this.userData.gender;

      if (this.player.avatarUrl) {
        style.backgroundImage = `url(${this.player.avatarUrl}.png)`;
        return style;
      }

      const defaultImage = `_default/${gender}_empty`;
      const avatarCode = this.userData.avatarCode || this.player.avatarsMap?.[gender] || defaultImage;

      style.backgroundImage = `url(${this.state.serverOrigin}/img/workers/${avatarCode}.png)`;

      return style;
    },
    incomeCounterStyle() {
      return {
        left: `${-48 - this.displayIncome * 6}px`,
      };
    },
    incomeValueStyle() {
      let backgroundColor = '#7db442';

      if (this.displayIncome < 18) backgroundColor = '#f7ad3b';
      if (this.displayIncome < 14) backgroundColor = '#e5542a';
      if (this.displayIncome < 2) backgroundColor = '#be1a2e';

      return { backgroundColor };
    },
    controlBtn() {
      return this.player.eventData?.controlBtn || this.viewer.eventData?.controlBtn;
    },
    highlight() {
      return this.sessionPlayer().eventData.player?.[this.playerId]?.highlight;
    },
    selectable() {
      return this.sessionPlayerIsActive() && this.sessionPlayer().eventData?.player?.[this.playerId]?.selectable;
    },
    showControlBtn() {
      console.log('showControlBtn', this.sessionPlayer().eventData.playDisabled, this.sessionPlayer().eventData.enableControlBtn);
      return (
        ((this.iam && this.sessionPlayerIsActive()) || this.isGameMaster()) &&
        (!this.sessionPlayer().eventData.playDisabled || this.sessionPlayer().eventData.enableControlBtn) &&
        (this.controlBtn?.label || this.controlBtn?.triggerEvent) &&
        !this.controlBtn?.leaveGame
      );
    },
    showTimer() {
      return (
        this.player.active &&
        !this.player.eventData.actionsDisabled &&
        this.player.timerEndTime &&
        this.game.status != 'WAIT_FOR_PLAYERS'
      );
    },
    showLeaveBtn() {
      return (this.iam && this.controlBtn?.leaveGame) || (this.viewerId && !this.isGameMaster());
    },
  },
  methods: {
    triggerSelectable(event) {
      if (this.playerSelected) event.stopPropagation();
      this.handleGameApi({ name: 'eventTrigger', data: { eventData: { targetId: this.playerId } } });
    },
    async controlAction(eventData = {}) {
      prettyAlertClear?.();

      if (this.showLeaveBtn) return await this.leaveGame();
      if (this.showControlBtn) {
        if (this.controlBtn.triggerEvent) await this.handleGameApi({ name: 'eventTrigger', data: { eventData } });
        else if (this.controlBtn.resetEvent) await this.handleGameApi({ name: 'eventReset' });
        else await this.endRound();
      }
    },
    async endRound() {
      await this.handleGameApi({ name: 'roundEnd' });
    },
    async leaveGame() {
      await api.action
        .call({
          path: 'game.api.leave',
          args: [],
        })
        .catch(prettyAlert);
    },
    async onWorkerHandshakeClick() {
      prettyAlertClear?.();

      const gmPrefix = this.isGameMaster() ? 'gm-' : '';
      await this.handleGameApi({ name: `${gmPrefix}dealStart`, data: { targetId: this.playerId } }).catch(prettyAlert);
    },
    syncDisplayIncomeFromPlayer() {
      const v = (this.player?.income || 0) * 2;
      this.displayIncome = v != null ? Number(v) : 0;
    },
  },
  watch: {
    'player.income': {
      handler() {
        if ((this.gameCustom.diceRollActiveCount || 0) > 0) return;
        this.syncDisplayIncomeFromPlayer();
      },
    },
    'gameCustom.diceRollSettledSeq'() {
      this.syncDisplayIncomeFromPlayer();
    },
  },
  mounted() {
    this.syncDisplayIncomeFromPlayer();
  },
};
</script>

<style scoped lang="scss">
.card-worker {
  position: relative;
  border: 1px solid;
  width: 120px;
  height: 180px;
  background-size: cover;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  border-radius: 10px;
  margin: 0px 0px 0px 5px;
  box-shadow: inset 0px 20px 20px 0px black;

  &.highlight {
    box-shadow: inset 0 0 20px 8px lightgreen !important;
  }

  &.active {
    outline: 4px solid green;
  }

  .user-name {
    position: absolute;
    bottom: 0px;
    width: 100%;
    font-size: 16px;
    font-weight: bold;
    color: white;
    width: 100%;
    overflow: hidden;
  }

  .money {
    position: absolute;
    top: 0px;
    width: 100%;
    font-size: 20px;
    font-weight: bold;
    color: #f4e205;
    padding-top: 4px;
    &.over {
      color: #ff3b3b;
    }
  }

  .card-event {
    position: absolute;
    bottom: 0px;
    width: 48px;
    height: 72px;
    color: white;
    border: none;
    font-size: 36px;
    display: flex;
    justify-content: center;
    align-content: center;
  }

  .income-block {
    position: absolute;
    scale: 0.7;
    z-index: -1;
    top: -2px;
    right: 0px;
    .income-plane {
      position: absolute;
      right: -62px;
      top: -28px;
      background-image: url('../assets/income_plane.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      width: 242px;
      height: 100px;
      z-index: -1;
      rotate: -90deg;
    }
    .income-counter {
      position: absolute;
      top: -136px;
      transition: left 0.45s ease-out;
      background-image: url('../assets/income_counter.png');
      background-size: 58px;
      background-position: center;
      background-repeat: no-repeat;
      width: 58px;
      height: 202px;
      z-index: -1;
      rotate: -90deg;
    }
    .income-value {
      text-align: center;
      position: absolute;
      top: -96px;
      left: -80px;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      line-height: 40px;
      font-size: 24px;
      color: #fff;
      text-shadow: 2px 1px 0 #000;
      padding-right: 2px;
    }
  }
  .handshake-action {
    position: absolute;
    top: calc(50% - 40px);
    left: calc(50% - 40px);
    width: 80px;
    height: 80px;
    background-image: url('../assets/handshake.png');
    background-size: cover;
    background-position: center;
    display: none;

    &:hover {
      margin-left: -2px;
      margin-top: -4px;
      box-shadow: 2px 4px 8px black;
      border-radius: 50%;
    }
  }
}

.card-worker:hover .handshake-action {
  cursor: pointer;
  display: block;
}

.card-worker.has-action:hover .action-btn:not(.reset-event) {
  cursor: pointer;
  background: green;
}

.card-worker.selectable .end-round-btn:not(.reset-event),
.card-worker.selectable .end-round-timer {
  display: none;
}

.end-round-btn {
  position: absolute;
  bottom: 0px;
  width: 100%;
  min-height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.5em;
  text-align: center;
  cursor: pointer;
  background: #008000de;
  color: white;
  font-size: 16px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  &:hover {
    opacity: 0.7;
  }

  &.reset-event {
    background: orange;
    &:hover {
      opacity: 0.7;
    }
  }
}

.end-round-timer {
  position: absolute;
  bottom: 50px;
  width: 100px;
  z-index: 1;
  font-size: 64px;
  color: white;
  border-radius: 50%;
  height: 100px;
  line-height: 100px;
  margin: 10px;
  color: #ff5900;
  text-shadow: 4px 4px 0 #fff;
}
.player:not(.iam) {
  .end-round-timer {
    font-size: 32px;
    bottom: 10px;
    height: auto;
    line-height: 32px;
  }
}

.leave-game-btn {
  position: absolute;
  bottom: 0px;
  width: 100px;
  font-size: 0.5em;
  border: 1px solid black;
  text-align: center;
  cursor: pointer;
  margin: 6px 10px;
  background: #bb3030;
  color: white;
  font-size: 16px;
}
</style>
