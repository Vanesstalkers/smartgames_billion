async () => {
  const code = config.smartgames.appCode;
  const smartgamesURL = `https://smartgames.studio/${code}`;

  lib.lobby.__gameServerConfig = {
    code,
    title: config.smartgames.appTitle,
    icon: config.smartgames.appIcon,
    active: true,
    url: lib.lobby.__devMode ? 'http://localhost:8085' : smartgamesURL, // port фронтенда
    serverUrl: lib.lobby.__devMode ? `http://localhost:${config.server.ports[0]}` : `${smartgamesURL}/api`,
    smartgamesServerUrl: lib.lobby.__devMode ? `http://localhost:8800` : `${smartgamesURL}/api`,
    games: {}, // будет заполнено в lib.lobby.start.fillingLobbyGamesList
  };
  lib.lobby.__tutorialImgPrefix = lib.lobby.__devMode ? '' : `/${code}`;

  if (application.worker.id === 'W1') {
    db.redis.handlers.afterStart({
      workerStarted: async () => {
        async function connectToLobby() {
          const { channelName } = (await db.redis.get(`${config.smartgames.appCode}Lobby`, { json: true })) || {};
          const smartgamesLobby = await db.redis.get('smartgamesPortalLobby', { json: true });
          if (channelName && smartgamesLobby) {
            lib.lobby.__gameServerConfig.channelName = channelName;

            lib.store.broadcaster.publishAction(
              smartgamesLobby.channelName,
              'gameServerConnected',
              lib.lobby.__gameServerConfig
            );
            return;
          }
          setTimeout(async () => await connectToLobby(), 1000);
        }
        await connectToLobby();
      },
    });
  }
};
