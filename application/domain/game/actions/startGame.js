(function () {
  const { playerStartMoney, playerStartIncome } = this.settings;
  for (const player of this.players()) {
    player.set({ money: playerStartMoney, income: playerStartIncome });
  }

  this.set({ roundStep: 'ROUND_START' });
  this.run('lib.startGame');
});
