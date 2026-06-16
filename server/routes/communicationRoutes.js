const express = require("express");
const router = express.Router();

const communicationController = require(
  "../controllers/communicationController"
);

const authenticateToken = require("../middleware/authMiddleware");

// ========================================
// All routes require authentication
// ========================================
router.use(authenticateToken);

// ========================================
// Conversations
// ========================================

// Get all conversations for logged-in user
router.get(
  "/",
  communicationController.getConversations
);

// ========================================
// Messages
// ========================================

// Get messages for a conversation
router.get(
  "/:conversationId/messages",
  communicationController.getMessages
);

// Send a message
router.post(
  "/:conversationId/messages",
  communicationController.sendMessage
);

// Soft delete a message
router.delete(
  "/messages/:messageId",
  communicationController.deleteMessage
);

// ========================================
// Private Conversations
// ========================================

// Create or retrieve private conversation
router.post(
  "/private",
  communicationController.startPrivateConversation
);

// ========================================
// Group Conversations
// ========================================

// Get conversation linked to a group
router.get(
  "/groups/:groupId",
  communicationController.getGroupConversation
);

// ========================================
// Participants
// ========================================

// Add participant to conversation
router.post(
  "/:conversationId/participants",
  communicationController.addParticipant
);

module.exports = router;