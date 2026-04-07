import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "http";
import { verifyToken } from "@clerk/backend";

interface AuthenticatedWebsocket extends WebSocket {
  userId: string;
}

const connections = new Map<string, AuthenticatedWebsocket>();

export type WebsocketMessage =
  | { type: "sync:start" }
  | { type: "sync:progress"; progress: number }
  | { type: "sync:done"; count: number }
  | { type: "sync:error"; message: string };

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Unauthorized");
      return;
    }

    try {
      const { sub: userId } = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      connections.set(userId, ws as AuthenticatedWebsocket);
      ws.on("close", () => {
        connections.delete(userId);
      });
    } catch (error) {
      ws.close(1008, "Invalid token");
    }
  });
}

export function sendMessage(userId: string, message: WebsocketMessage) {
  const ws = connections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
