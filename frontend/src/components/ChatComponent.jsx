import React, { useEffect, useState } from "react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react"; // Update import statement

const ChatComponent = ({ sender, receiver }) => {
  const [newMessage, setNewMessage] = useState("");
  const [sentMessage, setSentMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chosenEmoji, setChosenEmoji] = useState(null); // State to hold selected emoji

  const handleEmojiClick = (emojiObject) => {
    setChosenEmoji(emojiObject);
    setNewMessage(prev=>(prev+emojiObject.emoji));
  };

  const handleSendMessage = async () => {
    let messageText = newMessage.trim();
    if (chosenEmoji) {
      messageText += chosenEmoji.emoji; // Append chosen emoji to the message
      setChosenEmoji(null); // Clear chosen emoji after sending
    }
    if (messageText !== "") {
      setSentMessage({ sender: sender, receiver: receiver, text: messageText });
      setNewMessage("");
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default behavior of new line on Enter
      handleSendMessage();
    }
  };
  useEffect(() => {
    const putData = async () => {
      if (sentMessage) {
        try {
          await axios.post("http://localhost:3000/api/v1/message", sentMessage);
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    };
    putData();
  }, [sentMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/message",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const data = response.data.messages;
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Fetch data initially
    fetchData();

    // Fetch data every 1 second
    const interval = setInterval(fetchData, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex-1 bg-gray-200 p-4" onKeyDown={handleKeyDown}>
      <div className="flex flex-col h-full">
        <div className="bg-gray-200 p-4 flex-grow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{receiver}</h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            {/* Chat messages will go here */}
            <div className="flex flex-col space-y-2">
              {messages.map((item, index) => {
                if (item.sender === sender && item.recipient === receiver) {
                  return (
                    <div
                      key={index}
                      className="bg-blue-500 text-white py-2 px-4 rounded-r-lg self-end max-w-md"
                    >
                      {item.content}
                    </div>
                  );
                } else if (
                  item.sender === receiver &&
                  item.recipient === sender
                ) {
                  return (
                    <div
                      key={index}
                      className="bg-gray-300 py-2 px-4 rounded-l-lg self-start max-w-md"
                    >
                      {item.content}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
        <div className="bg-gray-100 p-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="border border-gray-300 p-2 w-full rounded"
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
          />
          <EmojiPicker onEmojiClick={handleEmojiClick} />{" "}
          {/* Update component usage */}
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
