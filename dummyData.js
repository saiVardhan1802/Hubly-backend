const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Super-admin User ID
const superAdminId = new ObjectId("681384ea7c27cc946f968e25"); 

// 1) Visitors (7)
const visitors = [
  { _id: new ObjectId(), name: "John Doe",      email: "john.doe@example.com",      phone: "9000000001", isTicketActive: true  },
  { _id: new ObjectId(), name: "Jane Smith",    email: "jane.smith@example.com",    phone: "9000000002", isTicketActive: true  },
  { _id: new ObjectId(), name: "Alice Johnson", email: "alice.johnson@example.com", phone: "9000000003", isTicketActive: true  },
  { _id: new ObjectId(), name: "Bob Lee",       email: "bob.lee@example.com",       phone: "9000000004", isTicketActive: true  },
  { _id: new ObjectId(), name: "Carol King",    email: "carol.king@example.com",    phone: "9000000005", isTicketActive: false },
  { _id: new ObjectId(), name: "Dave Brown",    email: "dave.brown@example.com",    phone: "9000000006", isTicketActive: false },
  { _id: new ObjectId(), name: "Eve Davis",     email: "eve.davis@example.com",     phone: "9000000007", isTicketActive: false },
];

// 2) Tickets (9, 5 resolved, 4 unresolved)
//    Visitors John & Jane each have 2 tickets (one resolved, one unresolved).
//    Alice & Bob have 1 unresolved each.
//    Carol, Dave, Eve have 1 resolved each.
const tickets = [
  // John Doe
  { _id: new ObjectId(), visitorId: visitors[0]._id, title: "Login issue",         status: "resolved",   elapsedTime: new Date("2025-04-10T10:00:00Z"), userId: superAdminId },
  { _id: new ObjectId(), visitorId: visitors[0]._id, title: "Payment page not loading", status: "unresolved", elapsedTime: new Date("2025-04-26T09:30:00Z"), userId: superAdminId },
  // Jane Smith
  { _id: new ObjectId(), visitorId: visitors[1]._id, title: "Password reset",      status: "resolved",   elapsedTime: new Date("2025-04-12T14:20:00Z"), userId: superAdminId },
  { _id: new ObjectId(), visitorId: visitors[1]._id, title: "Can't update profile", status: "unresolved", elapsedTime: new Date("2025-04-27T05:15:00Z"), userId: superAdminId },
  // Alice Johnson
  { _id: new ObjectId(), visitorId: visitors[2]._id, title: "Error uploading file", status: "unresolved", elapsedTime: new Date("2025-04-25T16:45:00Z"), userId: superAdminId },
  // Bob Lee
  { _id: new ObjectId(), visitorId: visitors[3]._id, title: "App crash on login",  status: "unresolved", elapsedTime: new Date("2025-04-24T11:10:00Z"), userId: superAdminId },
  // Carol King
  { _id: new ObjectId(), visitorId: visitors[4]._id, title: "Feature request",     status: "resolved",   elapsedTime: new Date("2025-04-08T08:00:00Z"), userId: superAdminId },
  // Dave Brown
  { _id: new ObjectId(), visitorId: visitors[5]._id, title: "Bug in dashboard",    status: "resolved",   elapsedTime: new Date("2025-04-15T12:30:00Z"), userId: superAdminId },
  // Eve Davis
  { _id: new ObjectId(), visitorId: visitors[6]._id, title: "UI alignment issue",  status: "resolved",   elapsedTime: new Date("2025-04-18T17:55:00Z"), userId: superAdminId },
];

