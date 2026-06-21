import { createLlmService } from "@iceberg/llm";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const app = createApp({ llm: createLlmService() });

app.listen(port, () => {
  console.log(`Iceberg X Intelligence API listening on http://localhost:${port}`);
});
