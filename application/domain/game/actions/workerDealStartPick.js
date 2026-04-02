(async function ({ sellerPlayerId, amount } = {}, buyer) {
  const game = this;

  /** Те же 11 отраслевых типов, что в `domain/game/configs/games.js` (deckList компаний). */
  const WORKER_DEAL_RESOURCES = [
    ['light', 'Лёгкая промышленность'],
    ['mining', 'Горнодобыча'],
    ['finance', 'Финансы'],
    ['electronic', 'Электроника'],
    ['media', 'Медиа'],
    ['distribution', 'Дистрибуция'],
    ['art', 'Искусство'],
    ['it', 'IT'],
    ['engineering', 'Машиностроение'],
    ['chemistry', 'Химия'],
    ['construction', 'Строительство'],
  ];

  function firstSellerChipForSubtype(sellerPlayer, subtype) {
    const industry = sellerPlayer.decks?.industry;
    if (!industry) return null;
    for (const company of industry.items() || []) {
      if (typeof company._ensureCompanyDecks === 'function') company._ensureCompanyDecks();
      for (const deck of [company.decks?.outer, company.decks?.inner].filter(Boolean)) {
        for (const chip of deck.items() || []) {
          if (company.subtype === subtype || chip.value === subtype || chip.subtype === subtype) {
            return chip;
          }
        }
      }
    }
    return null;
  }

  if (!sellerPlayerId) throw new Error('Не указан оппонент-продавец.');
  if (!buyer?.matches?.({ className: 'Player' })) throw new Error('Игрок не найден.');

  const seller = game.get(sellerPlayerId);
  if (!seller?.matches?.({ className: 'Player' })) throw new Error('Оппонент не найден в игре.');
  if (seller === buyer) throw new Error('Нельзя оформить сделку с самим собой.');

  const dealAmount = Number(amount);
  if (!Number.isFinite(dealAmount) || dealAmount <= 0) throw new Error('Укажите корректную сумму сделки.');

  const industry = seller.decks?.industry;
  if (!industry) throw new Error('У оппонента нет отраслевых карт в руке.');

  const pickButtons = [];
  for (const [subtype, label] of WORKER_DEAL_RESOURCES) {
    const chip = firstSellerChipForSubtype(seller, subtype);
    if (!chip) continue;
    pickButtons.push({
      text: label,
      workerDealPickChip: chip.id(),
      workerDealPayment: 'immediate',
      key: null,
    });
  }

  if (pickButtons.length === 0) throw new Error('У оппонента нет ресурсов для выбора.');

  const pickPayload = {
    amount: dealAmount,
    pickButtons: lib.utils.structuredClone(pickButtons),
  };

  const abortPick = domain?.game?.actions?.workerDealAbortPick;
  if (typeof abortPick === 'function') {
    await abortPick.call(game, {}, buyer);
  }

  const prevControlBtn = buyer.eventData.controlBtn
    ? lib.utils.structuredClone(buyer.eventData.controlBtn)
    : null;

  const session = {
    sellerPlayerId: seller.id(),
    dealAmount,
    payment: null,
    pendingChipId: null,
    prevControlBtn,
  };

  buyer.set({
    eventData: {
      controlBtn: { label: 'Отменить сделку', workerDealAbort: true },
      workerDealPickUI: pickPayload,
    },
  });

  const storeUser = lib.store('user').get(buyer.userId);
  if (storeUser) {
    storeUser.set({
      workerDealPickUI: lib.utils.structuredClone(pickPayload),
      workerDealSession: lib.utils.structuredClone(session),
    });
    await storeUser.saveChanges();
  }
});
