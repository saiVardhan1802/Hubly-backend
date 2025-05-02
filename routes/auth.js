const jwt = require('jsonwebtoken');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userCount = await User?.countDocuments();

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ message: "This email is already in use." });
        }

        let role, teamId, teamName;

        if (userCount === 0) {
            role = 'super-admin';
            teamId = uuidv4();
            teamName = 'Team 1';
        } else {
            const firstUser = await User.findOne().sort({ createdAt: 1 });
            role = 'member';
            teamId = firstUser.team.teamId;
            teamName = firstUser.team.name;
        }

        const user = new User({
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(password, 8),
            role,
            team: {
                teamId,
                name: teamName,
            }
        })
        await user.save();
        const payload = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            team: {
                teamId: user.team.teamId,
                name: user.team.name,
            }
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        res.status(200).json({
            token,
            message: 'User registered successfully',
            user: payload,
        })
    } catch (error) {
        next(error);
    }
})

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log(password);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            team: {
                teamId: user.team.teamId,
                name: user.team.name,
            }
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY);
        res.status(200).json({ message: 'Login successful', token, user: payload });
    } catch (error) {
        next(error);
    }
})

module.exports = router;