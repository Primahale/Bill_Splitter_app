// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For Cross-Origin Resource Sharing
const Event = require('./models/Event'); // Ensure you have the correct path to your Event model
// const User = require('./models/Event')
const Expense = require('./models/Expense')
const eventRoutes = require('./routes/eventRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
require('dotenv').config();

const mongoURI = process.env.MONGO_URI; 

const corsOptions = {
  origin: 'https://bill-splitter-app-five.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
};


const app = express();
app.use(express.json());
app.options('*', cors()); 
app.use(cors(corsOptions)); 
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log('CORS Headers:', res.getHeaders());
  });
  next();
});


// Routes
app.use('/api/events', eventRoutes);
// app.use('/api/expenses',expenseRoutes)

// MongoDB connection
mongoose.connect(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Route to fetch all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Create Event Route
app.post('/api/events', async (req, res) => {
  const { eventName, description, totalBill, participants, payer } = req.body;

  const newEvent = new Event({
    eventName,
    description,
    totalBill,
    participants,
    payer,
  });

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ message: 'Error saving event', error: error.message });
  }
});


  //to settle payment
  // Backend route to handle settlement
app.post('/api/events/:eventId/settle', async (req, res) => {
    const { eventId } = req.params;
    // console.log("Received eventId:", eventId); 
    try {
      const { settlements } = req.body;
      
      if (!settlements || settlements.length === 0) {
        return res.status(400).json({ message: 'No settlements provided' });
      }
  
      // Optionally, you can process settlements here, e.g., mark them as paid in the database
      console.log(`Settlements for Event ${req.params.eventId}:`, settlements);
  
      // Assuming the update is successful
      res.status(200).json({ message: 'Payments settled successfully!' });
    } catch (error) {
      console.error('Error processing settlements:', error);
      res.status(500).json({ message: 'Failed to settle payments.' });
    }
  });

  // settel expenses
  app.post('/api/events/:eventId/expenses', async (req, res) => {
    const { eventId } = req.params;
    const { description, amount } = req.body;

    try {
        const expense = new Expense({ eventId, description, amount });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: 'Error creating expense', error });
    }
});


// GET endpoint to fetch expenses for an event
// app.get('/api/events/:eventId/expenses', async (req, res) => {
//     const { eventId } = req.params;
//     try {
//         // Assuming you have a function to fetch expenses
//         const expenses = await getExpensesByEventId(eventId);
//         if (!expenses) {
//             return res.status(404).json({ message: 'No expenses found for this event.' });
//         }
//         res.json(expenses);
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         res.status(500).json({ message: 'An error occurred while fetching expenses.' });
//     }
// });

app.get('/api/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  const event = eventsData[eventId]; // Assume eventsData is defined
  if (!event) {
      return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});


  // Route to get event summary with balances and transactions
app.get('/api/events/:eventId/summary', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        const balances = calculateBalances(event.expenses);
        const transactions = minimizeTransactions(balances);

        res.json({ eventName: event.eventName, balances, transactions });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ message: 'Failed to fetch summary.' });
    }
});

// Function to calculate participant balances
const calculateBalances = (expenses) => {
    const balances = {};

    expenses.forEach(({ paidBy, sharedBy, amount }) => {
        if (!balances[paidBy]) balances[paidBy] = 0;
        const share = amount / sharedBy.length;

        sharedBy.forEach(person => {
            if (!balances[person]) balances[person] = 0;
            if (person !== paidBy) {
                balances[person] -= share;
                balances[paidBy] += share;
            }
        });
    });

    return balances;
};

// Function to minimize transactions
const minimizeTransactions = (balances) => {
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([name, balance]) => {
        if (balance > 0) creditors.push({ name, amount: balance });
        if (balance < 0) debtors.push({ name, amount: Math.abs(balance) });
    });

    const transactions = [];

    while (creditors.length && debtors.length) {
        const creditor = creditors.pop();
        const debtor = debtors.pop();
        const amount = Math.min(creditor.amount, debtor.amount);

        transactions.push({ from: debtor.name, to: creditor.name, amount });

        creditor.amount -= amount;
        debtor.amount -= amount;

        if (creditor.amount > 0) creditors.push(creditor);
        if (debtor.amount > 0) debtors.push(debtor);
    }

    return transactions;
};


  // get the summary

  app.get('/api/events/summary', async (req, res) => {
    try {
      const events = await Event.find(); // Ensure events have the _id field
      res.json(events);

      const summary = events.map(event => ({
        eventName: event.eventName,
        participants: event.participants.map(participant => ({
          name: participant.name,
          balance: participant.balance, // Adjust this based on your schema
        })),
      }));
      res.status(200).json(summary);

    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events.' });
    }
  });


// Update event by ID
app.put('/api/events/:id', async (req, res) => {
    const { eventName, description, participants, totalBill, payer } = req.body;
  
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { eventName, description, participants, totalBill, payer },
        { new: true ,runValidators: true} // Return the updated document
      );
      res.json(updatedEvent); // Send back the updated event
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// In your backend index.js or routes file
app.delete('/api/events/:id', async (req, res) => {
  try {
      const eventId = req.params.id;
      const deletedEvent = await Event.findByIdAndDelete(eventId);
      if (!deletedEvent) {
          return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
