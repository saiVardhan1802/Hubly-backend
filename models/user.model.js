const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true
    },
    phone : {
        type: String
    },
    role : {
        type: String,
        enum: ['super-admin', 'admin', 'member'],
        default: 'member',
    },
    team : {
        teamId: {
            type: String,
        },
        name: {
            type: String,
        },
    }
})

module.exports = mongoose.model("User", userSchema);