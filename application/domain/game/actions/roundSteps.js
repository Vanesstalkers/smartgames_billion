(function () {
  const {
    rounds,
    round: roundNumber,
    roulettes: { main: roulette },
  } = this;
  const round = rounds[roundNumber];
  const gameMaster = this.gameMaster();
  const roundActivePlayer = this.roundActivePlayer();
  const result = { newRoundLogEvents: [], newRoundNumber: roundNumber };

  switch (this.roundStep) {
    case 'ROUND_START': {
      const player = this.selectNextActivePlayer();

      result.newRoundNumber++;
      result.newRoundLogEvents.push(
        `Начало раунда №${result.newRoundNumber}. Ход игрока <a>${player.getUserName()}</a>`
      );

      this.set({ round: result.newRoundNumber }); // без этого не отработает prepareRoundObject -> calcClientMoney
      const round = this.prepareRoundObject();

      result.statusLabel = `Раунд ${result.newRoundNumber}`;
      result.roundStep = 'ROULETTE';

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

      player.updateIncome(income);

      const { white, black } = this.dicecubes;
      result.newRoundLogEvents.push(
        `На кубиках выпали значения: <a style="color:white">${white.value}</a> и <a style="color:dimgray">${black.value}</a>`
      );

      if (white.value === black.value) {
        for (const player of this.players()) {
          if (player.active) continue;

          const busters = player.decks.buster.items().filter((b) => b.name === 'activist');
          if (busters.length > 0) {
            if (!round.playersWithActiveBusters) round.playersWithActiveBusters = [];
            round.playersWithActiveBusters.push(player.id());

            const eventData = {
              playDisabled: true,
              enableControlBtn: true,
              controlBtn: { label: 'Завершить действие' },
              playEnabledObjects: Object.fromEntries(busters.map((b) => [b.id(), true])),
            };
            player.activate({
              notifyUser: 'Ты можешь воспользоваться картой <a>ДЕЯТЕЛЬ</a>',
              setData: gameMaster ? {} : { eventData },
            });
          }
        }
      }

      const needRestoreResources = player.needRestoreResources();
      const needRestoreIncome = player.income < player.maxIncome();
      if ((needRestoreResources || needRestoreIncome) && !gameMaster) {
        const staticHelper = {
          text: `Доступные действия (<a>завершают ход</a>):`,
          buttons: [
            needRestoreResources ? { text: 'Восстановить ресурсы', code: 'RESTORE_RESOURCES' } : null,
            needRestoreIncome ? { text: 'Восстановить доход', code: 'RESTORE_INCOME' } : null,
            { text: 'Закрыть', code: 'DO_NOTHING', exit: true },
          ],
        };
        const eventData = { deal: { skipRound: true } };

        if (player.income === 0) {
          eventData.bankrupt = true;
          eventData.controlBtn = null;
          staticHelper.text = `Вы банкрот, для продолжения хода необходимо восстановить доход. ` + staticHelper.text;
          staticHelper.buttons = staticHelper.buttons.filter((b) => b && b.code !== 'DO_NOTHING');
        }

        player.set({ eventData, staticHelper });
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
      for (const player of this.players()) {
        for (const company of player.decks.company.items() || []) {
          company.set({ played: null });
        }
        if (round.playersWithActiveBusters?.includes(player.id())) {
          player.deactivate({
            setData: {
              eventData: { playDisabled: true, playEnabledObjects: null, controlBtn: null, enableControlBtn: null },
            },
          });
        }
      }

      roulette.spin({ player: roundActivePlayer });

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

      roundActivePlayer.set({
        eventData: { playDisabled: true, enableControlBtn: null, deal: null },
        staticHelper: null,
      });

      return { ...result, forcedEndRound: true };
    }
  }
});
