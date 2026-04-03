(async function ({ accepted } = {}, seller) {
  const game = this;

  if (!seller?.matches?.({ className: 'Player' })) throw new Error('Игрок не найден.');

  let dealEvent = null;
  for (const p of game.players()) {
    for (const ev of p.eventData.activeEvents || []) {
      if (ev.name !== 'deal') continue;
      if (!ev.data?.pendingChipId) continue;
      if (ev.data.seller?.id() !== seller.id()) continue;
      dealEvent = ev;
      break;
    }
    if (dealEvent) break;
  }

  if (!dealEvent) throw new Error('Нет активного предложения сделки.');

  const result = dealEvent.emit('SELLER_RESPOND', { accepted }, seller);
  if (result != null && typeof result.then === 'function') await result;
});
