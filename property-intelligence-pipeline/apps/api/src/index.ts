import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3002);
const app = createApp();

app.listen(port, () => {
  console.log(`Property Intelligence Pipeline API on http://localhost:${port}`);
  console.log(`PLAUD_MODE=${process.env.PLAUD_MODE ?? "mock"} LLM_PROVIDER=${process.env.LLM_PROVIDER ?? "gemini"}`);
});
