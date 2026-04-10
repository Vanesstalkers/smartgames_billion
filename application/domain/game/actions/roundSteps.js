(function () {
  const {
    rounds,
    round: roundNumber,
    roulettes: { main: roulette },
  } = this;
  const round = rounds[roundNumber];
  const roundActivePlayer = this.roundActivePlayer();
  const result = { newRoundLogEvents: [], newRoundNumber: roundNumber };

  switch (this.roundStep) {
    case 'ROUND_START': {
      result.newRoundNumber++;
      result.newRoundLogEvents.push(`<a>Начало раунда №${result.newRoundNumber}.</a>`);

      this.set({ round: result.newRoundNumber }); // без этого не отработает prepareRoundObject -> calcClientMoney
      const round = this.prepareRoundObject();

      result.statusLabel = `Раунд ${result.newRoundNumber}`;
      result.roundStep = 'ROULETTE';

      const player = this.selectNextActivePlayer();

      player.activate({
        notifyUser: 'Твой ход',
        setData: { eventData: { playDisabled: true, controlBtn: { label: 'Крутить рулетку' } } },
      });

      this.rollAllDicecubes();
      let incomeChange = this.dicecubes.white.value - this.dicecubes.black.value;
      const cardsCount = player.decks.company.itemsCount();
      const hasLightCompany = player.hasCompany('light');

      let income = player.income + incomeChange;
      if (income < 0) income = 0;

      if (hasLightCompany) {
        income++;
        if (income > 10) income = 10;
      } else {
        if (cardsCount == 1 && income > 6) income = 6;
        if (cardsCount == 2 && income > 8) income = 8;
        if (cardsCount >= 3 && income > 10) income = 10;
      }
      player.set({ income });

      result.newRoundLogEvents.push(
        `На кубиках выпали значения: <a>${this.dicecubes.white.value} (белый)</a> и <a>${this.dicecubes.black.value} (чёрный)</a>`
      );

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

    case 'ROULETTE': {
      roulette.spin();

      roundActivePlayer.activate({
        setData: {
          eventData: {
            playDisabled: true,
            controlBtn: { label: 'Завершить раунд' },
            chip: { [roulette.chip().id()]: { selectable: true } },
          },
        },
      });

      const [card] = this.select({
        ...{ className: 'Card', directParent: false },
        attr: { name: roulette.chip().value },
      });

      result.newRoundLogEvents.push(`На рулетке выпало значение <a>${card?.title}</a>`);

      result.roundStep = 'ROUND_END';
      return result;
    }
    case 'ROUND_END': {
      result.roundStep = 'ROUND_START';

      const chip = roulette.chip();
      if (chip) chip.parent().removeItem(chip, { forceDelete: true });

      for (const player of this.players()) {
        for (const company of player.decks.company.items() || []) {
          company.set({ played: null });
        }
      }
      roundActivePlayer.set({ eventData: { deal: null }, staticHelper: null });

      return { ...result, forcedEndRound: true };
    }
  }
});
