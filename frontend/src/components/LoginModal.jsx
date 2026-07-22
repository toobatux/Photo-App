import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Modal from "./Modal";
// import { customFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

const LoginModal = ({ user, setUser, isOpen, onClose }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  let navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      onClose();
      navigate(0);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate(0);
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Error logging out.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      {user ? (
        <div className="p-6">
          <div className="nav-links">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold">Sign out</h1>
              <p className="text-foreground/70">Are you sure you want to sign out?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="btn-primary">Cancel</button>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sign out
              </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-8">
          <h1 className="text-lg font-semibold mb-4 text-center">Welcome back</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Username"
              required
              className="input-box"
              onChange={(e) => setFormData((prev) => ({...prev, username: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="input-box"
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button
              type="submit"
              className="btn-primary mt-4"
            >
              Continue
            </button>
          </form>
          <p className="pt-4 text-sm text-center">Don't have an account? <span>Sign up</span></p>
        </div>
      )}
    </Modal>
  );
};

export default LoginModal;
