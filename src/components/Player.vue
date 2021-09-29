<template>
  <div class="d-flex flex-column align-items-center">
    <img id="albumCover" alt="Album Cover" class="p-3"
         src="../../public/cover-unknown.svg" width="400"/>
    <button v-on:click="playRandomSong" type="button" class="btn btn-primary px-4" @click="playRandomSong">Play</button>
  </div>
</template>

<script>
import {initializePlayer, getRandomSong, playSong} from "@/spotify"

export default {
  name: "Player",
  data() {
    return {
      deviceId: "",
      songUri: ""
    }
  },
  methods: {
    async playRandomSong() {
      if (this.deviceId === "") {
        this.deviceId = await initializePlayer(this.$parent.accessToken)
      }

      let song = await getRandomSong(this.$parent.accessToken)
      this.songUri = song.uri

      playSong(this.songUri, this.$parent.accessToken, this.deviceId)
    }
  }
}
</script>

<style scoped>

</style>
