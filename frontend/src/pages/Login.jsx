import React, { useEffect, useState } from 'react';
import { customFetch } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Initialize CSRF cookie on component mount
    customFetch('/api/csrf/')
      .then(() => console.log("CSRF Initialized via fetch"))
      .catch(err => console.error("CSRF initialization failed", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login request with username and password
      await customFetch('/api/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      alert("Logged in successfully via fetch!");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleFetchData = async () => {
    try {
      // GET request to protected endpoint (cookies are sent automatically)
      const data = await customFetch('/api/some-protected-endpoint/');
      console.log("Protected Data:", data);
    } catch (error) {
      console.error("Unauthorized!", error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleFetchData}>Fetch Private Data</button>
    </div>
  );
}

export default Login;