import React, {useEffect, useState} from 'react';
import { Container, Navbar, Nav, Form} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'

const Home = () => {
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

  // useEffect(() => {
  //   document.body.classList.toggle('dark-mode', darkMode);
  //   document.querySelector('.App').classList.toggle('dark', darkMode); // Toggle dark class on App
  // }, [darkMode]);



  return (
    <Container fluid className="p-0 ">
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
    <Container className="text-center mt-5">
      <h1>Welcome to the Bill Splitter App!</h1>
      <p className="lead">Easily manage shared expenses for events.</p>
      <img 
          src="https://www.meupositivo.com.br/doseujeito/wp-content/uploads/2019/07/aplicativo-para-pagar-contas.gif" // Replace with the actual URL of your GIF
          alt="related to bills"
          style={{ width: '60%', height: '400px', marginTop: '20px' }} // Make it responsive
        />
    </Container>
  </Container>
);
};

export default Home;
