import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Home.css";

// Simple local counter for temporary IDs
let msgCounter = 0;

export default function Home() {
   const [chats, setChats] = useState([]);
   const [socket, setSocket] = useState(null);
   const [messages, setMessages] = useState([]);
   const [activeChatId, setActiveChatId] = useState(null);
   const [input, setInput] = useState("");
   const [isThinking, setIsThinking] = useState(false);

   const textareaRef = useRef(null);
   const scrollRef = useRef(null);

   // Get the active chat safely
   const activeChat = chats?.find((c) => c._id === activeChatId) || null;

   // ------------------ Chat Functions ------------------

   // Add message to state with optional id
   const addMessage = (role, content, _id = null) => {
      const id = _id || `local-${msgCounter++}`;
      setMessages((prev) => [...prev, { role, content, _id: id }]);
      return id;
   };

   // Create new chat
   const createChat = async () => {
      const chatTitle = prompt("Enter chat title:");
      if (!chatTitle) return;

      try {
         const res = await axios.post(
            `http://localhost:8080/api/chats`,
            { title: chatTitle },
            { withCredentials: true }
         );

         const newChat = res.data.chat || { _id: `chat-${msgCounter++}`, title: chatTitle };
         setChats((prev) => [newChat, ...prev]);
         setActiveChatId(newChat._id);
         setMessages([]); // clear previous messages
      } catch (err) {
         console.error("Failed to create chat:", err);
      }
   };

   // Send message
   const handleSend = async () => {
      const trimmed = input.trim();
      if (!trimmed || isThinking || !socket) return;

      const messageId = addMessage("user", trimmed);
      setInput("");
      setIsThinking(true);

      socket.emit("ai-message", {
         chat: activeChatId,
         text: trimmed,
         _id: messageId,
      });
   };

   // Handle Enter key for sending
   const handleKey = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSend();
      }
   };

   // ------------------ Effects ------------------

   // Auto-resize textarea
   useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "0px";
      el.style.height = Math.min(el.scrollHeight, 220) + "px";
   }, [input]);

   // Auto-scroll to bottom
   useEffect(() => {
      const container = scrollRef.current;
      if (container) container.scrollTop = container.scrollHeight;
   }, [messages.length, isThinking]);

   // Fetch existing chats on load
   useEffect(() => {
      axios
         .get(`http://localhost:8080/api/chats`, { withCredentials: true })
         .then((res) => setChats(res.data.chats || []))
         .catch((err) => console.error("Error fetching chats:", err));
   }, []);

   // Setup Socket.IO
   useEffect(() => {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
         withCredentials: true,
      });

      newSocket.on("ai-response", (data) => {
         const id = data._id || `ai-${msgCounter++}`;
         setMessages((prev) => [...prev, { _id: id, role: "model", content: data.text }]);
         setIsThinking(false);
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
   }, []);

   // ------------------ JSX ------------------

   return (
      <div className="home-root">
         {/* Sidebar */}
         <aside className="chat-sidebar">
            <div className="sidebar-header">Chats</div>
            <button className="new-chat-btn" onClick={createChat}>
               + New Chat
            </button>

            <div className="chat-list">
               {chats?.length > 0 ? (
                  chats.map((chat) => (
                     <button
                        key={chat._id}
                        className={`chat-item ${chat._id === activeChatId ? "active" : ""}`}
                        onClick={() => {
                           setActiveChatId(chat._id);
                           setMessages([]); // clear messages when switching chat
                        }}
                     >
                        <span style={{ flex: 1 }}>{chat.title}</span>
                     </button>
                  ))
               ) : (
                  <p>No chats available</p>
               )}
            </div>

            <div className="sidebar-footer">Demo chat UI • Local state only</div>
         </aside>

         {/* Main Chat */}
         <main className="chat-main">
            <div className="chat-scroll" ref={scrollRef}>
               {messages.map((msg) => (
                  <div
                     key={msg._id}
                     className={`chat-message ${msg.role === "user" ? "user-message" : "ai-message"}`}
                  >
                     <div className="message-content">
                        <p>{msg.content}</p>
                     </div>
                  </div>
               ))}
            </div>

            {activeChatId && (
               <div className="chat-input-bar">
                  <div className="input-shell-wide">
                     <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        placeholder="Message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        rows={1}
                     />
                     <button
                        className="send-btn"
                        disabled={!input.trim() || isThinking}
                        onClick={handleSend}
                     >
                        Send
                     </button>
                  </div>
                  <div className="token-hint">Enter to send • Shift+Enter = newline</div>
               </div>
            )}
         </main>
      </div>
   );
}
