const ExpenseModel = require('../models/Expense');

const createExpense = async (data) => {
    const expense = new ExpenseModel(data);
    return await expense.save();
};

const getExpensesByEventId = async (eventId) => {
    return await ExpenseModel.find({ eventId }).exec();
};

module.exports = {
    createExpense,
    getExpensesByEventId,
};
