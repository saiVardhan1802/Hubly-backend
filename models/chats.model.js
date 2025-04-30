const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    senderType: {
      type: String,
      enum: ['visitor', 'team'],
    },
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
      type: String,
      trim: true
    }
  }, { timestamps: true });
  
module.exports = mongoose.model('Chats', chatSchema);