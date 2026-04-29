import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./ChatPage.css";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const stored       = localStorage.getItem("stitches_user");
  const user         = stored ? JSON.parse(stored) : {};
  const customerName = user.name || localStorage.getItem("customerName") || "Customer";
  const navigate     = useNavigate();

  const [shopOwners, setShopOwners]       = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const messagesEndRef                    = useRef(null);

  // Read ?shop= from URL
  const params      = new URLSearchParams(window.location.search);
  const preSelected = params.get("shop");

  useEffect(() => {
    fetch("http://localhost:5000/api/chat/shops/" + customerName)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.shops?.length > 0) {
          let shops = data.shops;

          // If coming from shop profile, add shop if not already in list
          if (preSelected) {
            const exists = shops.find(s => s.name === preSelected);
            if (!exists) shops = [{ id: preSelected, name: preSelected }, ...shops];
            const target = shops.find(s => s.name === preSelected);
            setSelectedOwner(target);
          } else {
            setSelectedOwner(shops[0]);
          }

          setShopOwners(shops);
        } else if (preSelected) {
          // No chat history yet — add the shop directly
          const newShop = { id: preSelected, name: preSelected };
          setShopOwners([newShop]);
          setSelectedOwner(newShop);
        }
      })
      .catch(() => {});
  }, [customerName]);

  useEffect(() => {
    if (!selectedOwner) return;
    const room = `${customerName}_${selectedOwner.name}`;

    socket.emit("join_room", room);
    socket.emit("load_messages", room);

    socket.off("receive_message");
    socket.off("message_history");

    socket.on("receive_message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("message_history", (history) => setMessages(history));

    return () => {
      socket.off("receive_message");
      socket.off("message_history");
    };
  }, [selectedOwner, customerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = (data) => {
    if (!selectedOwner) return;
    const room = `${customerName}_${selectedOwner.name}`;
    socket.emit("send_message", {
      ...data,
      room,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
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
            {shopOwners.length === 0 ? (
              <p style={{ color: "#999", fontSize: "13px", padding: "10px" }}>No chats yet</p>
            ) : (
              shopOwners.map((o) => (
                <div
                  key={o.id}
                  className={`cp-owner-item ${selectedOwner?.id === o.id ? "active" : ""}`}
                  onClick={() => setSelectedOwner(o)}
                >
                  {o.name}
                </div>
              ))
            )}
          </div>

          <div className="cp-chat-window">
            <header className="cp-chat-header">
              <h2>{selectedOwner ? `Chat with ${selectedOwner.name}` : "Select a shop"}</h2>
            </header>

            <div className="cp-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`cp-msg-wrap ${msg.sender === customerName ? "me" : "them"}`}>
                  <div className="cp-bubble">
                    {msg.image && <img src={msg.image} alt="pic" className="cp-sent-img" />}
                    {msg.text  && <p>{msg.text}</p>}
                    <span className="cp-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="cp-input-area">
              <input type="file" id="imgInp" style={{ display: "none" }} onChange={handleImage} />
              <button className="cp-action-btn" onClick={() => document.getElementById("imgInp").click()}>🖼️</button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    sendMsg({ sender: customerName, text: input });
                    setInput("");
                  }
                }}
              />
              <button className="cp-action-btn" onClick={() => {
                if (input.trim()) { sendMsg({ sender: customerName, text: input }); setInput(""); }
              }}>➡️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;