import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./ChatPage.css";

const socket = io("http://localhost:5000");

const CUSTOMERS = [
  { id: "customer_1", name: "Kaspia" },
  { id: "customer_2", name: "John Doe" },
];

const ShopChatPage = () => {
  const shopName = "Shopkeeper";
  const [selectedCust, setSelectedCust] = useState(CUSTOMERS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const room = `${selectedCust.name}_shop_owner_1`;
    socket.emit("join_room", room);
    socket.emit("load_messages", room);

    socket.on("receive_message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("message_history", (history) => setMessages(history));

    return () => {
      socket.off("receive_message");
      socket.off("message_history");
    };
  }, [selectedCust]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = (data) => {
    const room = `${selectedCust.name}_shop_owner_1`;
    const payload = {
      ...data,
      room,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    socket.emit("send_message", payload);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => sendMsg({ sender: shopName, image: reader.result });
    }
  };

  return (
    <div className="cp-root">
      <div className="cp-layout">
        <div className="cp-owners">
          <p className="cp-owners-label">Clients</p>
          {CUSTOMERS.map((c) => (
            <div key={c.id} className={`cp-owner-item ${selectedCust.id === c.id ? "active" : ""}`} onClick={() => setSelectedCust(c)}>
              {c.name}
            </div>
          ))}
        </div>

        <div className="cp-main">
          <header className="cp-chat-header">
            <h2>Shop Dashboard: {selectedCust.name}</h2>
          </header>

          <div className="cp-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cp-msg-wrap ${msg.sender === shopName ? "me" : "them"}`}>
                <div className="cp-bubble">
                  {msg.image && <img src={msg.image} alt="pic" className="cp-sent-img" />}
                  {/* Keep audio rendering in case the customer sends a voice note */}
                  {msg.audio && <audio src={msg.audio} controls />}
                  {msg.text && <p>{msg.text}</p>}
                  <span className="cp-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="cp-input-area">
            <input type="file" id="shopImg" style={{display:"none"}} onChange={handleImageUpload} />
            <button className="cp-action-btn" onClick={() => document.getElementById("shopImg").click()}>🖼️</button>
            
            <input 
              value={input} 
              onChange={(e)=>setInput(e.target.value)} 
              placeholder="Reply..." 
              onKeyPress={(e)=>e.key==="Enter" && input.trim() && (sendMsg({sender:shopName, text:input}), setInput(""))} 
            />

            {/* 🎤 Voice Option Removed */}
            
            <button className="cp-send-btn" onClick={() => { if(input.trim()){sendMsg({sender:shopName, text:input}); setInput("");} }}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopChatPage;