import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { selectUser, previousMessages } from "../redux/chatSlice.js";
import store from "../redux/store.js";
import { Search } from "lucide-react"; // Import the Search icon

const UserList = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const loginUser = JSON.parse(localStorage.getItem("user"));
    const loginUserId = loginUser._id;

    // Fetch all users except the logged in user
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/user/getUsers", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        const users = response.data.users;

        const filteredUsers = users.filter((u) => u._id !== loginUserId);  // ensuer login user is not in the list
        setAllUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Handle conversation with selected user creating a new conversation or fetching previous messages if conversation already exists
  const handleConversation = async (user) => {
    dispatch(selectUser(user));   // select user to chat with and store in redux selectedUser state variable 

    const updatedSelectedUser = store.getState().chat.selectedUser;   // get updated selected user

    try {
      const res = await axios.post(
        `http://localhost:8000/user/createConversation/${updatedSelectedUser?._id}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch(previousMessages(res.data));   // store previous messages in redux message state
      console.log("Conversation response:", res.data);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="w-1/4 bg-white shadow-md px-4 border-r h-screen overflow-y-auto">

      {/* 🔍 Search Input */}
      <div className="relative p-3 bg-gray-100 rounded-lg mb-4">
  {/* Search Icon */}
  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
  
  {/* Input Field */}
  <input
    type="text"
    placeholder="Search users..."
    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

      {/* 👥 User List */}
      <div className="space-y-2">
        {allUsers
          .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((user) => (
            <div
              key={user._id}
              className={`p-3 flex items-center space-x-3 cursor-pointer rounded-lg transition-all duration-200 ${selectedUser?._id === user._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
                }`}
              onClick={() => handleConversation(user)}
            >
              {/* 🟢 Profile Icon */}
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {/* User Name */}
              <span className="font-medium">{user.username}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserList;
