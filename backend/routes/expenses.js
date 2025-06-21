import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Expense from '../models/Expense.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

// Middleware to update analytics after expense operations
const updateAnalytics = async (userId) => {
    try {
        await Analytics.updateAnalytics(userId);
    } catch (error) {
        console.error('Failed to update analytics:', error);
    }
};

// Get all expenses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { category, startDate, endDate, minAmount, maxAmount } = req.query;
        
        const query = { userId: req.user.userId };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (startDate) {
            query.date = { ...query.date, $gte: new Date(startDate) };
        }

        if (endDate) {
            query.date = query.date || {};
            query.date.$lte = new Date(endDate);
        }

        if (minAmount) {
            query.amount = { ...query.amount, $gte: parseFloat(minAmount) };
        }

        if (maxAmount) {
            query.amount = query.amount || {};
            query.amount.$lte = parseFloat(maxAmount);
        }

        const expenses = await Expense.find(query)
            .sort({ date: -1 });

        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create expense
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        if (!title || !amount || !category || !date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const expense = new Expense({
            userId: req.user.userId,
            title,
            amount,
            category,
            date: new Date(date)
        });

        await expense.save();
        await updateAnalytics(req.user.userId);
        res.status(201).json(expense);
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update expense
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, category, date } = req.body;

        const expense = await Expense.findOne({ _id: id, userId: req.user.userId });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        expense.title = title;
        expense.amount = amount;
        expense.category = category;
        expense.date = new Date(date);

        await expense.save();
        await updateAnalytics(req.user.userId);
        res.json(expense);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await Expense.deleteOne({ _id: id, userId: req.user.userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await updateAnalytics(req.user.userId);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
