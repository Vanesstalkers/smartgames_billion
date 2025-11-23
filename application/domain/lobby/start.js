async () => {
  const code = 'billion';
  const smartgamesURL = `https://smartgames.studio/${code}`;

  lib.lobby.__gameServerConfig = {
    code,
    title: 'Игра на миллиард',
    icon: ['fa', 'rub'],
    active: true,
    url: lib.lobby.__devMode ? 'http://localhost:8085' : smartgamesURL,
    serverUrl: lib.lobby.__devMode ? `http://localhost:${config.server.ports[0]}` : `${smartgamesURL}/api`,
    games: {}, // будет заполнено в lib.lobby.start.fillingLobbyGamesList
  };
  lib.lobby.__tutorialImgPrefix = lib.lobby.__devMode ? '' : `/${code}`;

  {
    // TO_CHANGE - uncomment if needed
    // const files = await node.fsp.readdir('./application/static/img/cards', { withFileTypes: true });
    // const cardTemplates = Object.values(files).map((_) => _.name);
    // domain.game.configs.cardTemplates = cardTemplates;
    // domain.game.configs.cardTemplates.random = ({ exclude = [] } = {}) => {
    //   const templates = cardTemplates.filter((_) => !exclude.includes(_));
    //   return templates[Math.floor(Math.random() * templates.length)];
    // };
  }

  if (application.worker.id === 'W1') {
    db.redis.handlers.afterStart({ workerStarted: async () => {
      async function connectToLobby() {
        const smartgamesLobby = await db.redis.get('smartgamesPortalLobby', { json: true });
        if (smartgamesLobby) {
          const { channelName } = smartgamesLobby;
          lib.store.broadcaster.publishAction(channelName, 'gameServerConnected', lib.lobby.__gameServerConfig);
          return;
        }
        setTimeout(async () => await connectToLobby(), 1000);
      }
      await connectToLobby();
    } });
  }
};
