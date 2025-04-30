const express = require('express');
const Visitor = require('../models/visitor.model');
const Chats = require('../models/chats.model')
const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const router = express.Router();

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

//create messages
router.post('/', async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'message is required.' });

        const newMessage = new Chats(message);
        await newMessage.save();
        const { ticketId, visitorId, senderType } = newMessage;

        // Count number of tickets for the visitor
        const countTickets = await Ticket.countDocuments({ visitorId });

        let visitorFirstTicket = await Ticket.findOne({ visitorId }).sort({ createdAt: 1 });
        const chats = await Chats.find({ ticketId: visitorFirstTicket._id }).sort({ createdAt: 1 });

        // If only one ticket exists, remove automated messages
        

        if (senderType === 'team') {
            if (countTickets === 1) {
                chats.splice(1, 2); // Remove automated messages (assumption: 2 messages after index 0)
            }
            const visitorChats = chats.filter(chat => chat.senderType === 'visitor');
            const teamChats = chats.filter(chat => chat.senderType === 'team');
        
            if (visitorChats.length > 0 && teamChats.length > 0) {
                const elapsedTime = new Date(teamChats[0].createdAt) - new Date(visitorChats[0].createdAt);
        
                if (ticketId.toString() === visitorFirstTicket._id.toString()) {
                    visitorFirstTicket.elapsedTime = elapsedTime;
                    await visitorFirstTicket.save();
                } else {
                    const currentTicket = await Ticket.findById(ticketId);
                    currentTicket.elapsedTime = elapsedTime;
                    await currentTicket.save();
                }
            }
        }

        // Get visitor details
        const visitor = await Visitor.findById(visitorId);

        // If message is from visitor or isTicketActive is false, create a new ticket
        if (senderType === 'visitor' || visitor?.isTicketActive === false) {
            const superAdmin = await User.findOne({ role: 'super-admin' });
            const newTicket = new Ticket({
                visitorId: visitor._id,
                status: 'unresolved',
                title: newMessage.content,
                userId: superAdmin._id
            });
            await newTicket.save();

            // Update visitor's isTicketActive to true
            visitor.isTicketActive = true;
            await visitor.save();

            // Assign the new ticketId to the message
            newMessage.ticketId = newTicket._id;
            newMessage.userId = superAdmin._id;
        }

        await newMessage.save();

        res.status(201).json({ message: "Chat created", chat: newMessage });
    } catch (error) {
        next(error);
    }
});

module.exports = router;