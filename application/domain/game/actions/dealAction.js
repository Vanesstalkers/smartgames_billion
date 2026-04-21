(async function ({ code, dealId, eventData = {} } = {}, player) {
  const game = this;
  const playerId = player.id();
  const rouletteChip = game.roulettes.main.chip();

  switch (code) {
    case 'ACCEPT_DEAL': {
      const { dealType, group, amount, payType, contractorId, repayType, repayChipId, repayCompanyId } =
        player.eventData.deal;
      const contractor = game.get(contractorId);

      let logMessage = '';
      switch (dealType) {
        case 'borrowMoney': {
          const dealId = db.mongo.ObjectID().toString();
          const repay = repayType ? { repayType } : {};
          const acquired = {};

          switch (repayType) {
            case 'resource': {
              if (group) repay.group = group;
              if (repayChipId) repay.repayChipId = repayChipId;
              const repayChip = game.get(repayChipId);

              repayChip.set({ ownerId: playerId });
              acquired.chip = { [repayChipId]: { playerId: contractorId } };

              const acquiredChip = contractor.acquired?.chip?.[repayChipId];
              if (acquiredChip) {
                if (acquiredChip.playerId === playerId) {
                  repayChip.set({ ownerId: null });
                  acquired.chip = { [repayChipId]: null };
                } else {
                  acquired.chip = { [repayChipId]: acquiredChip };
                }
                contractor.set({ acquired: { chip: { [repayChipId]: null } } });
              }

              if (rouletteChip?.value === group) {
                player.processDistributionIncome();
                contractor.processDistributionIncome();
              }
              break;
            }
            case 'service': {
              if (group) repay.group = group;
              if (repayCompanyId) repay.repayCompanyId = repayCompanyId;
              acquired.company = { [repayCompanyId]: { playerId: contractorId } };
              game.get(repayCompanyId).set({ ownerId: playerId });

              if (rouletteChip?.value === group) {
                player.processDistributionIncome();
                contractor.processDistributionIncome();
              }
              break;
            }
          }
          contractor.set({
            money: contractor.money + amount,
            dealsMap: { [dealId]: { playerDebt: true, dealId, amount, contractorId: playerId, ...repay } },
          });
          player.set({
            money: player.money - amount,
            dealsMap: { [dealId]: { dealId, amount, contractorId, ...repay } },
            acquired: { ...acquired },
          });

          logMessage = `Игрок <a>{{player}}</a> одолжил <a>${amount}₽</a> игроку <a>${contractor.userName}</a>`;
          break;
        }

        case 'buyResource': {
          const chipId = contractor.eventData.deal.contractorResources[group].chipId;
          const chip = game.get(chipId);

          chip.set({ ownerId: contractorId });
          contractor.set({ acquired: { chip: { [chipId]: { playerId } } } });

          const acquiredChip = player.acquired?.chip?.[chipId];
          if (acquiredChip) {
            if (acquiredChip.playerId === contractorId) {
              chip.set({ ownerId: null });
              contractor.set({ acquired: { chip: { [chipId]: null } } });
            }
            player.set({ acquired: { chip: { [chipId]: null } } });
          }

          if (payType === 'deferred') {
            const dealId = db.mongo.ObjectID().toString();
            contractor.set({ dealsMap: { [dealId]: { playerDebt: true, dealId, amount, contractorId: playerId } } });
            player.set({ dealsMap: { [dealId]: { dealId, amount, contractorId } } });
          } else {
            contractor.set({ money: contractor.money - amount });
            player.set({ money: player.money + amount });
          }

          logMessage = `Игрок <a>{{player}}</a> продал ресурс <a>${chip.getTitle()}</a> игроку <a>${
            contractor.userName
          }</a> за <a>${amount}₽</a>`;

          if (rouletteChip?.value === group) {
            player.processDistributionIncome();
            contractor.processDistributionIncome();
          }
          break;
        }

        case 'useService': {
          const company = game.get(contractor.eventData.deal.contractorCompanies[group].companyId);

          contractor.set({ acquired: { company: { [company.id()]: { playerId } } } });
          if (payType === 'deferred') {
            const dealId = db.mongo.ObjectID().toString();
            contractor.set({ dealsMap: { [dealId]: { playerDebt: true, dealId, amount, contractorId: playerId } } });
            player.set({ dealsMap: { [dealId]: { dealId, amount, contractorId } } });
          } else {
            contractor.set({ money: contractor.money - amount });
            player.set({ money: player.money + amount });
          }

          logMessage = `Игрок <a>{{player}}</a> дал доступ к услуге <a>${company.getTitle()}</a> игроку <a>${
            contractor.userName
          }</a> за <a>${amount}₽</a>`;

          if (rouletteChip?.value === group) {
            player.processDistributionIncome();
            contractor.processDistributionIncome();
          }
          break;
        }
      }

      player.set({ eventData: { deal: null, disableActivePlayerCheck: null } });
      contractor.set({ staticHelper: null, eventData: { deal: null } });

      game.logs({ msg: logMessage, userId: player.userId });
      contractor.notifyUser({ message: `Сделка состоялась` });
      break;
    }
    case 'USE_DECK': {
      const { deckId, price } = player.eventData.deal;
      const deck = game.get(deckId);

      if (eventData.changeCompanyEvent) {
        player.set({ eventData: { deal: { price: 10 } } });
        return this.initEvent(domain.game.events.company.light(), { game, player, initData: { sourceDeck: deck } });
      }

      if (deck.subtype === 'buster') {
        deck.getRandomItem().moveToTarget(player.decks.buster, {
          restoreResources: true,
        });

        const price = 10;
        player.set({ money: player.money - price, staticHelper: null, eventData: { deal: null } });

        game.logs({
          msg: `Игрок <a>{{player}}</a> приобрел бустер за <a>${price}₽</a>`,
          userId: player.userId,
        });
        player.notifyUser({ message: `Вы приобрели бустер за <a>${price}₽</a>` });
      } else {
        this.run('buyCompany', { player, deck, price }, player);
        player.set({ eventData: { deal: null } });
      }

      return;
    }
    case 'DECLINE_DEAL': {
      const contractor = game.get(player.eventData.deal.contractorId);
      if (contractor) {
        game.logs({
          msg: `Игрок <a>{{player}}</a> отказался от сделки c <a>${contractor.userName}</a>`,
          userId: player.userId,
        });
        contractor.set({ staticHelper: null });
        contractor.notifyUser({ message: `Сделка отменена` });
      }
      player.set({ eventData: { deal: null } });
      game.toggleEventHandlers('RESET', {}, player);
      break;
    }
    case 'CLOSE_DEAL': {
      const deal = player.deals().find((d) => d.dealId === dealId);
      if (deal) {
        const contractor = game.get(deal.contractorId);
        contractor.set({ money: contractor.money + deal.amount, dealsMap: { [deal.dealId]: null } });
        player.set({ money: player.money - deal.amount, dealsMap: { [deal.dealId]: null } });

        game.logs({
          msg: `Игрок <a>{{player}}</a> вернул <a>${deal.amount}₽</a> игроку <a>${contractor.userName}</a>`,
          userId: player.userId,
        });

        if (player.deals().length) return player.showDealsHelper(); // актуализируем список сделок (чтобы закрыть несколько за раз)
      }
      break;
    }
    case 'RESTORE_RESOURCES': {
      player.set({ eventData: { deal: null } });
      player.initEvent(domain.game.events.restoreResources({ skipRound: true }), { game, player });
      return;
    }
    case 'RESTORE_INCOME': {
      player.set({ eventData: { deal: null } });
      player.updateIncome(player.maxIncome());

      game.set({ roundStep: 'ROUND_END' });

      const gameMaster = game.gameMaster();
      if (gameMaster) gameMaster.set({ eventData: { controlBtn: { label: 'Завершить раунд' } } });
      player.set(
        {
          staticHelper: { text: `Ход завершен по причине восстановления дохода` },
          eventData: {
            playDisabled: true,
            enableControlBtn: gameMaster ? false : true,
            controlBtn: { label: 'Завершить раунд' },
          },
        },
        { reset: ['staticHelper'] }
      );
      return;
    }
    case 'USE_DIPLOMAT': {
      const { diplomatEvent: { playerId, eventCode } = {} } = player.eventData.deal;
      const contractor = game.get(playerId);
      const event = contractor.findEvent({ code: eventCode });
      const busterId = player.getBusters({ name: 'diplomat' })[0]?.id();
      event.emit('TRIGGER', {
        diplomatAction: eventData.doNothing
          ? { message: null }
          : busterId
          ? { busterId }
          : { message: 'Действие не возможно, так как в руке нет бустера <a>ДИПЛОМАТ</a>' },
      });
      player.deactivate().set({ staticHelper: null, eventData: { deal: null } });

      break;
    }
    case 'DO_NOTHING':
      player.set({ eventData: { deal: null } });
      break;
  }

  player.set({ staticHelper: null });
});
