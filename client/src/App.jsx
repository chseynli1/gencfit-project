import "./App.css";
import { Header, Footer } from "./shared/layout";
import Router from "./pages";
import "./i18n";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { SearchProvider } from "./context/SearchContext";
import Chatbot from "./pages/Chatbot";
function App() {
  const [searchResults, setSearchResults] = useState([]);
  console.log("API URL:", import.meta.env.VITE_API_URL);
  return (
    <SearchProvider>
      <Header onSearchResults={setSearchResults} />
      <Router searchResults={searchResults} />
      <Footer />
      <Chatbot />
      <ToastContainer position="top-right" autoClose={3000} />
    </SearchProvider>
  );
}

export default App;
