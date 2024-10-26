// src/pages/SettleBalance.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const SettleBalance = () => {
    const { eventId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [eventData, setEventData] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [amount, setAmount] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEventData = async () => {
            console.log('Event ID:', eventId);

            if (!eventId) {
                setError('Event ID is not available.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/events/${eventId}`);
                setEventData(response.data);
                // Set participants from the fetched event data
                if (response.data.participants) {
                    setParticipants(response.data.participants);
                }
            } catch (error) {
                setError(error.response ? error.response.data : error.message);
            }
        };

        fetchEventData(); // Fetch event data regardless of eventId check
    }, [eventId]);

    if (!eventData) {
        return <div>Loading event data...</div>;
    }

    const handleSettlement = async (e) => {
        e.preventDefault();
        if (!from || !to || !amount) {
            setError('All fields are required');
            return;
        }

        const settlementData = {
            settlements: [{ from, to, amount: Number(amount) }],
        };

        try {
            const response = await axios.post(`/api/events/${eventId}/settle`, settlementData);
            console.log(response.data);
            // Optionally, reset fields or show success message
            setSettlements([...settlements, { from, to, amount: Number(amount) }]);
            setAmount('');
            setFrom('');
            setTo('');
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error settling balance. Please try again.');
        }
    };

    const handleSplitEvenly = () => {
        if (participants.length === 0 || !eventData.expenses || eventData.expenses.length === 0) {
            setError('No participants or expenses found.');
            return;
        }

        const totalAmount = eventData.expenses.reduce((acc, exp) => acc + exp.amount, 0);
        const amountPerPerson = (totalAmount / participants.length).toFixed(2); // Amount per participant

        participants.forEach(participant => {
            const settlementData = {
                settlements: [{ from: participant.name, to: "settled account", amount: Number(amountPerPerson) }],
            };

            // Save settlement logic (this could also call an API to save each settlement)
            setSettlements(prev => [...prev, { from: participant.name, to: "settled account", amount: amountPerPerson }]);
        });

        // Optionally show a success message
        setError('');
    };

    return (
        <div>
            <h2>Settle Balances for Event: {eventData.eventName}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSettlement}>
                <div>
                    <label>From:</label>
                    <select value={from} onChange={(e) => setFrom(e.target.value)}>
                        <option value="">Select Payer</option>
                        {participants.map((participant) => (
                            <option key={participant.name} value={participant.name}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>To:</label>
                    <select value={to} onChange={(e) => setTo(e.target.value)}>
                        <option value="">Select Payee</option>
                        {participants.map((participant) => (
                            <option key={participant.name} value={participant.name}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Settle</button>
                <button type="button" onClick={handleSplitEvenly}>Split Evenly</button>
            </form>

            <h3>Settlements</h3>
            <ul>
                {settlements.map((settlement, index) => (
                    <li key={index}>
                        {settlement.from} pays {settlement.amount} to {settlement.to}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SettleBalance;
