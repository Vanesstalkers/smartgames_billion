(function ({ timerOverdue = false } = {}, initPlayer) {
  this.updateTimerOverdueCounter(timerOverdue);

  if (!initPlayer) initPlayer = this.roundActivePlayer();
  if (initPlayer?.gameMaster) {
    for (const player of this.players()) if (player.active) player.deactivate();
    initPlayer = this.roundActivePlayer(); // при forcedEndRound из roundSteps не будет initPlayer
  } else initPlayer.deactivate();

  for (const player of this.players({ ai: true })) {
    if (!player.active) continue;
    player.aiActions.forEach((action) => this.run(action.action, action.data, player));
    player.aiActions = [];
    this.run('roundEnd', {}, player);
  }

  if (!this.checkAllPlayersFinishRound()) return;

  for (const player of this.players()) {
    this.toggleEventHandlers(this.roundStep, {}, player);
  }

  this.run('roundStart', { preventNotifyUser: true }); // если убирать это отсюда, то нужно не забыть про handleAction по кнопке с фронта
});
