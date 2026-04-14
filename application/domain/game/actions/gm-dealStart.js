(async function ({ targetId } = {}, player) {
  const event = player.initEvent({
    name: 'deal',
    data: { targetPlayer: this.get(targetId) },
    handlers: {
      async TRIGGER({ dealType, amount, payType, group, initPlayer, target, repayType }) {
        const {
          game,
          player,
          data: { targetPlayer },
        } = this.eventContext();

        switch (dealType) {
          case 'addMoney': {
            targetPlayer.set({ money: targetPlayer.money + amount });
            break;
          }
          case 'removeMoney': {
            targetPlayer.set({ money: targetPlayer.money - amount });
            break;
          }
          case 'setIncome': {
            targetPlayer.set({ income: amount });
            break;
          }
        }
        this.emit('RESET');
      },
      END_ROUND() {
        this.emit('RESET');
      },
      RESET() {
        const { player, beforeEventControlBtn: controlBtn } = this.eventContext();

        player.set({ eventData: { controlBtn }, staticHelper: null }, { reset: ['eventData.controlBtn'] });

        this.destroy();
      },
    },
  });

  if (event) {
    const user = lib.store('user').get(player.userId);
    const tutorialPayload = { tutorial: 'game-tutorial-deal_gm' };
    if (user.currentTutorial?.active) tutorialPayload.action = 'changeTutorial';
    await user.updateTutorial(tutorialPayload);
  }
});
