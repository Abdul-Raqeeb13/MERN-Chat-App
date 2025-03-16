import React, { useState, createContext, useContext, useEffect } from "react";
import { useAuthContext } from "./authContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
}

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuthContext();

    useEffect(() => {
        if (authUser) {
            const socket = io("http://localhost:8000",{
                query: {
                    userId: authUser._id,
                },
            });

            setSocket(socket)

            // Get online users from the server and set the state variable onlineUsers to the list of online users 
            socket.on("getOnlineUsers", (users) => {
                
                setOnlineUsers(users);
            })

            return () => {
                socket.close(); // Ensure cleanup when unmounting
              };
        }
        else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    },[authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}