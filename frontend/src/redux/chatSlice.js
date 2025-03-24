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
      if (index !== -1) {
        state.messages.splice(index, 1); // ✅ Correct usage of splice
      }
    },

    updateDeleteMesageForMe: (state, action) => {
      const { updatedMessageId, deleteSide } = action.payload

      const index = state.messages.findIndex(msg => msg._id === updatedMessageId);
      // if (index !== -1) {

      if (index !== -1) {
        if (deleteSide == "senderDelete") {
          state.messages[index] = {
            ...state.messages[index],
            senderDelete: true // Set the senderDelete flag to true
          }
        }
        else if (deleteSide == "receiverDelete") {
          state.messages[index] = {
            ...state.messages[index],
            receiverDelete: true // Set the senderDelete flag to true
          }
        }

      }

      // const updatedUsers = [...state.users];
      // updatedUsers[index] = { ...updatedUsers[index], ...action.payload.newData };
      // return { ...state, users: updatedUsers };
      // }
      return state;


    }
  },
});

export const { selectUser, addMessage, previousMessages, removeMessage, updateDeleteMesageForMe } = chatSlice.actions;
export default chatSlice.reducer;
