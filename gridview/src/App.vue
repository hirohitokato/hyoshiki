<script setup lang="ts">
import Tiles from "./components/Tiles.vue";
import { getQueryParam } from "./composables/getQueryParam.ts";

const params = new URLSearchParams(window.location.search);
// URLパラメータから要素数、列数を取得。リアクティブな管理は不要なのでrefを使わない
const numTiles = getQueryParam("num_tiles", 10);
const columns = getQueryParam("num_columns", 4);
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <div style="width: 100vw; height: 400px; border: 1px solid black;">
    <Tiles  :num_tiles="numTiles" :columns="columns" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
