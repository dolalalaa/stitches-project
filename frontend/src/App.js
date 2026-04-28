// App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

import CDashboard from "./pages/CDashboard";
import MeasurementForm from "./pages/MeasurementForm";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import ShopChatPage from "./pages/ShopChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/measurements" element={<MeasurementForm />} />
        <Route path="/payment"      element={<CheckoutPage />} />
        <Route path="/profile"      element={<ProfilePage />} />
        <Route path="/c-dashboard" element={<CDashboard />} />
        <Route path="/chat"         element={<ChatPage />} /> 
        <Route path="/shop-chat"    element={<ShopChatPage />} /> 
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;



