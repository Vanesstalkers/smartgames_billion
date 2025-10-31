export default {
  path: '/game/billion/:type/:id',
  name: 'Billion Game',
  component: function () {
    return import('./Game.vue');
  },
};
