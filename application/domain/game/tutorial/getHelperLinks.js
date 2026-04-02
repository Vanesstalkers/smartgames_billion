() => ({
  ...lib.game.tutorial.getHelperLinks(),
  readyBtn: {
    selector: '.player.iam .card-worker .ready-btn',
    displayForced: true,
    tutorial: 'game-tutorial-links',
    type: 'game',
    pos: { top: true, left: true },
  },
  rouletteResource: {
    selector: '.roulette-stop-anchor .chip',
    displayForced: true,
    tutorial: 'game-tutorial-links',
    type: 'game',
    pos: { bottom: true, right: true },
  },
});
