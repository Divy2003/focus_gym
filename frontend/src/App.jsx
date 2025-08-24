import React from "react";
import HomePage from "./pages/HomePage";
import RegistrationForm from "./pages/Registration";
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from "react-router-dom";
function App() {
 

  return (
    <BrowserRouter>
   
     <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/registration" element={<RegistrationForm />} />
     </Routes>
   
    </BrowserRouter>
  )
}

export default App
