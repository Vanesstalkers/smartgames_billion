(async function ({}, buyer) {
  const game = this;

  if (!buyer?.matches?.({ className: 'Player' })) return;

  const storeUser = lib.store('user').get(buyer.userId);
  const session = storeUser?.workerDealSession;

  if (session?.pendingChipId) {
    const chipObj = game.get(session.pendingChipId);
    chipObj?.set({ eventData: { workerDealHighlight: null } });
  }

  const sellerObj = session?.sellerPlayerId ? game.get(session.sellerPlayerId) : null;
  if (sellerObj?.matches?.({ className: 'Player' })) {
    sellerObj.set({ staticHelper: null, eventData: { disableActivePlayerCheck: null } });
  }

  buyer.set({ staticHelper: null });

  if (session) {
    buyer.set({
      eventData: {
        workerDealPickUI: null,
        deck: null,
        controlBtn: session.prevControlBtn ?? null,
      },
    });
    if (storeUser) {
      storeUser.set({ workerDealPickUI: null, workerDealSession: null });
      await storeUser.saveChanges();
    }
  } else {
    buyer.set({ eventData: { workerDealPickUI: null } });
    if (storeUser) {
      storeUser.set({ workerDealPickUI: null });
      await storeUser.saveChanges();
    }
  }
});
