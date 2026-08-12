import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Modal from "./Modal";
// import { customFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { createPortal } from "react-dom";

const LoginModal = ({ user, setUser, isOpen, onClose, showToast }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  let navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      showToast("Sign in successful", "success");
      onClose();
    } catch (error) {
      alert("Login failed: " + error.message);
      showToast("Sign in failed. Try again later.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Sign out successful", "success");
      onClose();
    } catch (error) {
      showToast("Sign out failed. Try again later.", "error");
      console.error("Logout failed:", error.message);
      alert("Error logging out.");
    }
  };

  const modalContent = (
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
                className="btn-secondary px-4"
              >
                Sign out
              </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-8">
          <h1 className="text-2xl font-semibold mb-4 text-center lobster-regular">Welcome back</h1>
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
          <p className="pt-4 text-sm text-center">Don't have an account? <Link to="/sign-up" onClick={onClose} className="underline">Sign up</Link></p>
        </div>
      )}
    </Modal>
  )

  return createPortal(modalContent, document.body);
};

export default LoginModal;
