import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./Home.css";
import api from "../api/Api";

let msgCounter = 0;

export default function Home() {
   const [chats, setChats] = useState([]);
   const [messages, setMessages] = useState([]);
   const [activeChatId, setActiveChatId] = useState(null);
   const [input, setInput] = useState("");
   const [isThinking, setIsThinking] = useState(false);
   const [socket, setSocket] = useState(null);
   const [sidebarOpen, setSidebarOpen] = useState(false); // sidebar toggle state

   const textareaRef = useRef(null);
   const scrollRef = useRef(null);

   const activeChat = chats.find((c) => c._id === activeChatId) || null;

   // ------------------ Helpers ------------------

   const addMessage = (role, content, _id = null) => {
      const id = _id || `local-${msgCounter++}`;
      setMessages((prev) => [...prev, { _id: id, role, content }]);
      return id;
   };

   // ------------------ API Calls ------------------

   const fetchChats = async () => {
      try {
         const res = await api.get("/api/chats");
         const serverChats = res.data.chats || [];
         setChats(serverChats);

         if (serverChats.length) {
            setActiveChatId(serverChats[0]._id);
            await fetchMessages(serverChats[0]._id);
         } else {
            await createChat(); // default "Getting Started"
         }
      } catch (err) {
         console.error("Error fetching chats:", err);
      }
   };

   const fetchMessages = async (chatId) => {
      try {
         const res = await api.get(`/api/chats/${chatId}/messages`);
         setMessages(res.data.messages || []);
      } catch (err) {
         console.error("Error fetching messages:", err);
         setMessages([]);
      }
   };

   const createChat = async (titlePrompt = false) => {
      let chatTitle;
      if (titlePrompt) {
         chatTitle = prompt("Enter chat title:");
         if (!chatTitle) return;
      } else {
         chatTitle = "Getting Started";
      }

      try {
         const res = await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/api/chats`,
            { title: chatTitle },
            { withCredentials: true }
         );

         const newChat = res.data.chat || { _id: `chat-${msgCounter++}`, title: chatTitle };
         setChats((prev) => [newChat, ...prev]);
         setActiveChatId(newChat._id);
         setMessages([]);
      } catch (err) {
         console.error("Failed to create chat:", err.response?.data || err.message);
      }
   };

   const handleDeleteChat = async (chatId) => {
      try {
         await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/chats/${chatId}`, { withCredentials: true });
         setChats((prev) => prev.filter((chat) => chat._id !== chatId));

         if (activeChatId === chatId) {
            setActiveChatId(null);
            setMessages([]);
         }
      } catch (err) {
         console.error("Failed to delete chat:", err.response?.data || err.message);
      }
   };

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

   const handleKey = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSend();
      }
   };

   // ------------------ Effects ------------------

   useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "0px";
      el.style.height = Math.min(el.scrollHeight, 220) + "px";
   }, [input]);

   useEffect(() => {
      const container = scrollRef.current;
      if (container) container.scrollTop = container.scrollHeight;
   }, [messages.length, isThinking]);

   useEffect(() => {
      fetchChats();
   }, []);

   useEffect(() => {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080", {
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
         {/* Mobile sidebar toggle button */}
         <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(prev => !prev)}
         >
            ☰
         </button>

         {/* Sidebar */}
         <aside className={`chat-sidebar ${sidebarOpen ? "active" : ""}`}>
            <div className="sidebar-header">Chats</div>
            <button className="new-chat-btn" onClick={() => createChat(true)}>
               + New Chat
            </button>

            <div className="chat-list">
               {chats.length > 0 ? (
                  chats.map((chat) => (
                     <div
                        key={chat._id}
                        className={`chat-item-wrapper ${chat._id === activeChatId ? "active" : ""}`}
                     >
                        <button
                           className="chat-title-btn"
                           onClick={() => {
                              setActiveChatId(chat._id);
                              fetchMessages(chat._id);
                              setSidebarOpen(false); // auto-close on mobile
                           }}
                        >
                           <span className="chat-item-text">{chat.title}</span>
                        </button>

                        <button
                           className="delete-chat-btn"
                           onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat._id);
                           }}
                        >
                           <span className="material-icons">Delete</span>
                        </button>
                     </div>
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
