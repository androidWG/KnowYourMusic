<template>
  <h1 class="fw-bold">Know Your Music</h1>
  <SpotifyLoginButton v-if="notLoggedIn" @token-received="tokenReceived"></SpotifyLoginButton>
  <Player v-else></Player>
</template>

<script>
import SpotifyLoginButton from './components/SpotifyLoginButton.vue'
import Player from "@/components/Player";

let code = new URLSearchParams(window.location.search).get("code")
if (code != null) {
  window.opener.postMessage(
      { response: code },
      window.opener.location
  );
}

export default {
  name: 'App',
  data() {
    return {accessToken: "", notLoggedIn: true}
  },
  components: {
    Player,
    SpotifyLoginButton
  },
  methods: {
    tokenReceived(token) {
      this.accessToken = token
      this.notLoggedIn = false
    }
  }
}
</script>

<style>
</style>
