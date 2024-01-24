import { createClient } from "@supabase/supabase-js";
import express from "express";
import cors from "cors";
const supabase = createClient("https://cflpaggmcjhktbzgflfp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbHBhZ2dtY2poa3RiemdmbGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIyNTQyNjcsImV4cCI6MjAxNzgzMDI2N30._7DII_jn9HVnqMMvwSIHZoDicExFG2MtiWCuzhupgYc");

const app = express();
const port = 3060;
app.use(cors());
app.use(express.json());

// Fetch all chat messages for a specific user
async function getChats(sender, receiver) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .or(`user1.eq.${sender},user2.eq.${sender}`)
    .or(`user1.eq.${receiver},user2.eq.${receiver}`)
    .order("created_at", { ascending: true });

  if (error) {
    console.log("query error", error);
    return [];
  } else {
    return data;
  }
}

// Insert a new chat message
async function insertChatMessage(insertData) {
  const { user1, user2, content } = insertData;

  const { data, error } = await supabase
    .from("chats")
    .insert({ user1, user2, content }).select();

  console.log("Data:", data);
  console.log("Error:", error);

  if (error) {
    console.log("insert error:", error.message);
    return null;
  } else {
    if (data !== null && data.length > 0) {
      return data[0];
    } else {
      console.log("No data returned after insert");
      return null;
    }
  }
}

// API endpoint to get all chats for a specific user
app.get("/chats/:sender/:receiver", cors(), async (req, res) => {
  console.log("Received request:", req.params); // Add this line for logging
  const chats = await getChats(req.params.sender, req.params.receiver);
  res.status(200).json(chats);
});

// API endpoint to send a new chat message
app.post("/chats", cors(), async (req, res) => {
  try {
    console.log("POST Received request:", req.body); // Add this line for logging
    const newMessage = await insertChatMessage(req.body);
    console.log("Response sent:", newMessage); // Add this line for logging
    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})