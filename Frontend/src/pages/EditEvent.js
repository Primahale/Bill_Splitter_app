import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Navbar, Nav } from 'react-bootstrap';

const EditEvent = () => {
  const { id } = useParams(); // Get event ID from URL parameters
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [totalBill, setTotalBill] = useState(0);
  const [participants, setParticipants] = useState([{ name: '', description: '' }]);
  const [payer, setPayer] = useState('');
  const [owedBy, setOwedBy] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Check localStorage for theme preference on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  const handleBrandClick = () => {
    navigate('/'); // Navigate to the home page
  };

  // Fetch event data when the component mounts
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`https://bill-splitter-app-r1fi.onrender.com/api/events/${id}`);
        setEventName(data.eventName);
        setDescription(data.description);
        setTotalBill(data.totalBill);
        setParticipants(data.participants);
        setPayer(data.payer);

        const owedParticipants = data.participants
          .filter((p) => p.name !== data.payer && p.balance < 0)
          .map((p) => p.name);
        setOwedBy(owedParticipants);
      } catch (error) {
        console.error('Error fetching event:', error.message);
        alert('Failed to load event data.');
      }
    };
    fetchEvent();
  }, [id]);

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: '', description: '' }]);
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  const handleOweBySelection = (participantName) => {
    if (owedBy.includes(participantName)) {
      setOwedBy(owedBy.filter((name) => name !== participantName));
    } else {
      setOwedBy([...owedBy, participantName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const individualShare = totalBill / participants.length;
    const updatedParticipants = participants.map((p) => ({
      ...p,
      balance: p.name === payer ? totalBill - individualShare : -individualShare,
      paidBy: p.name === payer ? 'Yes' : 'No',
    }));

    const eventData = {
      eventName,
      description,
      totalBill: parseFloat(totalBill),
      participants: updatedParticipants,
      payer,
    };

    console.log('Updating event data:', eventData);

    try {
      await axios.put(`https://bill-splitter-app-r1fi.onrender.com/api/events/${id}`, eventData);
      alert('Event updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating event:', error.response ? error.response.data : error.message);
      alert(`Error: ${error.response?.data?.message || 'An error occurred while updating the event.'}`);
    }
  };

  return (
    <Container fluid className="p-0">
    <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} expand="lg" className="sticky-top">
      <Navbar.Brand
        onClick={handleBrandClick}
        style={{ cursor: 'pointer', color: darkMode ? '#fff' : '#000' }}
      >
        Bill Splitter
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/events">Events</Nav.Link>
          <Nav.Link as={Link} to="/add-expense">Add Expense</Nav.Link>
          <Nav.Link as={Link} to="/summary">Summary</Nav.Link>
        </Nav>
        <Form className="ml-2">
            <Form.Check 
              type="switch"
              id="custom-switch"
              label={darkMode ? 'Light Mode' : 'Dark Mode'}
              checked={darkMode}
              onChange={toggleDarkMode}
              style={{ color: darkMode ? '#fff' : '#000' }} // Change label color based on theme
            />
          </Form>
      </Navbar.Collapse>
    </Navbar>
      <Container className="mt-5">
        <h2>Edit Event</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="eventName">
            <Form.Label>Event Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </Form.Group>

          <h4 className="mt-4">Participants</h4>
          {participants.map((p, index) => (
            <Row key={index} className="mb-2">
              <Col>
                <Form.Control
                  type="text"
                  placeholder={`Participant ${index + 1} Name`}
                  value={p.name}
                  onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                  required
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder={`Participant ${index + 1} Description`}
                  value={p.description}
                  onChange={(e) => handleParticipantChange(index, 'description', e.target.value)}
                  required
                />
              </Col>
            </Row>
          ))}

          <Button variant="secondary" onClick={handleAddParticipant} className="mt-2">
            Add Participant
          </Button>

          <Form.Group controlId="payer" className="mt-4">
            <Form.Label>Paid By</Form.Label>
            <Form.Select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              required
            >
              <option value="">Select Payer</option>
              {participants.map((p, index) => (
                <option key={index} value={p.name}>{p.name || `Participant ${index + 1}`}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="owedBy" className="mt-4">
            <Form.Label>Owed By</Form.Label>
            <div>
              {participants
                .filter((p) => p.name !== payer)
                .map((p, index) => (
                  <Form.Check
                    key={index}
                    type="checkbox"
                    label={p.name}
                    checked={owedBy.includes(p.name)}
                    onChange={() => handleOweBySelection(p.name)}
                  />
                ))}
            </div>
          </Form.Group>

          <Form.Group controlId="totalBill" className="mt-3">
            <Form.Label>Total Bill</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter total bill amount"
              value={totalBill}
              onChange={(e) => setTotalBill(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="description" className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">
            Update Event
          </Button>
        </Form>
      </Container>
    </Container>
  );
};

export default EditEvent;
