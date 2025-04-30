const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const Customization = require('../models/customization.model');
const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');

router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const customization = await Customization.findOne();
        const timer = customization.timer;
        const timerInMilliseconds = convertTimerToMilliseconds(timer);
        const tickets = await Ticket.find();
        const missedChats = getMissedChatsByWeek(tickets, timerInMilliseconds);

        const totalTickets = tickets.length;
        console.log(totalTickets);
        const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved').length;
        const percentageOfResolvedTickets = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

        const { totalElapsedTime, count } = tickets.reduce((acc, ticket) => {
            if (ticket.elapsedTime) {
                acc.totalElapsedTime += ticket.elapsedTime;
                acc.count++;
            }
            return acc;
        }, { totalElapsedTime: 0, count: 0 });
        
        const averageReplyTime = count > 0 ? totalElapsedTime / count : 0;
        const averageReplyTimeInSeconds = Math.round(averageReplyTime / 1000);

        res.status(200).json({
            message: "Analytics successfully computed.",
            Analytics: {
                missedChats,
                averageReplyTime: averageReplyTimeInSeconds,
                percentageOfResolvedTickets,
                totalChats: totalTickets
            }
        })
    } catch (error) {
        next(error);
    }
});

function convertTimerToMilliseconds(timer) {
    if (!timer) return 0;
    const { hours = 0, minutes = 0, seconds = 0 } = timer;
    return ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
}

function getMissedChatsByWeek(tickets, timerInMilliseconds) {
    const missedTickets = [];

    // Collect only missed tickets
    tickets.forEach(ticket => {
        const elapsed = ticket.elapsedTime ?? (new Date() - new Date(ticket.createdAt));
        if (elapsed > timerInMilliseconds) {
            missedTickets.push(ticket);
        }
    });

    // Sort missed tickets by createdAt
    missedTickets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const missedChatsByWeek = [];

    if (missedTickets.length === 0) return missedChatsByWeek;

    const startDate = new Date(missedTickets[0].createdAt);
    const weekBuckets = {};

    missedTickets.forEach(ticket => {
        const createdAt = new Date(ticket.createdAt);
        const daysPassed = Math.floor((createdAt - startDate) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysPassed / 7) + 1;
        const weekKey = `Week ${weekNumber}`;

        if (!weekBuckets[weekKey]) {
            weekBuckets[weekKey] = 0;
        }

        weekBuckets[weekKey]++;
    });

    for (let [week, chats] of Object.entries(weekBuckets)) {
        missedChatsByWeek.push({ week, chats });
    }

    return missedChatsByWeek;
}

module.exports = router;