import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Form, Spinner, Card, ListGroup, Button, Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';

const SummaryPage = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleBrandClick = () => {
    navigate('/'); // Navigate to the home page
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('https://bill-splitter-app-r1fi.onrender.com/api/events');
        setSummary(res.data);
      } catch (error) {
        console.error('Error fetching summary:', error.response ? error.response.data : error);
        setError('Failed to load summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p>Loading summary...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  // Prepare data for CSV download
  const csvData = summary.map(event => ({
    Event: event.eventName,
    Participants: event.participants.map(participant => participant.name).join(', '),
    Balances: event.participants.map(participant => 
      `${participant.name}: ${participant.balance < 0 ? `owes ${Math.abs(participant.balance)}` : `is owed ${participant.balance}`}`
    ).join(', ')
  }));

  const csvHeaders = [
    { label: "Event", key: "Event" },
    { label: "Participants", key: "Participants" },
    { label: "Balances", key: "Balances" },
  ];

  return (
    <Container fluid className="p-0">
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
        <h2 className="text-center mb-4">Summary</h2>
        {summary.length > 0 ? (
          summary.map((event) => (
            <Card key={event._id} className="mb-4 shadow-sm">
              <Card.Header as="h5">{event.eventName}</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {event.participants.length > 0 ? (
                    event.participants.map((participant, index) => (
                      <ListGroup.Item key={`${participant.name}-${index}`}>
                        <strong>{participant.name}</strong>: {' '}
                        {participant.balance < 0 
                          ? `owes ${Math.abs(participant.balance)}` 
                          : `is owed ${participant.balance}`}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item>No participants data available.</ListGroup.Item>
                  )}
                  <Link to={`/events/${event._id}/settle`}>
                    <Button variant="primary" className="mt-3">Settle Balances</Button>
                  </Link>
                </ListGroup>
              </Card.Body>
            </Card>
          ))
        ) : (
          <Alert variant="info" className="text-center">
            No events or participants found.
          </Alert>
        )}
        {summary.length > 0 && (
          <div className="text-center mt-3">
            <CSVLink 
              data={csvData} 
              headers={csvHeaders}
              filename={`summary_report.csv`}
              className="btn btn-success"
              target="_blank"
            >
              Download Summary Report
            </CSVLink>
          </div>
        )}
      </Container>
    </Container>
    </Container>
  );
};

export default SummaryPage;
