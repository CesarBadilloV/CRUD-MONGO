const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Show = require("./models/Show");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


mongoose.connect("mongodb://localhost:27017/tvshows_5A", {
  maxPoolSize: 10,                
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 30000          
})
.then(() => {
  console.log('✅ Conexión a MongoDB establecida');
  console.log(`📚 Base de datos: ${mongoose.connection.name}`);
  console.log(`🛠  Host: ${mongoose.connection.host}`);
})
.catch(err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  process.exit(1); 
});


// Endpoints CRUD
app.get("/api/shows", async (req, res) => {
  const shows = await Show.find();
  res.json(shows);
});

app.post("/api/shows", async (req, res) => {
  const newShow = new Show(req.body);
  const saved = await newShow.save();
  res.json(saved);
});

app.put("/api/shows/:id", async (req, res) => {
  const updated = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/api/shows/:id", async (req, res) => {
  await Show.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
