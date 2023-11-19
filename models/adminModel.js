const { Schema, model } = require('mongoose');
const adminSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name!']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email!'],

    },
    password: {
        type: String,
        required: [true, 'Please enter your password!'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false,
    },
    role: {
        type: String,
        default: 'admin',
    },

    image: {
        type: String,
        required: [true, 'Please enter your image!']
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model("admins", adminSchema);