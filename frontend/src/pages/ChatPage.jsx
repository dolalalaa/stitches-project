// frontend/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import "./ChatPage.css";

const socket = io("http://localhost:5000");

const SHOP_OWNERS = [
  { id: "shop_owner_1", name: "Classic Tailors" },
  { id: "shop_owner_2", name: "Modern Stitches" },
];

const ChatPage = () => {
  const customerName = localStorage.getItem("customerName") || "Customer";
  const [selectedOwner, setSelectedOwner] = useState(SHOP_OWNERS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const room = `${customerName}_${selectedOwner.id}`;
    socket.emit("join_room", room);
    socket.emit("load_messages", room);

    socket.on("receive_message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("message_history", (history) => setMessages(history));

    return () => {
      socket.off("receive_message");
      socket.off("message_history");
    };
  }, [selectedOwner, customerName]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const sendMsg = (data) => {
    const room = `${customerName}_${selectedOwner.id}`;
    const payload = { 
        ...data, 
        room, 
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
    };
    socket.emit("send_message", payload);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => sendMsg({ sender: customerName, image: reader.result });
    }
  };

  return (
    <div className="cp-root">
      <Sidebar active="chat" />
      <div className="cp-main">
        <div className="cp-layout">
          <div className="cp-owners">
            <p className="cp-owners-label">Shop Owners</p>
            {SHOP_OWNERS.map((o) => (
              <div key={o.id} className={`cp-owner-item ${selectedOwner.id === o.id ? "active" : ""}`} onClick={() => setSelectedOwner(o)}>
                {o.name}
              </div>
            ))}
          </div>
          <div className="cp-chat-window">
            <header className="cp-chat-header"><h2>Chat with {selectedOwner.name}</h2></header>
            <div className="cp-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`cp-msg-wrap ${msg.sender === customerName ? "me" : "them"}`}>
                  <div className="cp-bubble">
                    {msg.image && <img src={msg.image} alt="pic" className="cp-sent-img" />}
                    {msg.text && <p>{msg.text}</p>}
                    <span className="cp-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="cp-input-area">
              <input type="file" id="imgInp" style={{display:"none"}} onChange={handleImage} />
              <button className="cp-action-btn" onClick={() => document.getElementById("imgInp").click()}>🖼️</button>
              <input 
                value={input} 
                onChange={(e)=>setInput(e.target.value)} 
                placeholder="Type your message..." 
                onKeyPress={(e)=>e.key==="Enter" && input.trim() && (sendMsg({sender:customerName, text:input}), setInput(""))} 
              />
              <button className="cp-action-btn" onClick={() => { if(input.trim()){sendMsg({sender:customerName, text:input}); setInput("");} }}>➡️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;