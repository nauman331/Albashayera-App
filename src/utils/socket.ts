import { io, Socket } from "socket.io-client";
import { socketURL } from "./exports";
import { Alert } from "react-native";

class SocketService {
  private socket: Socket | null = null;

  // ✅ Getter to check if socket is connected
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  connect(token?: string) {
    if (this.isConnected) {
      console.log("✅ Socket already connected");
      return;
    }

    this.socket = io(socketURL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      query: { token },
    });

    this.socket.on("connect", () => {
      console.log("🔗 Connected to socket server");
      Alert.alert("🔗 Connected to the socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      Alert.alert("❌ Disconnected from the socket server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("⚠️ Connection Error:", error.message);
      Alert.alert("⚠️ Connection Error:", error.message);
    });

    this.socket.connect();
  }

  emit(event: string, data: any) {
    if (this.isConnected) {
      this.socket?.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit event '${event}' - socket not connected`);
    }
  }

  on<T>(event: string, callback: (data: T) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn(`⚠️ Cannot listen to event '${event}' - socket not connected`);
    }
  }

  off(event: string, handleAuctionOpened: (response: any) => void) {
    if (this.socket) {
      this.socket.off(event);
    } else {
      console.warn(`⚠️ Cannot remove listener for event '${event}' - socket not connected`);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 Socket disconnected");
      Alert.alert("🔌 Socket disconnected");
    }
  }
}

// ✅ Export a single instance to use everywhere
const socketService = new SocketService();
export default socketService;
