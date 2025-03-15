import React from "react";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatBox";

function Chatpage() {
  return (
    <div className="flex h-screen">
      <UserList />
      <ChatWindow />
    </div>
  );
}

export default Chatpage;

