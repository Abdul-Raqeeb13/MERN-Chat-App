import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addMessage } from "../redux/chatSlice";
import { useSocketContext } from "../Context/SocketContext";
import notificationSound from "../assets/sounds/NotificationSound.mp3";

const ChatWindow = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const messages = useSelector((state) => state.chat.messages || []);
  const dispatch = useDispatch();
  const loginUser = JSON.parse(localStorage.getItem("user"));
  const loginUserId = loginUser?._id;
  const { socket } = useSocketContext();

  const inputRef = useRef(null); // 🔹 Reference for input field
  const messagesEndRef = useRef(null); // 🔹 Reference for auto-scroll

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket?.on("newMessage", (newMessage) => {
      const sound = new Audio(notificationSound);
      sound.play();
      dispatch(addMessage({ message: newMessage }));
    });

    socket?.on("userTyping", ({ senderId }) => {
      setTypingUser(senderId);
    });

    socket?.on("stopTyping", ({ senderId }) => {
      setTypingUser(null);
    });

    

    return () => {
      socket?.off("newMessage");
      socket.off("userTyping");
      socket.off("stopTyping");
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (!socket || !selectedUser) return;
  
    const handleTyping = ({ senderId }) => {
      // senderId => loginUserID
      console.log("Typing event from:", senderId);  // The person who is typing
      console.log("Logged-in user ID:", loginUserId);
      console.log("Selected user ID:", selectedUser?._id);
      ;
      if (senderId === selectedUser._id) {
        setTypingUser(true); // Show typing only if the selected user is typing
      }
    };
  
    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setTypingUser(false); // Hide typing when they stop
      }
    };
  
    socket.on("userTyping", handleTyping);
    console.log(handleTyping);
    
    socket.on("stopTyping", handleStopTyping);
  
    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser]);
  
  // Reset typing indicator when switching users
  useEffect(() => {
    setTypingUser(false);
  }, [selectedUser]);
  

  const handleChange = (e) => {
    socket.emit("userTyping", { senderId: loginUserId });  // loginuserID
  };

  const handleBlur = () => {
    socket.emit("stopTyping", { senderId: loginUserId });
  };

  const [typingUser, setTypingUser] = useState(null);



  // Send message function
  const sendMessage = async () => {
    const messageText = inputRef.current.value.trim(); // 🔹 Get value from ref
    if (!messageText || !selectedUser) return;

    const newMessage = {
      senderId: loginUserId,
      receiverId: selectedUser._id,
      text: messageText,
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessage({ message: newMessage })); // Optimistic UI update

    inputRef.current.value = ""; // 🔹 Clear input field without triggering re-render

    try {
      await axios.post(
        `http://localhost:8000/user/sendMessage/${selectedUser._id}`,
        { text: messageText },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-3/4 flex flex-col h-screen bg-gray-100 shadow-lg rounded-lg">
      {selectedUser ? (
        <>
          <div className="p-4 bg-blue-600 text-white text-lg font-semibold rounded-t-lg">
  <div>{selectedUser.username}</div>
  {typingUser && (
    <div className="text-gray-300 text-sm mt-1">typing...</div>
  )}
</div>

          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {[...messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg, index) => (
                <div key={index} className={`flex ${msg.senderId === loginUserId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-3 rounded-lg shadow max-w-sm w-fit break-words whitespace-pre-wrap ${
                      msg.senderId === loginUserId
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-300 text-black rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs opacity-70 block text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Section */}
          <div className="p-4 bg-white flex items-center border-t rounded-b-lg">
            <input
              type="text"
              ref={inputRef}
              onChange={handleChange}
              onBlur={handleBlur}
               // 🔹 Set ref instead of useState
              className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="ml-3 px-5 py-3 bg-blue-600 text-white font-medium rounded-full shadow-md flex items-center gap-2 hover:bg-blue-700 transition-all duration-300"
            >
              <span>Send</span>
              <Send size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-lg">
          Select a user to start chatting
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
