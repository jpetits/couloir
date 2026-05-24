import { verifyToken } from "@clerk/backend";
import { Injectable } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets";
import { IncomingMessage } from "http";
import { WebSocket } from "ws";

export type WebsocketMessage =
  | { type: "sync:start" }
  | { type: "sync:progress"; progress: number }
  | { type: "sync:done"; count: number }
  | { type: "sync:error"; message: string };

interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
}

@Injectable()
@WebSocketGateway({ path: "/ws" })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: unknown;

  private connections = new Map<string, AuthenticatedWebSocket>();

  async handleConnection(ws: WebSocket, req: IncomingMessage) {
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
      (ws as AuthenticatedWebSocket).userId = userId;
      this.connections.set(userId, ws as AuthenticatedWebSocket);
    } catch {
      ws.close(1008, "Invalid token");
    }
  }

  handleDisconnect(ws: AuthenticatedWebSocket) {
    if (ws.userId) this.connections.delete(ws.userId);
  }

  sendMessage(userId: string, message: WebsocketMessage) {
    const ws = this.connections.get(userId);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
