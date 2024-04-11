import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// EXPRESS
const app = express();
app.use(cors({ origin: true }));

app.get("/goty", async (req, res) => {
  const gotyRef = db.collection("goty");
  const docSnap = await gotyRef.get();
  const juegos = docSnap.docs.map((doc) => doc.data());
  res.json(juegos);
});

app.post("/goty/:id", async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection("goty").doc(id);
  const gameSnap = await gameRef.get();

  if (!gameSnap.exists) {
    res.status(404).json({
      ok: false,
      mensaje: `No game found with such id ${id}`,
    });
  } else {
    const before = gameSnap.data() || { votes: 0 };
    await gameRef.update({
      votes: before.votes + 1,
    });
    res.json({
      ok: true,
      mensaje: `Thanks for voting to ${before.name}`,
    });
  }
});

export const api = onRequest(app);
