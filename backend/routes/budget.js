import express from 'express';
import Budget from '../models/Budget.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's budget
router.get('/', authenticateToken, async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.user.userId });
        
        if (!budget) {
            return res.json({ monthlyBudget: 0 });
        }

        res.json(budget);
    } catch (error) {
        console.error('Get budget error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Set/update user's budget
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { monthlyBudget } = req.body;

        if (!monthlyBudget || monthlyBudget < 0) {
            return res.status(400).json({ error: 'Valid monthly budget is required' });
        }

        // Find or create budget
        let budget = await Budget.findOne({ userId: req.user.userId });

        if (!budget) {
            budget = new Budget({
                userId: req.user.userId,
                monthlyBudget: parseFloat(monthlyBudget)
            });
        } else {
            budget.monthlyBudget = parseFloat(monthlyBudget);
        }

        await budget.save();

        res.json({ 
            message: 'Budget updated successfully', 
            budget: {
                monthlyBudget: budget.monthlyBudget,
                updatedAt: budget.updatedAt
            } 
        });
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
