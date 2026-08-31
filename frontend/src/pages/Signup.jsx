import React, { useEffect, useState } from 'react';
import { customFetch } from '../services/api';
import { Link } from 'react-router';
import SignupForm from '../features/auth/components/SignupForm';

function Signup() {
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
    <div className="fixed top-0 right-0 left-0 bottom-0 inset-0 z-50">
    <div lang="en" className="min-h-screen h-full w-full">
      <div
        className={`antialiased w-full h-full overflow-hidden`}
      >
        <div className="fixed inset-0 lg:flex lg:flex-row flex-1 overflow-hidden">
          <div className="relative flex flex-col lg:flex-1 w-full h-full lg:bg-background lg:min-w-[650px] z-50 lg:shadow-2xl overflow-hidden">
            <div className="flex w-full max-w-lg m-auto p-12 shadow-2xl lg:shadow-none overflow-auto">
              <SignupForm/>
            </div>
          </div>

          <div className="absolute lg:relative inset-0 flex lg:flex-[1.5] h-full lg:w-full lg:h-full bg-black overflow-hidden">
            <img
              src="thumbnail.jpg"
              alt="hero"
              fill
              style={{
                objectFit: "cover",
                objectPosition: "50% center"
              }}
            />
            <div className="absolute inset-0 bg-black/50 overflow-hidden" />

            <div className="absolute inset-0 flex flex-col max-w-[1800px] mx-auto justify-end p-8 text-white overflow-hidden">
              <Link
                to="/"
                className={`flex lobster-regular w-fit text-4xl lg:text-8xl font-medium hover:cursor-pointer`}
              >
                ShowMe
              </Link>
              <div className="text-2xl italic">photos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Signup;