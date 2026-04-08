(async function ({ code, dealId }, player) {
  const game = this;

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
              acquired.chip = { [repayChipId]: { playerId: contractor.id() } };
              game.get(repayChipId).set({ ownerId: player.id() });
              break;
            }
            case 'service': {
              if (group) repay.group = group;
              if (repayCompanyId) repay.repayCompanyId = repayCompanyId;
              acquired.company = { [repayCompanyId]: { playerId: contractor.id() } };
              game.get(repayCompanyId).set({ ownerId: player.id() });
              break;
            }
          }
          contractor.set({
            money: contractor.money + amount,
            dealsMap: { [dealId]: { playerDebt: true, dealId, amount, contractorId: player.id(), ...repay } },
          });
          player.set({
            money: player.money - amount,
            dealsMap: { [dealId]: { dealId, amount, contractorId: contractor.id(), ...repay } },
            acquired: { ...acquired },
          });

          logMessage = `Игрок <a>{{player}}</a> одолжил <a>${amount}₽</a> игроку <a>${contractor.userName}</a>.`;
          break;
        }

        case 'buyResource': {
          const chip = game.get(contractor.eventData.deal.contractorResources[group].chipId);

          chip.set({ ownerId: contractor.id() });
          contractor.set({ acquired: { chip: { [chip.id()]: { playerId: player.id() } } } });
          if (payType === 'deferred') {
            const dealId = db.mongo.ObjectID().toString();
            contractor.set({ dealsMap: { [dealId]: { playerDebt: true, dealId, amount, contractorId: player.id() } } });
            player.set({ dealsMap: { [dealId]: { dealId, amount, contractorId: contractor.id() } } });
          } else {
            contractor.set({ money: contractor.money - amount });
            player.set({ money: player.money + amount });
          }

          logMessage = `Игрок <a>{{player}}</a> продал ресурс <a>${chip.getTitle()}</a> игроку <a>${
            contractor.userName
          }</a> за <a>${amount}₽</a>.`;
          break;
        }

        case 'useService': {
          const company = game.get(contractor.eventData.deal.contractorCompanies[group].companyId);

          contractor.set({ acquired: { company: { [company.id()]: { playerId: player.id() } } } });
          if (payType === 'deferred') {
            const dealId = db.mongo.ObjectID().toString();
            contractor.set({ dealsMap: { [dealId]: { playerDebt: true, dealId, amount, contractorId: player.id() } } });
            player.set({ dealsMap: { [dealId]: { dealId, amount, contractorId: contractor.id() } } });
          } else {
            contractor.set({ money: contractor.money - amount });
            player.set({ money: player.money + amount });
          }

          logMessage = `Игрок <a>{{player}}</a> дал доступ к услуге <a>${company.getTitle()}</a> игроку <a>${
            contractor.userName
          }</a> за <a>${amount}₽</a>.`;
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
      deck.getRandomItem().moveToTarget(deck.subtype === 'buster' ? player.decks.buster : player.decks.company);

      player.set({ money: player.money - price, eventData: { deal: null } });

      game.logs({
        msg:
          deck.subtype === 'buster'
            ? `Игрок <a>{{player}}</a> приобрел бустер за <a>${price}₽</a>.`
            : `Игрок <a>{{player}}</a> приобрел предприятие <a>${deck.getTitle()}</a> за <a>${price}₽</a>.`,
        userId: player.userId,
      });
      player.notifyUser({
        message:
          deck.subtype === 'buster'
            ? `Вы приобрели бустер за <a>${price}₽</a>.`
            : `Вы приобрели предприятие <a>${deck.getTitle()}</a> за <a>${price}₽</a>.`,
      });
      break;
    }
    case 'DECLINE_DEAL': {
      const contractor = game.get(player.eventData.deal.contractorId);
      if (contractor) {
        game.logs({
          msg: `Игрок <a>{{player}}</a> отказался от сделки c <a>${contractor.userName}</a>.`,
          userId: player.userId,
        });
        contractor.set({ staticHelper: null });
        contractor.notifyUser({ message: `Сделка отменена` });
      }
      break;
    }
    case 'CLOSE_DEAL': {
      const deal = player.deals().find((d) => d.dealId === dealId);
      if (deal) {
        const contractor = game.get(deal.contractorId);
        contractor.set({ money: contractor.money + deal.amount, dealsMap: { [deal.dealId]: null } });
        player.set({ money: player.money - deal.amount, dealsMap: { [deal.dealId]: null } });

        game.logs({
          msg: `Игрок <a>{{player}}</a> вернул <a>${deal.amount}₽</a> игроку <a>${contractor.userName}</a>.`,
          userId: player.userId,
        });

        if (player.deals().length) return player.showDealsHelper(); // актуализируем список сделок (чтобы закрыть несколько за раз)
      }
      break;
    }
  }

  player.set({ staticHelper: null });
});
