const express = require("express");
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsConfig));
app.use(express.json());

// MongoDB server URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wnk3oaq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("toysStoreDB");
    const toysCollection = database.collection("toys");

    const indexKeys = { name: 1 };
    const indexOptions = { name: "toyName" };
    const searchIndexToys = await toysCollection.createIndex(
      indexKeys,
      indexOptions
    );

    // Add Toys (POST request)
    app.post("/add-toy", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      toy.createdAt = new Date();
      if (!toy) {
        return res
          .status(401)
          .send({ error: true, message: "Unable to insert toy" });
      }
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`Express server running at ${port}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
