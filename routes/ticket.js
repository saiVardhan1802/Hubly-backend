const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');
const Chat = require('../models/chats.model');
const Visitor = require('../models/visitor.model');


router.get('/:userId', authMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const tickets = await Ticket.find({ userId }).sort({ createdAt: 1 }).lean();

        const ticketsWithLastChat = await Promise.all(tickets.map(async (ticket) => {
            const lastChat = await Chat.findOne({ ticketId: ticket._id })
                .sort({ createdAt: -1 }).lean();

            return {
                ...ticket,
                lastChat: lastChat.content || null,
            };
        }));

        res.status(200).json({
            message: "user found successfully",
            tickets: ticketsWithLastChat
        });
    } catch (error) {
        next(error)
    }
});

//assign ticket to different member
router.patch('/:ticketId', authMiddleware, async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const { userId, status } = req.body; // new userId to update

        const updateFields = {};

        if (userId) updateFields.userId = userId;
        if (status) updateFields.status = status;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            updateFields, 
            { new: true } 
        );

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({
            message: "Ticket updated successfully"
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;