import { config } from "./config.js";
import { createApp } from "./app.js";

const app = createApp();
app.listen(config.port, () => {
  console.log(`ForestTrace Sprint1 API running on http://localhost:${config.port}`);
});
