const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
    visitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    },
    title: {
        type: String,
    },
    status: {
        type: String,
        enum: ['resolved', 'unresolved'],
        default: 'unresolved',
    },
    elapsedTime: {
        type: Number,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('Tickets', ticketSchema);