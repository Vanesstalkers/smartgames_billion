(async function ({ accepted } = {}, seller) {
  const game = this;

  if (typeof accepted !== 'boolean') throw new Error('Некорректный ответ по сделке.');

  let buyer = null;
  let session = null;
  for (const p of game.players()) {
    const su = lib.store('user').get(p.userId);
    const s = su?.workerDealSession;
    if (s?.pendingChipId && s.sellerPlayerId === seller.id()) {
      buyer = p;
      session = s;
      break;
    }
  }

  if (!buyer || !session) throw new Error('Нет активного предложения сделки.');

  seller.set({ staticHelper: null, eventData: { disableActivePlayerCheck: null } });
  buyer.set({ staticHelper: null });

  if (accepted) {
    const proposedChip = game.get(session.pendingChipId);
    if (!proposedChip?.matches?.({ className: 'Chip' })) throw new Error('Ресурс по сделке не найден.');

    const typeKey = industryTypeKeyForChip(proposedChip);
    const handChip = firstSellerIndustryChipByType(seller, typeKey);
    if (!handChip) throw new Error('В отраслевой руке нет подходящего ресурса для сделки.');

    handChip.set({
      disabled: true,
      ownerId: buyer.id(),
      eventData: { workerDealHighlight: null },
    });

    const prev = buyer.acquired || {};
    buyer.set({
      acquired: {
        chip: { ...(prev.chip || {}), [handChip.id()]: {} },
        service: { ...(prev.service || {}) },
        buster: { ...(prev.buster || {}) },
        store: { ...(prev.store || {}) },
        other: { ...(prev.other || {}) },
      },
    });

    game.logs({
      msg: `Игрок {{player}} согласился с условиями сделки по ресурсу.`,
      userId: seller.userId,
    });
  } else {
    game.logs({
      msg: `Игрок {{player}} отказался от сделки по ресурсу.`,
      userId: seller.userId,
    });
  }

  const abortPick = domain?.game?.actions?.workerDealAbortPick;
  if (typeof abortPick === 'function') {
    await abortPick.call(game, {}, buyer);
  }
});

function industryTypeKeyForChip(chip) {
  let p = chip.parent();
  while (p) {
    if (p.matches?.({ className: 'Player' })) break;
    if (p.matches?.({ className: 'Card' }) && p.subtype) return p.subtype;
    p = p.parent();
  }
  return chip.value || chip.subtype || null;
}

function firstSellerIndustryChipByType(sellerPlayer, typeKey) {
  if (!typeKey) return null;
  const industry = sellerPlayer.decks?.industry;
  if (!industry) return null;
  for (const company of industry.items() || []) {
    if (typeof company._ensureCompanyDecks === 'function') company._ensureCompanyDecks();
    for (const deck of [company.decks?.outer, company.decks?.inner].filter(Boolean)) {
      for (const chip of deck.items() || []) {
        if (chip.disabled) continue;
        if (company.subtype === typeKey || chip.value === typeKey || chip.subtype === typeKey) {
          return chip;
        }
      }
    }
  }
  return null;
}
