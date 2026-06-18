import express from "express";
import { searchUsers, accessChat, getMyChats } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/chats", protect, getMyChats);
router.post("/chat", protect, accessChat);

export default router;