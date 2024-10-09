import './App.css';
import React, { useEffect, useState } from "react";

function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then(response => response.text())
      .then(data => setMessage(data));
  }, []);

  return (
    <div className="App">
      <h1>Here's the message: {message}</h1>
    </div>
  );
}

export default App;
