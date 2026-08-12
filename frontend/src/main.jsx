import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router';
import './index.css'
import App from './App.jsx'
import Feed from './pages/Feed.jsx';
import {Profile} from './pages/Profile.jsx';
import RootLayout from './RootLayout.jsx';
import Signup from './pages/Signup.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Gallery } from './pages/Gallery.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout/>}>
          <Route path="/" element={<App />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/:username" element={<Profile />} />
          <Route path="/galleries/:galleryId" element={<Gallery />} />
          <Route path="/sign-up" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
