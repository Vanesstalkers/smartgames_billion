async () => {
  lib.lobby.__tutorialImgPrefix = lib.lobby.__devMode ? '' : '/billion';

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
          const url = 'https://smartgames.studio/billion';
          lib.store.broadcaster.publishAction(channelName, 'gameServerConnected', {
            code: 'billion',
            title: 'Игра на миллиард',
            icon: ['fas', 'microchip'],
            active: true,
            url: lib.lobby.__devMode ? 'http://localhost:8085' : url,
            serverUrl: lib.lobby.__devMode ? `http://localhost:${config.server.ports[0]}` : `${url}/api`,
            games: lib.lobby.__games,
          });
          return;
        }
        setTimeout(async () => await connectToLobby(), 1000);
      }
      await connectToLobby();
    } });
  }
};
