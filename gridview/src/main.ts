import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

// vue-next-masonry を読み込んでグローバルに登録
import masonry from "vue-next-masonry";

const app = createApp(App);
app.use(masonry);
app.mount("#app");
