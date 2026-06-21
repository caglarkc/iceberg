import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createZoomProvider } from "./providers/index.js";

const config = loadConfig();
const provider = createZoomProvider(config.zoomMode);
const app = createApp({ config, provider });

app.listen(config.port, () => {
  console.log(`zoom-integration-core listening on :${config.port} (ZOOM_MODE=${config.zoomMode})`);
});