// 3) Chats
const chats = [
  // Ticket[0] – resolved (John Doe)
  { _id: new ObjectId(), ticketId: tickets[0]._id, senderType: "visitor", visitorId: visitors[0]._id, content: "Thanks, login works now!" },
  { _id: new ObjectId(), ticketId: tickets[0]._id, senderType: "team",    visitorId: visitors[0]._id, userId: superAdminId, content: "Great! Let us know if any other issue arises." },

  // Ticket[1] – unresolved (John Doe)
  { _id: new ObjectId(), ticketId: tickets[1]._id, senderType: "visitor", visitorId: visitors[0]._id, content: "Payment page still not loading." },
  { _id: new ObjectId(), ticketId: tickets[1]._id, senderType: "team",    visitorId: visitors[0]._id, userId: superAdminId, content: "How can I help you?" },
  { _id: new ObjectId(), ticketId: tickets[1]._id, senderType: "team",    visitorId: visitors[0]._id, userId: superAdminId, content: "Ask me anything!" },

  // Ticket[2] – resolved (Jane Smith)
  { _id: new ObjectId(), ticketId: tickets[2]._id, senderType: "visitor", visitorId: visitors[1]._id, content: "Password reset worked, thanks!" },
  { _id: new ObjectId(), ticketId: tickets[2]._id, senderType: "team",    visitorId: visitors[1]._id, userId: superAdminId, content: "Happy to help!" },

  // Ticket[3] – unresolved (Jane Smith)
  { _id: new ObjectId(), ticketId: tickets[3]._id, senderType: "visitor", visitorId: visitors[1]._id, content: "Profile page shows error." },
  { _id: new ObjectId(), ticketId: tickets[3]._id, senderType: "team",    visitorId: visitors[1]._id, userId: superAdminId, content: "How can I help you?" },
  { _id: new ObjectId(), ticketId: tickets[3]._id, senderType: "team",    visitorId: visitors[1]._id, userId: superAdminId, content: "Ask me anything!" },

  // Ticket[4] – unresolved (Alice Johnson)
  { _id: new ObjectId(), ticketId: tickets[4]._id, senderType: "visitor", visitorId: visitors[2]._id, content: "Upload keeps failing." },
  { _id: new ObjectId(), ticketId: tickets[4]._id, senderType: "team",    visitorId: visitors[2]._id, userId: superAdminId, content: "How can I help you?" },
  { _id: new ObjectId(), ticketId: tickets[4]._id, senderType: "team",    visitorId: visitors[2]._id, userId: superAdminId, content: "Ask me anything!" },

  // Ticket[5] – unresolved (Bob Lee)
  { _id: new ObjectId(), ticketId: tickets[5]._id, senderType: "visitor", visitorId: visitors[3]._id, content: "Crash on every login." },
  { _id: new ObjectId(), ticketId: tickets[5]._id, senderType: "team",    visitorId: visitors[3]._id, userId: superAdminId, content: "How can I help you?" },
  { _id: new ObjectId(), ticketId: tickets[5]._id, senderType: "team",    visitorId: visitors[3]._id, userId: superAdminId, content: "Ask me anything!" },

  // Ticket[6] – resolved (Carol King)
  { _id: new ObjectId(), ticketId: tickets[6]._id, senderType: "visitor", visitorId: visitors[4]._id, content: "Love the new feature!" },
  { _id: new ObjectId(), ticketId: tickets[6]._id, senderType: "team",    visitorId: visitors[4]._id, userId: superAdminId, content: "Thank you for your feedback!" },

  // Ticket[7] – resolved (Dave Brown)
  { _id: new ObjectId(), ticketId: tickets[7]._id, senderType: "visitor", visitorId: visitors[5]._id, content: "Dashboard bug fixed now." },
  { _id: new ObjectId(), ticketId: tickets[7]._id, senderType: "team",    visitorId: visitors[5]._id, userId: superAdminId, content: "Glad to hear that!" },

  // Ticket[8] – resolved (Eve Davis)
  { _id: new ObjectId(), ticketId: tickets[8]._id, senderType: "visitor", visitorId: visitors[6]._id, content: "UI looks perfect." },
  { _id: new ObjectId(), ticketId: tickets[8]._id, senderType: "team",    visitorId: visitors[6]._id, userId: superAdminId, content: "Happy to help!" },
];

module.exports = { visitors, tickets, chats };