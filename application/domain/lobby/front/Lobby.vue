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
  mounted() {
    console.log("domain.lobby mounted() {");
  },
  async beforeDestroy() {},
};
</script>
<style lang="scss">
</style>
