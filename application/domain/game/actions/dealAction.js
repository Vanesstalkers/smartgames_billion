(async function ({ code, dealId, eventData = {} } = {}, player) {
  const game = this;
  const playerId = player.id();
  const rouletteChip = game.roulettes.main.chip();

  switch (code) {
    case 'ACCEPT_DEAL': {
      const { dealType, code, amount, payType, contractorId, chipId, companyId, busterId } = player.eventData.deal;
      const contractor = game.get(contractorId);

      let logMessage = '';
      switch (dealType) {
        case 'buyResource': {
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

          switch (payType) {
            case 'deferred': {
              const dealId = db.mongo.ObjectID().toString();
              contractor.set({ dealsMap: { [dealId]: { debt: true, dealId, amount, contractorId: playerId } } });
              player.set({ dealsMap: { [dealId]: { dealId, amount, contractorId } } });
              break;
            }
            case 'immediate': {
              contractor.set({ money: contractor.money - amount });
              player.set({ money: player.money + amount });
              break;
            }
          }

          logMessage = `Игрок <a>{{player}}</a> продал ресурс <a>${chip.getTitle()}</a> игроку <a>${contractor.getUserName()}</a> за <a>${amount}₽</a>`;

          if (rouletteChip?.value === chip.value) {
            player.processDistributionIncome();
            contractor.processDistributionIncome();
          }
          break;
        }

        case 'borrowMoney': {
          const dealId = db.mongo.ObjectID().toString();

          contractor.set({
            money: contractor.money + amount,
            dealsMap: { [dealId]: { debt: true, dealId, amount, contractorId: playerId } },
          });
          player.set({
            money: player.money - amount,
            dealsMap: { [dealId]: { dealId, amount, contractorId } },
          });

          logMessage = `Игрок <a>{{player}}</a> дал в долг <a>${amount}₽</a> игроку <a>${contractor.getUserName()}</a>`;
          break;
        }

        case 'saleResource': {
          const acquired = {};

          const chip = game.get(chipId);
          chip.set({ ownerId: playerId });
          acquired.chip = { [chipId]: { playerId: contractorId } };

          const acquiredChip = contractor.acquired?.chip?.[chipId];
          if (acquiredChip) {
            if (acquiredChip.playerId === playerId) {
              chip.set({ ownerId: null });
              acquired.chip = { [chipId]: null };
            } else {
              acquired.chip = { [chipId]: acquiredChip };
            }
            contractor.set({ acquired: { chip: { [chipId]: null } } });
          }

          if (rouletteChip?.value === chip.value) {
            player.processDistributionIncome();
            contractor.processDistributionIncome();
          }

          switch (payType) {
            case 'deferred': {
              const dealId = db.mongo.ObjectID().toString();
              contractor.set({ dealsMap: { [dealId]: { dealId, amount, contractorId: playerId } } });
              player.set({ dealsMap: { [dealId]: { debt: true, dealId, amount, contractorId } } });
              break;
            }
            case 'immediate': {
              contractor.set({ money: contractor.money + amount });
              player.set({ money: player.money - amount });
              break;
            }
          }

          logMessage = `Игрок <a>{{player}}</a> купил ресурс <a>${chip.getTitle()}</a> у игрока <a>${contractor.getUserName()}</a> за <a>${amount}₽</a>`;
          break;
        }
        case 'saleService': {
          const company = game.get(companyId);
          player.set({ acquired: { company: { [companyId]: { playerId: contractorId } } } });

          switch (payType) {
            case 'deferred': {
              const dealId = db.mongo.ObjectID().toString();
              contractor.set({ dealsMap: { [dealId]: { dealId, amount, contractorId: playerId } } });
              player.set({ dealsMap: { [dealId]: { debt: true, dealId, amount, contractorId } } });
              break;
            }
            case 'immediate': {
              contractor.set({ money: contractor.money + amount });
              player.set({ money: player.money - amount });
              break;
            }
          }

          logMessage = `Игрок <a>{{player}}</a> купил услугу <a>${company.getTitle()}</a> у игрока <a>${contractor.getUserName()}</a> за <a>${amount}₽</a>`;
          break;
        }
        case 'saleBuster': {
          const buster = game.get(busterId);
          buster.moveToTarget(player.decks.buster);

          switch (payType) {
            case 'deferred': {
              const dealId = db.mongo.ObjectID().toString();
              contractor.set({ dealsMap: { [dealId]: { dealId, amount, contractorId: playerId } } });
              player.set({ dealsMap: { [dealId]: { debt: true, dealId, amount, contractorId } } });
              break;
            }
            case 'immediate': {
              contractor.set({ money: contractor.money + amount });
              player.set({ money: player.money - amount });
              break;
            }
          }

          logMessage = `Игрок <a>{{player}}</a> купил бустер <a>${buster.getTitle()}</a> у игрока <a>${contractor.getUserName()}</a> за <a>${amount}₽</a>`;
          break;
        }

        case 'useService': {
          const company = game.get(contractor.eventData.deal.contractorCompanies[code].companyId);

          contractor.set({ acquired: { company: { [company.id()]: { playerId } } } });
          switch (payType) {
            case 'deferred': {
              contractor.set({ dealsMap: { [dealId]: { debt: true, dealId, amount, contractorId: playerId } } });
              player.set({ dealsMap: { [dealId]: { dealId, amount, contractorId } } });
              break;
            }
            case 'immediate': {
              contractor.set({ money: contractor.money - amount });
              player.set({ money: player.money + amount });
              break;
            }
          }

          logMessage = `Игрок <a>{{player}}</a> продал услугу <a>${company.getTitle()}</a> игроку <a>${contractor.getUserName()}</a> за <a>${amount}₽</a>`;

          break;
        }
      }

      player.set({ eventData: { deal: null, disableActivePlayerCheck: null } });
      contractor.set({ staticHelper: null, eventData: { deal: null } });

      game.logs({ msg: logMessage, userId: player.userId });
      contractor.notifyUser({ message: `Сделка состоялась` });

      game.toggleEventHandlers('RESET', {}, contractor);
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
        contractor.notifyUser({ message: `Сделка отменена` });
        game.toggleEventHandlers('RESET', {}, contractor);
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
