(class Player extends lib.game._objects.Player {
  constructor(data, { parent }) {
    super(data, { parent });
    this.broadcastableFields(
      //
      this.broadcastableFields().concat(['income'])
    );

    this.set({ income: data.income || 6 });
  }
});
