import User from '../models/User.js';
import Chat from '../models/Chat.js';

export const searchUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  try {
    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    }).select('-password');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' },
      });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, userId],
      });

      chat = await Chat.findById(chat._id).populate(
        'participants',
        '-password'
      );
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};