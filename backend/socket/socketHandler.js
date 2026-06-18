import Message from "../models/Message.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("user:online", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit("users:online", Array.from(onlineUsers.keys()));
    });

    socket.on("chat:join", (chatId) => {
      socket.join(chatId);
    });

    socket.on("message:send", async (data) => {
      const { chatId, message } = data;

      // 1. Send live message to receiver if they are inside the chat window
      socket.to(chatId).emit("message:receive", message);

      // 2. Send live update to SENDER'S sidebar instantly
      socket.emit("sidebar:update", message);

      // 3. Extract receiver ID safely with fallbacks
      const receiverId = message.receiverId || message.receiver?._id || message.receiver;
      const recipientSocketId = onlineUsers.get(receiverId);

      if (recipientSocketId) {
        // Update message status to delivered in database
        await Message.findByIdAndUpdate(message._id, {
          status: "delivered",
        });

        const updatedMessage = { ...message, status: "delivered" };
        
        // Send live update to RECEIVER'S sidebar
        io.to(recipientSocketId).emit("sidebar:update", updatedMessage);

        // Send delivery tick confirmation back to sender
        socket.emit("message:status", {
          messageId: message._id,
          status: "delivered",
        });
      }
    });

    socket.on("message:read", async ({ chatId, senderId }) => {
      const senderSocketId = onlineUsers.get(senderId);

      // Permanently update unread messages to "read" status in MongoDB
      await Message.updateMany(
        { chat: chatId, sender: senderId, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );

      // Send blue tick notification to sender if they are online
      if (senderSocketId) {
        io.to(senderSocketId).emit("message:read:update", {
          chatId,
        });
      }
    });

    socket.on("typing:start", ({ chatId, userName }) => {
      socket.to(chatId).emit("typing:show", { userName });
    });

    socket.on("typing:stop", ({ chatId }) => {
      socket.to(chatId).emit("typing:hide");
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("users:online", Array.from(onlineUsers.keys()));
      }
    });
  });
};