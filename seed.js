const mongoose = require('mongoose');
const { visitors, tickets, chats } = require('./dummyData'); 
// mee dummy data file path ichuko

// Models
const Visitor = require('./models/visitor.model');
const Ticket  = require('./models/ticket.model');
const Chat    = require('./models/chats.model');

async function seedDB() {
  try {
    // 1) MongoDB connect
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🟢 Connected to MongoDB');

    // 3) Insert Visitors
    const insertedVisitors = await Visitor.insertMany(visitors);
    console.log(`✅ Inserted ${insertedVisitors.length} visitors`);

    // 4) Insert Tickets
    //    (visitorId and userId already set in dummyData)
    const insertedTickets = await Ticket.insertMany(tickets);
    console.log(`✅ Inserted ${insertedTickets.length} tickets`);

    // 5) Update isTicketActive for each visitor based on unresolved tickets
    const activeVisitorIds = tickets
      .filter(t => t.status === 'unresolved')
      .map(t => t.visitorId);

    await Visitor.updateMany(
      { _id: { $in: activeVisitorIds } },
      { $set: { isTicketActive: true } }
    );
    await Visitor.updateMany(
      { _id: { $nin: activeVisitorIds } },
      { $set: { isTicketActive: false } }
    );
    console.log('🔄 Updated isTicketActive flags');

    // 6) Insert Chats
    const insertedChats = await Chat.insertMany(chats);
    console.log(`✅ Inserted ${insertedChats.length} chats`);

    console.log('🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Error while seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🛑 Disconnected from MongoDB');
  }
}

seedDB();