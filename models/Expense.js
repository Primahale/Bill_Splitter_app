// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    payer: { type: String, required: true },
    owedBy: [{ type: String }], // Array of participant names
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
