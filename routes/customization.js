const express = require('express');
const router = express.Router();
const Customization = require('../models/customization.model');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', async (req, res, next) => {
    try {
        const customization = await Customization.findOne();
        if (!customization) {
            return res.status(404).json({ message: 'customization not found '});
        }
        res.status(200).json(customization);
    } catch (error) {
        next(error);
    }
});

router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const customization = req.body;
        if (!customization || Object.keys(customization).length === 0) {
            return res.status(400).json({ message: 'customization is empty' });
        }
        const newCustomization = new Customization(customization);
        await newCustomization.save();
        res.status(201).json({ message: 'customization successfully saved' });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const customization = req.body;
        const { id } = req.params;
        console.log("This is customization: ",customization)
        if (!customization || Object.keys(customization).length === 0) {
            return res.status(400).json({ message: 'customization is empty' });
        }
        const updatedCustomization = await Customization.findByIdAndUpdate(id, customization, { new: true });
        if (!updatedCustomization) {
            return res.status(404).json({ message : "Failed update customization." });
        }
        res.status(200).json({message: "Customization successfully updated." });
    } catch (error) {
        next(error);
    }
})

module.exports = router;