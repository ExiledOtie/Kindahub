const CommunicationModel = require("../models/communicationModel");

// ====================================
// Get all conversations for a user
// ====================================
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations =
      await CommunicationModel.getUserConversations(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

// ====================================
// Get messages for a conversation
// ====================================
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages =
      await CommunicationModel.getMessages(conversationId);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

// ====================================
// Send message
// ====================================
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;

    const { conversationId } = req.params;

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const newMessage =
      await CommunicationModel.createMessage(
        conversationId,
        senderId,
        message.trim()
      );

    // Socket.IO will go here later

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// ====================================
// Delete message (soft delete)
// ====================================
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage =
      await CommunicationModel.deleteMessage(messageId);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};

// ====================================
// Start or retrieve private conversation
// ====================================
exports.startPrivateConversation = async (
  req,
  res
) => {
  try {
    const currentUserId = req.user.id;

    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient is required",
      });
    }

    // Find existing private conversation
    const existing =
      await CommunicationModel.findPrivateConversation(
        currentUserId,
        recipientId
      );

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
      });
    }

    // Create conversation
    const conversation =
      await CommunicationModel.createConversation(
        "private"
      );

    // Add both participants
    await CommunicationModel.addParticipant(
      conversation.id,
      currentUserId
    );

    await CommunicationModel.addParticipant(
      conversation.id,
      recipientId
    );

    res.status(201).json({
      success: true,
      message:
        "Private conversation created",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Start private conversation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to start private conversation",
    });
  }
};

// ====================================
// Get group conversation
// ====================================
exports.getGroupConversation = async (
  req,
  res
) => {
  try {
    const { groupId } = req.params;

    const conversation =
      await CommunicationModel.getGroupConversation(
        groupId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Group conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Get group conversation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch group conversation",
    });
  }
};

// ====================================
// Add participant to conversation
// ====================================
exports.addParticipant = async (
  req,
  res
) => {
  try {
    const { conversationId } = req.params;

    const { userId } = req.body;

    const participant =
      await CommunicationModel.addParticipant(
        conversationId,
        userId
      );

    res.status(201).json({
      success: true,
      message: "Participant added",
      data: participant,
    });
  } catch (error) {
    console.error(
      "Add participant error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add participant",
    });
  }
};