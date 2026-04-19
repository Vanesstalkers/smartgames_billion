(function ({ player, deck, price } = {}, initPlayer) {
  const game = this;
  const { decks } = player;

  const company = deck.getRandomItem();

  let artCompanyCount = decks.company.items().filter((c) => c.is('art')).length;
  if (company.is('art')) artCompanyCount++;
  if (artCompanyCount > 0) {
    game.decks.buster.moveRandomItems({ count: artCompanyCount, target: decks.buster });
  }

  company.moveToTarget(decks.company, { restoreResources: true });

  if (player.companyCount({ type: 'chemistry' }) > 0) {
    for (const company of decks.company.items()) {
      if (company.decks.inner.items().length === 4) continue;
      company.decks.inner.addItem({
        value: company.subtype,
        title: game.resources(company.subtype).title,
      });
    }
  }

  if (price) player.set({ money: player.money - price });

  game.logs({
    msg: `Игрок <a>{{player}}</a> приобрел предприятие <a>${company.title}</a> за <a>${price}₽</a>`,
    userId: player.userId,
  });
  player.notifyUser({ message: `Вы приобрели предприятие <a>${company.title}</a> за <a>${price}₽</a>` });

  game.set({ roundStep: 'ROUND_END' });

  const gameMaster = game.gameMaster();
  if (gameMaster) gameMaster.set({ eventData: { controlBtn: { label: 'Завершить раунд' } } });
  player.set(
    {
      staticHelper: { text: `Ход завершен по причине покупки предприятия` },
      eventData: {
        playDisabled: true,
        enableControlBtn: gameMaster ? false : true,
        controlBtn: { label: 'Завершить раунд' },
      },
    },
    { reset: ['staticHelper'] }
  );

  if (company.is('construction') && player.getOuterDecksChips().length < 2) {
    game.run('takeChip', { companyCardId: company.id(), targetPlayerId: player.id() }, initPlayer);
  }
});
