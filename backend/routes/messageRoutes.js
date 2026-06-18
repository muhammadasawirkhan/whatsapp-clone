import express from "express";
import { sendMessage, getMessages, markRead } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), sendMessage);
router.get("/:chatId", protect, getMessages);
router.put("/read/:chatId", protect, markRead);

export default router;