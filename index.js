import { createClient } from "@supabase/supabase-js";
import  express  from "express";
import cors from "cors";
const supabase = createClient("https://dgmvlwyaxmqsoixhuaoz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbXZsd3lheG1xc29peGh1YW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUwNjIxOTYsImV4cCI6MjAyMDYzODE5Nn0.bsQfkT84K2_Qjcqe8C4J6RKkvHy1BY1Rpd1jZSNgy4Q");

const app = express();
const port = 3020;
app.use(cors());
app.use(express.json());

// Fetch all chat messages for a specific user
async function getChats(userId) {
  const { data, error } = await supabase
  .from("chats")
  .select("*")
  .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
  .order("created_at", { ascending: false });

  if (error) {
    console.log("query error", error);
    return [];
  } else {
    return data;
  }
}

// Insert a new chat message
async function insertChatMessage(user1Id, user2Id, message) {
  const { data, error } = await supabase
    .from("chats")
    .insert([
      {
        user_id_1: String(BigInt(user1Id)),
        user_id_2: String(BigInt(user2Id)),
        message: message,
        created_at: new Date().toISOString(),
      },
    ]);

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
app.get("/getChats/:userId", cors(), async (req, res) => {
  const userId = req.params.userId;
  const chats = await getChats(userId);
  res.json(chats);
});

// API endpoint to send a new chat message
app.post("/sendMessage", cors(), async (req, res) => {
  try {
    console.log("Received request:", req.body); // Add this line for logging
    const { user1Id, user2Id, message } = req.body;
    const newMessage = await insertChatMessage(user1Id, user2Id, message);
    console.log("Response sent:", newMessage); // Add this line for logging
    res.json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})