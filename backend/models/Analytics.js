import mongoose from 'mongoose';
import Expense from './Expense.js';

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    categoryBreakdown: [{
        category: String,
        amount: Number
    }],
    monthlyBreakdown: [{
        month: String,
        amount: Number
    }],
    totalSpending: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update analytics when an expense is created or updated
analyticsSchema.statics.updateAnalytics = async function(userId) {
    try {
        // Get all user's expenses
        const expenses = await Expense.find({ userId });
        
        // Calculate category breakdown
        const categoryData = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        // Calculate monthly breakdown
        const monthlyData = expenses.reduce((acc, expense) => {
            const month = expense.date.toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + expense.amount;
            return acc;
        }, {});

        // Calculate total spending
        const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Update or create analytics
        let analytics = await this.findOne({ userId });
        if (!analytics) {
            analytics = new this({ userId });
        }

        analytics.categoryBreakdown = Object.entries(categoryData).map(([category, amount]) => ({
            category,
            amount
        }));

        analytics.monthlyBreakdown = Object.entries(monthlyData).map(([month, amount]) => ({
            month,
            amount
        }));

        analytics.totalSpending = totalSpending;
        analytics.lastUpdated = new Date();

        await analytics.save();
        return analytics;
    } catch (error) {
        console.error('Analytics update error:', error);
        throw error;
    }
};

export default mongoose.model('Analytics', analyticsSchema);
