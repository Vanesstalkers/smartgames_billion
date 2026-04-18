(function ({ cardId }, player) {
  if (player.triggerEventEnabled())
    throw new Error('Игрок не может совершить это действие, пока не завершит активное событие');

  const card = this.get(cardId);

  try {
    card.play({ player, logMsg: `Игрок <b>{{player}}<b/> активировал услугу <a>${card.getTitle()}</a>.` });
  } catch (error) {
    this.logs(error.message);
    player.notifyUser(error.message);
  }
});
