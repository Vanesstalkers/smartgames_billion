<template>
  <lobby :customInitSession="insideIframe ? customInitSession : null" />
</template>

<script>
import Lobby from '~/lib/lobby/front/Lobby.vue';
export default {
  name: 'BillionLobby',
  components: { Lobby },
  computed: {
    state() {
      return this.$root.state || {};
    },
    insideIframe() {
      return new URLSearchParams(document.location.search).get('userId');
    },
  },
  methods: {
    async customInitSession() {
      await this.$root.initSessionIframe();
    },
  },
  created() {
    // this.state.emit.logout = async () => {
    //   window.parent.postMessage({ emit: { name: 'hideGameIframe' } }, '*');
    // };
  },
  async beforeDestroy() {},
};
</script>
<style lang="scss">
#lobby {
  // чтобы не мельтешил при загрузке игры
  display: none !important;
}
</style>
