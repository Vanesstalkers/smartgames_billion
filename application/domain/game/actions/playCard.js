(function ({ cardId }, player) {
  if (player.triggerEventEnabled())
    throw new Error('Игрок не может совершить это действие, пока не завершит активное событие');

  const card = this.get(cardId);

  try {
    const logMsg = `Игрок <a>${card.getPlayer().userName}</a> активировал услугу <a>${card.getTitle()}</a>.`;
    card.play({ player, logMsg });
  } catch (error) {
    this.logs(error.message);
    player.notifyUser(error.message);
  }
});
