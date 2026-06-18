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

     
      socket.to(chatId).emit("message:receive", message);

    
      socket.emit("sidebar:update", message);

      
      const receiverId = message.receiverId || message.receiver?._id || message.receiver;
      const recipientSocketId = onlineUsers.get(receiverId);

      if (recipientSocketId) {
        
        await Message.findByIdAndUpdate(message._id, {
          status: "delivered",
        });

        const updatedMessage = { ...message, status: "delivered" };
        
        
        io.to(recipientSocketId).emit("sidebar:update", updatedMessage);

        
        socket.emit("message:status", {
          messageId: message._id,
          status: "delivered",
        });
      }
    });

    socket.on("message:read", async ({ chatId, senderId }) => {
      const senderSocketId = onlineUsers.get(senderId);

      
      await Message.updateMany(
        { chat: chatId, sender: senderId, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );

      
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