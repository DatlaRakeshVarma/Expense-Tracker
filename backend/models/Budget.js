import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    monthlyBudget: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt timestamp on save
budgetSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Budget', budgetSchema);
