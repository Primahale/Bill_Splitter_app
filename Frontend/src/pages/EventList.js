// src/pages/EventsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Button, ListGroup,Modal, Navbar,Nav, Form } from 'react-bootstrap';
import { Link , useNavigate} from 'react-router-dom';


const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  // const [description, setDescription] = useState('');
  // Fetch events from the backend
  const navigate = useNavigate();
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



  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('https://bill-splitter-app-r1fi.onrender.com/api/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  // Handle deleting an event
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`https://bill-splitter-app-r1fi.onrender.com/api/events/${id}`);
        setEvents(events.filter(event => event._id !== id));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  // Handle viewing event details
  const handleShowDetails = (event) => {
    setSelectedEvent(event);
    setShowDetails(true);
    // setDescription(true);
  };

  // Handle closing the details modal
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedEvent(null);
    // setDescription(false)
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
    <Container className="mt-4">
      <h2>Events List</h2>
      {events.map((event) => (
        <Card className="mb-3" key={event._id}>
          <Card.Header>{event.eventName}</Card.Header>
          <Card.Body>
            <ListGroup>
              {event.participants.map((p) => (
                <ListGroup.Item key={p.name}>
                  {p.name} - Balance: {p.balance} {p.paidBy === 'Yes' && '(Payer)'}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Button variant="primary"  className="mt-3" onClick={() => handleShowDetails(event)}>
                View Details
              </Button>

            <Link to={`/edit-event/${event._id}`}>
              <Button variant="warning" className="mt-3">Edit</Button>
            </Link>
            <Button variant="danger" className="mt-3" onClick={() => handleDelete(event._id)}>Delete</Button>
            {/* Link to settle balances */}
            {/* <Link to={`/events/${event.id}/settle`}>Settle Balances</Link> */}
          </Card.Body>
        </Card>
      ))}
   

      {/* Summary button */}
      <div className="text-center mt-4">
        <Link to="/summary">
          <Button className="btn btn-info">View Summary</Button>
        </Link>
      </div>

      {/* Modal for event details */}
      <Modal show={showDetails} onHide={handleCloseDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <h4>{selectedEvent.eventName}</h4>
              <p><strong>Total Bill:</strong>{selectedEvent.totalBill}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <h5>Participants:</h5>
              <ListGroup>
                {selectedEvent.participants.map((p) => (
                  <ListGroup.Item key={p.name}>
                    {p.name} {p.paidBy === 'Yes' && '(Payer)'} - Balance: {p.balance}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </Container>
  );
};

export default EventsList;
