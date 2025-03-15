import { Send } from "lucide-react"; // Import send icon
import { useSelector, useDispatch } from "react-redux";
import { useRef, useEffect } from "react";
import axios from "axios";
import { addMessage } from "../redux/chatSlice";

const ChatWindow = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const messages = useSelector((state) => state.chat.messages || []);
  const dispatch = useDispatch();
  const loginUser = JSON.parse(localStorage.getItem("user"));
  const loginUserId = loginUser._id;
  const messageTextRef = useRef("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {


    const text = messageTextRef.current.value.trim();
    if (!text || !selectedUser) return;

    const date = new Date();
    const isoString = date.toISOString();
    

    const newMessage = { 
      senderId: loginUserId,
      receiverId: selectedUser._id,  
      text,
      createdAt: isoString,
     };
    dispatch(addMessage({ message: newMessage }));
    messageTextRef.current.value = "";

    await axios.post(
      `http://localhost:8000/user/sendMessage/${selectedUser._id}`,
      { text },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
  };

  return (
    <div className="w-3/4 flex flex-col h-screen bg-gray-100 shadow-lg rounded-lg">
      {selectedUser ? (
        <>
          <div className="p-4 bg-blue-600 text-white text-lg font-semibold flex items-center rounded-t-lg">
            Chat with {selectedUser.username}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {[...messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.senderId === loginUserId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-lg shadow max-w-xs ${
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

<div className="p-4 bg-white flex items-center border-t rounded-b-lg">
  {/* Input Field */}
  <input
    type="text"
    ref={messageTextRef}
    className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700"
    placeholder="Type a message..."
  />
  
  {/* Send Button */}
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
