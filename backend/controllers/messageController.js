import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// export const sendMessage = async (req, res) => {
//   const { chatId, content } = req.body;

//   const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
//   const fileType = req.file ? req.file.mimetype : '';

//   try {
//     let message = await Message.create({
//       chat: chatId,
//       sender: req.user._id,
//       content: content || '',
//       fileUrl,
//       fileType,
//     });

//     message = await message.populate('sender', 'name avatar');

//     await Chat.findByIdAndUpdate(chatId, {
//       lastMessage: message._id,
//     });

//     res.status(201).json(message);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  // Cloudinary returns the full URL in req.file.path
  const fileUrl = req.file ? req.file.path : '';
  const fileType = req.file ? req.file.mimetype : '';
  try {
    let message = await Message.create({ chat: chatId, sender: req.user._id, content: content || '', fileUrl, fileType });
    message = await message.populate('sender', 'name avatar');
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read' },
      }
    );

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};