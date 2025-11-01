server.js
import express from "express";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = "./seats.json";

const seats = [];
const rows = [
  ...Array.from({ length: 17 }, (_, i) => i + 1),
  ...Array.from({ length: 14 }, (_, i) => i + 25),
];
const letters = ["A", "B", "C", "D", "E", "F"];
rows.forEach(r => letters.forEach(l => seats.push(`${r}${l}`)));

function loadData() {
  if (!fs.existsSync(FILE)) return { assigned: {}, free: [...seats] };
  return JSON.parse(fs.readFileSync(FILE));
}
function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data));
}

app.get("/seat", (req, res) => {
  const user = req.query.user || "unbekannt";
  const data = loadData();

  if (data.assigned[user]) return res.send(data.assigned[user]);
  if (data.free.length === 0) return res.send("Leider sind alle Sitzplätze vergeben 😢");

  const randomIndex = Math.floor(Math.random() * data.free.length);
  const seat = data.free.splice(randomIndex, 1)[0];
  data.assigned[user] = seat;

  saveData(data);
  res.send(seat);
});

app.get("/reset", (req, res) => {
  const data = { assigned: {}, free: [...seats] };
  saveData(data);
  res.send("Alle Sitzplätze wurden zurückgesetzt ✈️");
});

app.get("/list", (req, res) => {
  const data = loadData();
  res.json(data.assigned);
});

app.listen(PORT, () => console.log(`Seat API läuft auf Port ${PORT}`));
