const mongoose = require('mongoose');
const introductionFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }
});

const customizationSchema = new mongoose.Schema({
    headerColor: {
        type: String,
        required: true,
        default: '33475B'
    },
    backgroundColor: {
        type: String,
        required: true,
        default: 'EEEEEE'
    },
    initialMessages: {
        type: [String],
        required: true,
    },
    introductionForm: introductionFormSchema,
    welcomeMessage: {
        type: String,
        required: true,
        default: "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way."
    },
    timer: {
        hours: {
          type: Number,
          min: 0,
          max: 23
        },
        minutes: {
          type: Number,
          min: 0,
          max: 59
        },
        seconds: {
          type: Number,
          min: 0,
          max: 59
        }
      }
})

module.exports = mongoose.model("Customization", customizationSchema);