import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addMessage, removeMessage, updateDeleteMesageForMe } from "../redux/chatSlice";
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
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const openDeleteModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const handleDelete = async (actionType) => {

    if (!selectedMessage) return;
    // deleteForMeReceiver
    if (actionType == "deleteForMe") {

      try {
        await axios.delete(`http://localhost:8000/user/messages/${selectedMessage._id}`, {
          data: { actionType, userId: loginUserId, selectUserId: selectedMessage.receiverId },
          withCredentials: true,
        });
        dispatch(updateDeleteMesageForMe({ updatedMessageId: selectedMessage._id, deleteSide : "senderDelete" })); // Optimistic UI update

        closeModal();
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
    else if (actionType == "deleteForMeReceiver") {

      try {
        await axios.delete(`http://localhost:8000/user/messages/${selectedMessage._id}`, {
          data: { actionType, userId: loginUserId, selectUserId: selectedMessage.receiverId },
          withCredentials: true,
        });
        dispatch(updateDeleteMesageForMe({ updatedMessageId: selectedMessage._id, deleteSide : "receiverDelete" })); // Optimistic UI update

        closeModal();
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
    else if (actionType == "deleteForEveryone") {
      try {
        await axios.delete(`http://localhost:8000/user/messages/${selectedMessage._id}`, {
          data: { actionType, userId: loginUserId, selectUserId: selectedMessage.receiverId },
          withCredentials: true,
        });

        dispatch(removeMessage({ messageId: selectedMessage._id }));
        closeModal();
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }

  };

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

    socket.on('messageDeleted', (messageId) => {
      dispatch(removeMessage({ messageId }));
    });

    // socket.on('deleteForMe', (updatedata))


    return () => {
      socket?.off("newMessage");
      socket.off("userTyping");
      socket.off("stopTyping");
      socket.off('messageDeleted');
    };
  }, [socket, dispatch]);

  // handle typing status
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setTypingUser(senderId); // ✅ Store senderId
      }
    };
    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setTypingUser(null); // ✅ Set to null when user stops typing
      }
    };


    socket.on("userTyping", handleTyping);

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

  // when user start typing message
  const handleChange = (e) => {
    if (selectedUser?._id) {
      socket.emit("userTyping", { senderId: loginUserId, receiverId: selectedUser._id });
    }
  };

  // when user stop typing message
  const handleBlur = () => {
    socket.emit("stopTyping", {
      senderId: loginUserId,
      receiverId: selectedUser?._id, // Stop typing notification for selected user
    });
  };

  const [typingUser, setTypingUser] = useState(null);

  // Send message function
  const sendMessage = async () => {
    const messageText = inputRef.current.value.trim(); // 🔹 Get value from ref
    if (!messageText || !selectedUser) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/user/sendMessage/${selectedUser._id}`,
        { text: messageText },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      dispatch(addMessage({ message: res.data.data })); // Optimistic UI update

      inputRef.current.value = ""; // 🔹 Clear input field without triggering re-render

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
            {typingUser === selectedUser._id && (
              <div className="text-gray-300 text-sm mt-1">typing...</div>
            )}

          </div>


          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {[...messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg, index) => (
                <div key={index} className={`flex ${msg.senderId === loginUserId ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-3 rounded-lg shadow max-w-sm w-fit break-words whitespace-pre-wrap ${msg.senderId === loginUserId
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-300 text-black rounded-bl-none"
                      }`}
                  >
                    <p className="text-sm" onClick={() => openDeleteModal(msg)}>
                      {(msg.senderDelete && msg.senderId === loginUserId) || (msg.receiverDelete && msg.senderId !== loginUserId)
                        ? <p>You deleted this message</p>
                        : msg.text}
                    </p>
                    <span className="text-xs opacity-70 block text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {showModal && selectedMessage && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p className="mb-4">Delete this message?</p>
                        {selectedMessage.senderId === loginUserId ? (
                          <>
                            <button onClick={() => handleDelete("deleteForEveryone")} className="bg-red-500 text-white px-4 py-2 rounded mr-2">Delete for Everyone</button>
                            <button onClick={() => handleDelete("deleteForMe")} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Delete for Me</button>
                          </>
                        ) : (
                          <button onClick={() => handleDelete("deleteForMeReceiver")} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Delete for Me</button>
                        )}
                        <button onClick={closeModal} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                      </div>
                    </div>
                  )}
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
