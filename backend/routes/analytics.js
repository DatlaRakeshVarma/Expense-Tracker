import express from 'express';
import Analytics from '../models/Analytics.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's analytics
router.get('/', authenticateToken, async (req, res) => {
    try {
        const analytics = await Analytics.findOne({ userId: req.user.userId });
        
        if (!analytics) {
            return res.json({
                categoryBreakdown: [],
                monthlyBreakdown: [],
                totalSpending: 0
            });
        }

        res.json({
            categoryBreakdown: analytics.categoryBreakdown,
            monthlyBreakdown: analytics.monthlyBreakdown,
            totalSpending: analytics.totalSpending,
            lastUpdated: analytics.lastUpdated
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
