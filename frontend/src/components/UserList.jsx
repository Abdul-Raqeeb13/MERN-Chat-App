import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { selectUser, previousMessages } from "../redux/chatSlice.js";
import store from "../redux/store.js";
import { Search, LogOut } from "lucide-react";
import { useSocketContext } from "../Context/SocketContext.jsx";

const UserList = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const dispatch = useDispatch();
  const { onlineUsers } = useSocketContext();

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem("user"));
    const loginUserId = loginUser?._id;

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/user/getUsers", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        const users = response.data.users;
        setAllUsers(users.filter((u) => u._id !== loginUserId));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleConversation = async (user) => {
    dispatch(selectUser(user));
    const updatedSelectedUser = store.getState().chat.selectedUser;

    try {
      const res = await axios.post(
        `http://localhost:8000/user/createConversation/${updatedSelectedUser?._id}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch(previousMessages(res.data));
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // 🔥 Logout Function: Clears local storage and reloads the page
  const handleLogout = async () => {
    try {
      await axios.post(
        `http://localhost:8000/user/logout`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      localStorage.removeItem("user"); // Clear user data from local storage
      localStorage.removeItem("token"); // Clear user data from local storage
   
    } catch (error) {
      console.error("Failed to send message:", error);
    }
    window.location.reload(); // Reload the page to reset state
  };

  return (
    <div className="w-1/4 bg-white shadow-lg border-r h-screen overflow-y-auto p-4 flex flex-col justify-between">
      {/* 🔍 Search Bar */}
      <div>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 👥 User List */}
        <div className="space-y-3">
          {allUsers
            .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((user) => {
              const isOnline = onlineUsers.includes(user._id);

              return (
                <div
                  key={user._id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedUser?._id === user._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleConversation(user)}
                >
                  {/* 🟢 Profile Icon with Online Status */}
                  <div className="relative w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                    {user.username.charAt(0).toUpperCase()}
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="ml-3">
                    <span className="font-medium text-lg">{user.username}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 🚀 Logout Button */}
      <button
  onClick={handleLogout}
  className="fixed bottom-4 left-4 flex items-center justify-center gap-2 py-3 px-22 mt-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
>
  <LogOut size={20} /> Logout
</button>

    </div>
  );
};

export default UserList;
