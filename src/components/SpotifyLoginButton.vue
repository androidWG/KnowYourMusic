<template>
  <button class="btn btn-primary" v-on:click="askLogin">Login to Spotify</button>
</template>

<script>
import {getAccessToken, getLoginCode} from "@/spotify"

export default {
  name: "SpotifyLogin",
  methods: {
    async askLogin() {
      let code = await getLoginCode()
      let accessToken = await getAccessToken(code)

      this.$emit("token-received", accessToken)
    }
  },
  emits: ["token-received"]
}
</script>

<style scoped>

</style>
