(function () {
  const {
    rounds,
    round: roundNumber,
    roulettes: { main: roulette },
  } = this;
  const gameMaster = this.gameMaster();
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

      const eventData = { playDisabled: null, controlBtn: { label: 'Крутить рулетку' } };
      if (gameMaster) {
        gameMaster.set({ eventData });
        eventData.playDisabled = true;
      }
      player.activate({ notifyUser: 'Твой ход', setData: { eventData } });

      this.rollAllDicecubes();
      let incomeChange = this.dicecubes.white.value - this.dicecubes.black.value;
      if (player.companyCount({ type: 'light' }) > 0) incomeChange++;

      let income = player.income + incomeChange;
      if (income < 0) income = 0;
      const maxIncome = player.maxIncome();
      if (income > maxIncome) income = maxIncome;

      player.set({ income });

      result.newRoundLogEvents.push(
        `На кубиках выпали значения: <a style="color:white">${this.dicecubes.white.value}</a> и <a style="color:dimgray">${this.dicecubes.black.value}</a>`
      );

      const needRestoreResources = player.needRestoreResources();
      const needRestoreIncome = player.income < player.maxIncome();
      if (needRestoreResources || needRestoreIncome) {
        player.set({
          eventData: { deal: { skipRound: true } },
          staticHelper: {
            text: `Доступные действия:`,
            buttons: [
              needRestoreResources ? { text: 'Восстановить ресурсы', code: 'RESTORE_RESOURCES' } : null,
              needRestoreIncome ? { text: 'Восстановить доход', code: 'RESTORE_INCOME' } : null,
              { text: 'Закрыть', code: 'DO_NOTHING', exit: true },
            ],
          },
        });
      }

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

      const eventData = {
        controlBtn: { label: 'Завершить раунд' },
        chip: { [roulette.chip().id()]: { selectable: true } },
      };
      if (gameMaster) {
        gameMaster.set({ eventData });
        eventData.playDisabled = true;
      }
      roundActivePlayer.activate({ setData: { eventData } });

      result.newRoundLogEvents.push(`На рулетке выпало значение <a>${roulette.chip().title}</a>`);

      result.roundStep = 'ROUND_END';
      return result;
    }
    case 'ROUND_END': {
      result.roundStep = 'ROUND_START';

      const chip = roulette.chip();
      if (chip) chip.parent().removeItem(chip, { forceDelete: true });
      if (roulette.eventData.roundChipId) {
        const roundChip = this.get(roulette.eventData.roundChipId);
        if (roundChip) roundChip.set({ disabled: null });
        roulette.set({ eventData: { roundChipId: null } });
      }

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
