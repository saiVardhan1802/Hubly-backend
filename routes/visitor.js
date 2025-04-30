const express = require('express');
const router = express.Router();
const Visitor = require('../models/visitor.model');
const Ticket = require('../models/ticket.model');
const Chat = require('../models/chats.model');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', async (req, res, next) => {
    try {
        const { name, phone, email, messages } = req.body;
        const newVisitor = await Visitor({
            name,
            phone,
            email,
            isTicketActive: true
        })
        const savedVisitor = await newVisitor.save();
        const superAdmin = await User.findOne({ role: 'super-admin' });

        // 2. Create Ticket for the visitor
        console.log(messages);
        const newTicket = new Ticket({
            visitorId: savedVisitor._id,
            status: 'unresolved', // or whatever default status
            title: messages.filter(msg => msg.senderType === 'visitor')[0].content,
            userId: superAdmin._id
        });
        const savedTicket = await newTicket.save();

        // 3. Create Messages and link to visitor and ticket
        if (messages && messages.length > 0) {
            const messageDocuments = messages.map(msg => ({
                visitorId: savedVisitor._id,
                ticketId: savedTicket._id,
                senderType: msg.senderType, 
                userId: superAdmin._id,
                content: msg.content,
            }));

            await Chat.insertMany(messageDocuments);
        }

        const payload = {
            id: savedVisitor._id,
            name: savedVisitor.name,
            phone: savedVisitor.phone,
            email: savedVisitor.email,
        }

        res.status(201).json({ 
            message: 'Visitor, ticket, and messages created successfully.',
            visitor: payload,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:visitorId', authMiddleware, async (req, res, next) => {
    try {
        const { visitorId } = req.params;
        console.log(visitorId);
        const visitor = await Visitor.findById(visitorId).lean();
        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found.' })
        }
        const payload = {
            id: visitor._id,
            name: visitor.name,
            phone: visitor.phone,
            email: visitor.email,
        }
        res.status(200).json({
            message: 'Visitor found',
            visitor: payload
        });
    } catch (error) {
        next(error);
    }
})

module.exports = router;