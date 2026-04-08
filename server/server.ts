import dotenv from "dotenv";

dotenv.config();

import app from "./src/app";
import http from "http";
import { setupWebsocket } from "./src/services/websocket";

const server = http.createServer(app);
setupWebsocket(server);

const PORT = process.env.PORT || 8002;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
