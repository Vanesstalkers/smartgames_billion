() => ({
  steps: {
    ...lib.game.tutorial.links.steps,
    readyBtn: {
      pos: 'bottom-right',
      text: 'Для начала игры нажми кнопку "Готов" и ожидай остальных игроков',
      active: '.player.iam .card-worker',
      buttons: [{ text: 'Понятно, спасибо', action: 'exit' }],
    },
    rouletteResource: {
      pos: 'bottom-right',
      text: 'Для выбора действия с ресурсом необходимо нажать на него.',
      active: '.roulette-stop-anchor .chip',
      buttons: [{ text: 'Понятно, спасибо', action: 'exit' }],
    },
  },
});
