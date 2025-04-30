const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user.model');
const router = express.Router();
const bcrypt = require('bcrypt');

router.patch("/:userId", authMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, password } = req.body;

        // Build update object only with non-empty fields
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (email) updateFields.email = email;
        if (password) updateFields.password = await bcrypt.hash(password, 8);

        // Check for email uniqueness if email is being updated
        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists && emailExists._id.toString() !== userId) {
                return res.status(409).json({ message: "This email is already in use." });
            }
        }

        console.log("Update Data:", JSON.stringify(updateFields, null, 2));

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

//get all users
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const users = await User.find();
        console.log(users);
        res.status(200).json(users);

    } catch (error) {

        next(error);
    }
});

//get team by teamId
router.get('/teams/:teamId', authMiddleware, async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const teamMembers = await User.find({ "team.teamId": teamId });
        console.log(teamMembers);
        if (teamMembers.length === 0) {
            res.status(404).json({ message: `team with id ${teamId} not found` });
            return;
        }
        res.status(200).json(teamMembers);
    } catch (error) {
        next(error);
    }
});

//add a team member
router.post('/teams/:teamId', authMiddleware, async (req, res, next) => {
    try {
        let { teamId } = req.params;
        const { phone, email, designation, userId } = req.body;
        let { teamName } = req.body;

        if (designation === 'admin') {
            teamId = uuidv4();
            const uniqueTeams = await User.aggregate([
                {
                    $match: {
                        "team.teamId": { $ne: null } // Only consider users with a teamId
                    }
                },
                {
                    $group: {
                        _id: "$team.teamId" // Group by teamId
                    }
                },
                {
                    $count: "totalTeams" // Count the number of unique groups
                }
            ]);

            const totalTeams = uniqueTeams[0]?.totalTeams || 0;
            teamName = `Team ${totalTeams + 1}`;
        }
        const admin = await User.findById(userId);
        if (admin.role === 'member') return res.status(401).json({ message: "Unauthorized access." });
        const newUser = new User({
            firstName: 'Joe',
            lastName: 'Doe',
            phone,
            email,
            role: designation,
            team: {
                teamId,
                name: teamName
            },
            password: admin.password
        });
        await newUser.save();
        res.status(201).json({ message: "User added successfully" });
    } catch (error) {
        next(error)
    }
});

router.patch('/teams/:teamId', authMiddleware, async (req, res, next) => {
    try {  //teamId, phone, email, designation, adminId, userId, teamName
        let { teamId } = req.params;
        const { phone, email, designation, adminId, userId } = req.body;
        let { teamName } = req.body;

        if (designation === 'admin') {
            teamId = uuidv4();
            const uniqueTeams = await User.aggregate([
                {
                    $match: {
                        "team.teamId": { $ne: null } // Only consider users with a teamId
                    }
                },
                {
                    $group: {
                        _id: "$team.teamId" // Group by teamId
                    }
                },
                {
                    $count: "totalTeams" // Count the number of unique groups
                }
            ]);

            const totalTeams = uniqueTeams[0]?.totalTeams || 0;
            teamName = `Team ${totalTeams + 1}`;
        }
        const admin = await User.findById(adminId);
        if (admin.role === 'member') return res.status(401).json({ message: "Unauthorized access." });
        const updatedUser = await User.findByIdAndUpdate(userId, {
            phone,
            email,
            role: designation,
            team: {
                teamId,
                name: teamName
            }
        });
        if (!updatedUser) return res.status(404).json({ message: "Failed to delete user." })
        res.status(201).json({ message: "User updated successfully" });
    } catch (error) {
        next(error)
    }
});

router.delete('/:userId', authMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log("Trying to delete user with ID:", userId);
        const user = await User.findByIdAndDelete(userId)
        if (!user) return res.status(404).json({ message: "Failed to delete user." });
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        next(error)
    }
})

module.exports = router;