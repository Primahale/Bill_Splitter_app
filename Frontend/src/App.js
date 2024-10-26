import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AddExpense from './pages/AddExpense';
import EventsList from './pages/EventList';
import EditEvent from './pages/EditEvent';
import SummaryPage from './pages/SummaryPage';
import SettleBalances from './pages/SettleBalence';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
// const eventId = someFunctionOrStateThatGetsTheEventId();


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/events/:eventId/settle" element={<SettleBalances />} />
      </Routes>
    </Router>
  );
}

export default App;
