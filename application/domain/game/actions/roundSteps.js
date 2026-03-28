(function () {
  const { rounds, round: roundNumber } = this;
  const round = rounds[roundNumber];
  const players = this.players();
  const result = { newRoundLogEvents: [], newRoundNumber: roundNumber };

  switch (this.roundStep) {
    case 'ROUND_START': {
      result.newRoundNumber++;
      result.newRoundLogEvents.push(`<a>Начало раунда №${result.newRoundNumber}.</a>`);

      this.set({ round: result.newRoundNumber }); // без этого не отработает prepareRoundObject -> calcClientMoney
      const round = this.prepareRoundObject();

      const player = this.selectNextActivePlayer();

      player.activate({
        notifyUser: 'Твой ход',
        setData: { eventData: { playDisabled: true, controlBtn: { label: 'Завершить раунд' } } },
      });

      result.statusLabel = `Раунд ${result.newRoundNumber}`;
      result.roundStep = 'ROUND_END';

      this.rollAllDicecubes();
      let incomeChange = this.dicecubes.white.value - this.dicecubes.black.value;
      const cardsCount = player.decks.industry.itemsCount();
      let income = player.income + incomeChange;
      if (income < 0) income = 0;
      if (income > 10) income = 10;
      // if (cardsCount == 1 && increaseAmount > 6) increaseAmount = 6;
      // if (cardsCount == 2 && increaseAmount > 8) increaseAmount = 8;
      // if (cardsCount == 3 && increaseAmount > 10) increaseAmount = 10;
      player.set({ income });

      for (const player of this.players({ ai: true })) {
        if (!player.active) continue;

        const cards = [];
        switch (this.difficulty) {
          case 'weak':
            break;
          case 'strong':
            break;
        }
        player.aiActions.push(...cards.map((c) => ({ action: 'playCard', data: { cardId: c.id() } })));
      }

      const notAIPlayers = this.getActivePlayers().filter((p) => !p.ai);
      if (notAIPlayers.length === 0) result.forcedEndRound = true;

      return result;
    }

    case 'ROUND_END': {
      result.roundStep = 'ROUND_START';
      return { ...result, forcedEndRound: true };
    }
  }
});
