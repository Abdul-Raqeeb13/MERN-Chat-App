import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addMessage, removeMessage, updateDeleteMesageForMe } from "../redux/chatSlice";
import { useSocketContext } from "../Context/SocketContext";
import notificationSound from "../assets/sounds/NotificationSound.mp3";
import { FaFolderOpen } from "react-icons/fa";

const ChatWindow = () => {
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const messages = useSelector((state) => state.chat.messages || []);
  const dispatch = useDispatch();
  const loginUser = JSON.parse(localStorage.getItem("user"));
  const loginUserId = loginUser?._id;
  const { socket } = useSocketContext();
  const [image, setImage] = useState()
  const inputRef = useRef(null); // 🔹 Reference for input field
  const fileInputRef = useRef(null);
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
        dispatch(updateDeleteMesageForMe({ updatedMessageId: selectedMessage._id, deleteSide: "senderDelete" })); // Optimistic UI update

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
        dispatch(updateDeleteMesageForMe({ updatedMessageId: selectedMessage._id, deleteSide: "receiverDelete" })); // Optimistic UI update

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
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
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
    const messageText = inputRef.current.value.trim();
    if (!selectedUser && !messageText && !image) return;

    const formData = new FormData();
    formData.append("text", messageText);

    if (image?.file) {
      formData.append("image", image.file);
    }

    try {
      const res = await axios.post(
        `http://localhost:8000/user/sendMessage/${selectedUser._id}`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );

      dispatch(addMessage({ message: res.data.data }));
      inputRef.current.value = "";
      setImage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };


  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create preview URL
      setImage({ file, preview: imageUrl });
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
                    <div className="message-container" onClick={() => openDeleteModal(msg)}>
                      {(msg.senderDelete && msg.senderId === loginUserId) || (msg.receiverDelete && msg.senderId !== loginUserId) ? (
                        <p className="text-sm">You deleted this message</p>
                      ) : (
                        <>
                          {/* ✅ Show Image if exists */}
                          {msg.imgLink && <img src={msg.imgLink} alt="Message Image" className="w-40 h-auto rounded-lg mb-2" />}

                          {/* ✅ Show Text only if it's not empty/null */}
                          {msg.text?.trim() && <p className="text-sm">{msg.text}</p>}
                        </>
                      )}
                    </div>


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


          {/* Image Preview Section */}
          {image && (
  <div className="relative inline-block">
    <button
      onClick={() => setImage(null)}
      className="absolute top-0 right-220 bg-red-500 text-white text-xs p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
    >
      ✕
    </button>
    <img src={image.preview} alt="Selected" className="w-20 h-20 rounded-lg shadow-md" />
  </div>
)}


          {/* Message Input Section */}
          <div className="p-4 bg-white flex items-center border-t rounded-b-lg">
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-3 m-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <FaFolderOpen size={20} />
            </button>
            <input
              type="text"
              ref={inputRef}
              onChange={handleChange}
              onBlur={handleBlur}
              // 🔹 Set ref instead of useState
              className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700"
              placeholder="Type a message..."
            />


            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageSelect}
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
