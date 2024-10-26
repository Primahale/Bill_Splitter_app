// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Expense = require('../models/Expense')
// const { createEvent, getAllEvents, getEventById } = require('../controllers/eventController');

// const sendEmail = require('../../frontend/src/utils/calculateExpenses');


// Function to send reminders
// const sendReminders = async () => {
//     const events = await Event.find();
//     events.forEach(async (event) => {
//       for (const participant of event.participants) {
//         if (participant.balance > 0 && !participant.remindersSent) {
//           await sendEmail(participant.name, 'Bill Reminder', `You have a pending bill of ${participant.balance} Rs.`);
//           participant.remindersSent = true; // Mark as reminder sent
//         }
//       }
//       await event.save(); // Save changes to participant reminders
//     });
//   };


// Create a new event

// Create Event Route
// router.post('/', async (req, res) => {
//   const { name, participants, description,payer, expenses,totalBill} = req.body;

//   try {
//       const newEvent = new Event({
//           name,
//           participants,
//           description,
//           payer,
//           totalBill,
//           expenses
//       });

//       await newEvent.save();
//       res.status(201).json(newEvent);
//   } catch (error) {
//       console.error('Error creating event:', error);
//       // console.error('Request body:', req.body); // Log the request body
//       res.status(500).json({ message: 'Server error while creating event.', error: error.message });
//   }
// });

router.post('/api/events', async (req, res) => {
  console.log(req.body)
  try {
    const { eventName, description, totalBill, participants, payer } = req.body;

    // Ensure the description is being used in the event creation
    const newEvent = new Event({
      eventName,
      description,
      totalBill,
      participants,
      payer,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});

//get all event
router.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

// Add an expense to an event
router.post('/:id/expenses', async (req, res) => {
  const { amount, description, payer, participantsInvolved } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const expense = {
      amount,
      description,
      payer,
      participantsInvolved,
    };

    // Add expense to the event and update the total bill
    event.expenses.push(expense);
    event.totalBill += amount;

    await event.save();
    res.status(201).json({ message: 'Expense added successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding expense' });
  }
});


// Route to fetch event data by eventId
router.get('/:eventId', async (req, res) => {
  try {
      const event = await Event.findById(req.params.eventId);
      if (!event) {
          return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching event', error });
  }
});

//delete expenses
router.delete('/:eventId/expenses/:expenseId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.expenses = event.expenses.filter((e) => e._id.toString() !== req.params.expenseId);
    await event.save();

    res.json({ message: 'Expense deleted successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

// Settle an expense
router.post('/:eventId/settle', async (req, res) => {
  const { settlements } = req.body;
  console.log(settlements)

  try {
      const event = await Event.findById(req.params.eventId);
      if (!event) {
          return res.status(404).json({ message: 'Event not found.' });
      }

      const participantMap = {};
      event.participants.forEach(participant => {
          participantMap[participant.name] = participant;
      });

      // Process each settlement
      settlements.forEach(({ from, to, amount }) => {
          const payer = participantMap[from];
          const payee = participantMap[to];

          if (payer && payee) {
              payer.balance -= amount;
              payee.balance += amount;
          } else {
              throw new Error(`Participant(s) not found for settlement: ${from}, ${to}`);
          }
      });

      await event.save();
      res.status(200).json({ message: 'Settlements processed successfully.', event });
  } catch (error) {
      console.error('Error settling payments:', error);
      res.status(500).json({ message: 'Error settling payments.', error: error.message });
  }
});


// Get summary of events

router.get('/summary', async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events

    // Create a summary of each event with its participants and balances
    const summary = events.map(event => ({
      eventName: event.eventName, // Name of the event
      participants: event.participants.map(participant => ({
        name: participant.name,  // Participant's name
        balance: participant.balance // Participant's balance
      })),
    }));

    // Send the summary back to the client
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
      const event = await Event.findById(req.params.id); // Ensure your model is correct
      if (!event) {
          return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

// GET event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
    // console.log(event)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event' });
  }
});
  
// router.post('/:eventId/settle', async (req, res) => {
//   const { settlements } = req.body; // Assume settlements is an array of { from, to, amount }
  
//   if (!settlements || !Array.isArray(settlements)) {
//       return res.status(400).json({ message: 'Invalid settlements data.' });
//   }

//   try {
//       const event = await Event.findById(req.params.eventId);
//       if (!event) {
//           return res.status(404).json({ message: 'Event not found.' });
//       }

//       // Create a map to easily find participants by name
//       const participantMap = {};
//       event.participants.forEach(participant => {
//           participantMap[participant.name] = participant;
//       });

//       // Process each settlement
//       settlements.forEach(({ from, to, amount }) => {
//           // Ensure both participants exist
//           const payer = participantMap[from];
//           const payee = participantMap[to];

//           if (payer && payee) {
//               // Update balances
//               payer.balance -= amount; // The person paying loses money
//               payee.balance += amount;  // The person receiving gains money
//           } else {
//               throw new Error(`Participant(s) not found for settlement: ${from}, ${to}`);
//           }
//       });

//       // Save updated participants back to the event
//       await event.save();

//       res.status(200).json({ message: 'Settlements processed successfully.', event });
//   } catch (error) {
//       console.error('Error settling payments:', error);
//       res.status(500).json({ message: 'Error settling payments.', error: error.message });
//   }
// });

// Update event by ID
router.put('/:id', async (req, res) => {
  try {
    // console.log('Request body:', req.body); // Log request data

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
})


// Update event by ID
// router.put('/api/events/:id', async (req, res) => {
//   try {
//       const { id } = req.params;
//       const updatedData = req.body;

//       console.log('Updating event with data:', updatedData); // Log request data

//       const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, {
//           new: true, // Return the updated document
//           runValidators: true, // Ensure it adheres to schema validations
//       });

//       if (!updatedEvent) {
//           return res.status(404).json({ message: 'Event not found.' });
//       }

//       res.json({ message: 'Event updated successfully.', event: updatedEvent });
//   } catch (error) {
//       console.error('Error updating event:', error); // Log the error
//       res.status(500).json({ message: 'Server error while updating event.', error: error.message });
//   }
// });
  

module.exports = router;
