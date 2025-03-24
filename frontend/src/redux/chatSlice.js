import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedUser: null,
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Select a user and reset messages
    selectUser: (state, action) => {
      state.selectedUser = action.payload;
      state.messages = [];
    },

    // Add new message
    addMessage: (state, action) => {
      const { message } = action.payload;
      
      if (state.messages.length == 0) {
        state.messages = [];
      }
      state.messages.push(message);
    },

    // Store previous messages
    previousMessages: (state, action) => {
    
      const { messages } = action.payload; // Extract messages correctly
      if (Array.isArray(messages)) {
        state.messages = messages; // Assign messages safely
        
      } else {
        console.error("Invalid messages format:", messages);
      }
    },


    removeMessage: (state, action) => {
      const { messageId } = action.payload;
      const index = state.messages.findIndex(msg => msg._id === messageId);
      console.log(index);
      if (index !== -1) {
        state.messages.splice(index, 1); // ✅ Correct usage of splice
      }
    }
  },
});

export const { selectUser, addMessage, previousMessages, removeMessage } = chatSlice.actions;
export default chatSlice.reducer;
