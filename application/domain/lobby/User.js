(class DomainLobbyUser extends domain.game.User {
  async enterLobby({ sessionId, lobbyId }) {
    const smartgamesLobby = await db.redis.get('smartgamesPortalLobby', { json: true });

    await lib.store.broadcaster.publishAction.call(this, smartgamesLobby.channelName, 'gameLobbyUserEnter', {
      sessionId,
      userId: this.id(),
      name: this.name,
      tgUsername: this.tgUsername,
      broadcastableFields: this.broadcastableFields(),
    });

    this.set({
      lobbyConfigs: {
        pinnedItems: {
          game: true,
        },
        billion: {
          gameCode: config.smartgames.appCode,
          gameConfig: 'main',
          gameRoundLimit: 40,
          gameTimer: 60,
          gameType: 'trainer',
          maxPlayersInGame: { max: 8, min: 1, val: 8 },
          minPlayersInGame: { max: 8, min: 1, val: 1 },
        },
      },
    });

    await super.enterLobby({ sessionId, lobbyId });
  }
});
