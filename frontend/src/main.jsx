import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './Context/authContext.jsx'
import { SocketContextProvider } from './Context/SocketContext.jsx'
import { Provider } from "react-redux";
import store from "./redux/store"; // Import Redux store

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContextProvider>
      <SocketContextProvider>
      <Provider store={store}>
        <App />
      </Provider>
      </SocketContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
)
