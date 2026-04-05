(async function ({ code, dealId }, player) {
  const game = this;

  switch (code) {
    case 'ACCEPT_DEAL': {
      const { dealType, group, amount, payType, buyerId } = player.eventData.deal;
      const buyer = game.get(buyerId);

      let logMessage = '';
      switch (dealType) {
        case 'borrowMoney': {
          const dealId = db.mongo.ObjectID().toString();
          buyer.set({
            money: buyer.money + amount,
            dealsMap: { [dealId]: { dealId, amount, sellerId: player.id() } },
          });
          player.set({
            money: player.money - amount,
            dealsMap: { [dealId]: { dealId, amount, buyerId: buyer.id() } },
          });

          logMessage = `Игрок <a>{{player}}</a> одолжил <a>${amount} ₽₽₽</a> игроку <a>${buyer.userName}</a>.`;
          break;
        }

        case 'buyResource': {
          const chip = game.get(buyer.eventData.deal.resources[group].chipId);

          chip.set({ ownerId: buyer.id() });
          buyer.set({ acquired: { chip: { [chip.id()]: { sellerId: player.id() } } } });
          if (payType === 'deferred') {
            const dealId = db.mongo.ObjectID().toString();
            buyer.set({ dealsMap: { [dealId]: { dealId, amount, sellerId: player.id() } } });
            player.set({ dealsMap: { [dealId]: { dealId, amount, buyerId: buyer.id() } } });
          } else {
            buyer.set({ money: buyer.money - amount });
            player.set({ money: player.money + amount });
          }

          logMessage = `Игрок <a>{{player}}</a> продал ресурс <a>${chip.getTitle()}</a> игроку <a>${
            buyer.userName
          }</a> за <a>${amount} ₽₽₽</a>.`;
          break;
        }

        case 'useService': {
          const company = game.get(buyer.eventData.deal.companies[group].companyId);

          company.set({ used: true });
          buyer.set({ acquired: { company: { [company.id()]: { sellerId: player.id() } } } });

          logMessage = `Игрок <a>{{player}}</a> дал доступ к услуге <a>${company.getTitle()}</a> игроку <a>${
            buyer.userName
          }</a> за <a>${amount} ₽₽₽</a>.`;
          break;
        }
      }

      player.set({ eventData: { deal: null, disableActivePlayerCheck: null } });
      buyer.set({ staticHelper: null, eventData: { deal: null } });

      game.logs({ msg: logMessage, userId: player.userId });
      buyer.notifyUser({ message: `Сделка состоялась` });
      break;
    }
    case 'DECLINE_DEAL': {
      const buyer = game.get(player.eventData.deal.buyerId);
      game.logs({
        msg: `Игрок <a>{{player}}</a> отказался от сделки c <a>${buyer.userName}</a>.`,
        userId: player.userId,
      });
      buyer.notifyUser({ message: `Сделка отменена` });
      break;
    }
    case 'CLOSE_DEAL': {
      const deal = player.deals().find((d) => d.dealId === dealId);
      if (deal) {
        const seller = game.get(deal.sellerId);
        seller.set({ money: seller.money + deal.amount, dealsMap: { [deal.dealId]: null } });
        player.set({ money: player.money - deal.amount, dealsMap: { [deal.dealId]: null } });

        game.logs({
          msg: `Игрок <a>{{player}}</a> вернул <a>${deal.amount} ₽₽₽</a> игроку <a>${seller.userName}</a>.`,
          userId: player.userId,
        });

        if (player.deals().length) return player.showDealsHelper(); // актуализируем список сделок (чтобы закрыть несколько за раз)
      }
      break;
    }
  }

  player.set({ staticHelper: null });
});
