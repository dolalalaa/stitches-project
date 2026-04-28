import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./ChatPage.css";

const socket = io("http://localhost:5000");

const ShopChatPage = () => {
  const stored  = localStorage.getItem("stitches_user");
  const shopUser = stored ? JSON.parse(stored) : {};
  const shopName = shopUser.name || "Shopkeeper";

  const [customers, setCustomers]     = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const messagesEndRef                = useRef(null);

  // Fetch all users who have chatted with this shop from DB
  useEffect(() => {
    fetch("http://localhost:5000/api/chat/rooms/" + shopName)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.customers?.length > 0) {
          setCustomers(data.customers);
          setSelectedCust(data.customers[0]);
        }
      })
      .catch(() => {});
  }, [shopName]);

  useEffect(() => {
    if (!selectedCust) return;
    const room = `${selectedCust.name}_${shopName}`;
    socket.emit("join_room", room);
    socket.emit("load_messages", room);

    socket.on("receive_message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("message_history", (history) => setMessages(history));

    return () => {
      socket.off("receive_message");
      socket.off("message_history");
    };
  }, [selectedCust, shopName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = (data) => {
    if (!selectedCust) return;
    const room = `${selectedCust.name}_${shopName}`;
    socket.emit("send_message", {
      ...data,
      room,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
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
          {customers.length === 0 ? (
            <p style={{ color: "#999", fontSize: "13px", padding: "10px" }}>No chats yet</p>
          ) : (
            customers.map((c) => (
              <div
                key={c.id}
                className={`cp-owner-item ${selectedCust?.id === c.id ? "active" : ""}`}
                onClick={() => setSelectedCust(c)}
              >
                {c.name}
              </div>
            ))
          )}
        </div>

        <div className="cp-main">
          <header className="cp-chat-header">
            <h2>{selectedCust ? `Chat with ${selectedCust.name}` : "Select a client"}</h2>
          </header>

          <div className="cp-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cp-msg-wrap ${msg.sender === shopName ? "me" : "them"}`}>
                <div className="cp-bubble">
                  {msg.image && <img src={msg.image} alt="pic" className="cp-sent-img" />}
                  {msg.audio && <audio src={msg.audio} controls />}
                  {msg.text  && <p>{msg.text}</p>}
                  <span className="cp-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="cp-input-area">
            <input type="file" id="shopImg" style={{ display: "none" }} onChange={handleImageUpload} />
            <button className="cp-action-btn" onClick={() => document.getElementById("shopImg").click()}>🖼️</button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Reply..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  sendMsg({ sender: shopName, text: input });
                  setInput("");
                }
              }}
            />
            <button className="cp-send-btn" onClick={() => {
              if (input.trim()) { sendMsg({ sender: shopName, text: input }); setInput(""); }
            }}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopChatPage;