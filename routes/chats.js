const express = require('express');
const Visitor = require('../models/visitor.model');
const Chats = require('../models/chats.model')
const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

//get messages for visitor route
router.get('/:visitorId', async (req, res, next) => {
    try {
        const { visitorId } = req.params;
        const visitor = Visitor.findById(visitorId);
        if (!visitor) {
            return res.status(404).json({ message: "Visitor does not exist." });
        }
        const messages = await Chats.find({ visitorId }).sort({ createdAt: 1 });
        res.status(200).json({
            message: "Messages found successfully.",
            messages
        })
    } catch (error) {
        next(error);
    }
});

//get messages for team member route
router.get('/ticket/:ticketId', authMiddleware, async (req, res, next) => {
    try {
        const { ticketId } = req.params;
        const ticketMessages = await Chats.find({ ticketId }).sort({ createdAt: 1 });
        if (ticketMessages.length === 0) {
            return res.status(404).json({ message: "Ticket not found." });
        }
        res.status(200).json({
            message: "chats found successfully",
            messages: ticketMessages
        });
    } catch (error) {
        next(error);
    }
})

//create messages
router.post('/', async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'message is required.' });

        // Create and save incoming chat message
        const newMessage = new Chats(message);
        await newMessage.save();
        const { ticketId, visitorId, senderType } = newMessage;

        // Identify the current ticket and first ticket for this visitor
        const [visitorFirstTicket, currentTicket] = await Promise.all([
            Ticket.findOne({ visitorId }).sort({ createdAt: 1 }),
            Ticket.findById(ticketId)
        ]);

        // Only calculate elapsedTime on first team reply
        if (senderType === 'team' && currentTicket) {
            // Fetch chats for current ticket
            const chats = await Chats.find({ ticketId: currentTicket._id }).sort({ createdAt: 1 });

            // If this is the first ticket, remove automated messages
            if (currentTicket._id.equals(visitorFirstTicket._id)) {
                chats.splice(1, 2);
            }

            // Calculate elapsedTime between first visitor and first team message
            const visitorChats = chats.filter(c => c.senderType === 'visitor');
            const teamChats = chats.filter(c => c.senderType === 'team');

            if (visitorChats.length > 0 && teamChats.length > 0) {
                const elapsedTime = new Date(teamChats[0].createdAt) - new Date(visitorChats[0].createdAt);
                currentTicket.elapsedTime = elapsedTime;
                await currentTicket.save();
            }
        }

        // Fetch visitor info
        const visitor = await Visitor.findById(visitorId);

        // If visitor sends a message and no active ticket, create a new one
        if (senderType === 'visitor' && !visitor.isTicketActive) {
            const superAdmin = await User.findOne({ role: 'super-admin' });
            const newTicket = new Ticket({
                visitorId: visitor._id,
                status: 'unresolved',
                title: newMessage.content,
                userId: superAdmin._id
            });
            await newTicket.save();

            // Update visitor's active status and assign ticketId
            visitor.isTicketActive = true;
            await visitor.save();

            newMessage.ticketId = newTicket._id;
            newMessage.userId = superAdmin._id;
            await newMessage.save();
        }

        res.status(201).json({ message: 'Chat created', chat: newMessage });
    } catch (error) {
        next(error);
    }
});


module.exports = router;