import "./App.css";
import { useEffect, useState } from "react";
import Axios from "axios";

function App() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [passwordList, setPasswordList] = useState([]);

  // Add a new password
  const addPassword = () => {
    if (!title || !password) {
      setMessage("Both title and password are required.");
      return;
    }

    Axios.post("http://localhost:4000/addpassword", {
      title: title,
      password: password,
    })
      .then(() => {
        setMessage("Password added successfully!");
        setTitle("");
        setPassword("");
        fetchPasswords();
      })
      .catch((error) => {
        console.error("Error adding password:", error);
        setMessage("Failed to add password. Please try again.");
      });
  };

  // Fetch passwords from the backend
  const fetchPasswords = () => {
    Axios.get("http://localhost:4000/showpasswords")
      .then((response) => {
        setPasswordList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching passwords:", error);
        setMessage("Failed to fetch passwords. Please try again.");
      });
  };

  // Decrypt a password
  const decryptPassword = (encryption) => {
    Axios.post("http://localhost:4000/decryptpassword", {
      password: encryption.password,
      iv: encryption.iv,
    })
      .then((response) => {
        setPasswordList(
          passwordList.map((val) => {
            return val.id === encryption.id
              ? { ...val, title: response.data }
              : val;
          })
        );
      })
      .catch((error) => {
        console.error("Error decrypting password:", error);
        setMessage("Failed to decrypt password. Please try again.");
      });
  };

  // Fetch passwords on component mount
  useEffect(() => {
    fetchPasswords();
  }, []);

  return (
    <div className="App">
      <div>
        <h1>Password Manager</h1>
      </div>
      <div className="AddingPassword">
        <input
          type="text"
          placeholder="Title (e.g., Facebook)"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Your Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button onClick={addPassword}>Add Password</button>
        <p>{message}</p>
      </div>
      <div className="Passwords">
        {passwordList.map((val) => (
          <div
            className="password"
            onClick={() =>
              decryptPassword({
                password: val.password,
                iv: val.iv,
              })
            }
            key={val.title}
          >
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
