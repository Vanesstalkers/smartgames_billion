(async function ({ code, dealId }, player) {
  const game = this;

  switch (code) {
    case 'ACCEPT_DEAL': {
      const { group, amount, payType, buyerId } = player.eventData.deal;
      const buyer = game.get(buyerId);
      const chip = game.get(buyer.eventData.deal.resources[group].chipId);

      chip.set({ disabled: true, ownerId: buyer.id() });
      buyer.set({ acquired: { chip: { [chip.id()]: {} } } });
      if (payType === 'deferred') {
        const dealId = db.mongo.ObjectID().toString();
        buyer.set({ dealsMap: { [dealId]: { dealId, amount, sellerId: player.id() } } });
        player.set({ dealsMap: { [dealId]: { dealId, amount, buyerId: buyer.id() } } });
      }

      player.set({ eventData: { deal: null, disableActivePlayerCheck: null } });
      buyer.set({ staticHelper: null, eventData: { deal: null } });

      game.logs({
        msg: `Игрок {{player}} согласился на сделку с ${buyer.userName} по покупке ${chip.getTitle()}.`,
        userId: player.userId,
      });
      buyer.notifyUser({ message: `Сделка состоялась` });
      break;
    }
    case 'DECLINE_DEAL': {
      const buyer = game.get(player.eventData.deal.buyerId);

      game.logs({
        msg: `Игрок {{player}} отказался от сделки c ${buyer.userName}.`,
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
      }
      break;
    }
  }

  player.set({ staticHelper: null });
});
