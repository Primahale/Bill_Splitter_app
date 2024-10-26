// models/Event.js
const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    balance: { type: Number, default: 0 },
    paidBy: { type: String, require: true,enum: ['Yes', 'No'], default: 'No' },
    // paidBy: {type: String, default: 'Self'}
});

// Define the User schema
// const userSchema = new mongoose.Schema({
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         'Please fill a valid email address'
//       ]
//     },
//     balance: {
//       type: Number,
//       default: 0 // Balance starts at 0 by default
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   });

const expenseSchema = new mongoose.Schema({
  amount: Number,
  description: String,
  payer: String,
  participantsInvolved: [String], 
});

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
    participants: [participantSchema],
    description: { type: String, required: true },
    payer: {type: String, require: true}, // Stores the name of the person who paid the total bill},
    expenses: [expenseSchema],
    totalBill: { type: Number, require: true} // Auto-calculated from expenses
},{ timestamps: true });

// Create the Event model
const Event = mongoose.model('Event', eventSchema);
// Create the User model
// const User = mongoose.model('User', userSchema);

// const Expense = mongoose.model('Expense',expenseSchema)

module.exports = Event;
