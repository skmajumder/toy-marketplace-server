const express = require("express");
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const categoriesCollection = database.collection("categories");

    app.get("/my-toys", async (req, res) => {
      const email = req.query.email;
      const sort = req.query.sort;
      const filter = { sellerEmail: email };
      let result;

      if (sort === "asc") {
        result = await toysCollection
          .find(filter)
          .sort({ price: 1 })
          .collation({
            locale: "en_US",
            numericOrdering: true,
          })
          .toArray();
      } else if (sort === "desc") {
        result = await toysCollection
          .find(filter)
          .sort({ price: -1 })
          .collation({
            locale: "en_US",
            numericOrdering: true,
          })
          .toArray();
      } else {
        // Default: Fetch toys without sorting
        result = await toysCollection
          .find(filter)
          .sort({ createdAt: -1 })
          .toArray();
      }
      res.send(result);
    });

    // Get All Toys (GET request)
    app.get("/all-toys", async (req, res) => {
      const result = await toysCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();
      res.send(result);
    });

    // Get toy by ID (GET request)
    app.get("/toy/:id", async (req, res) => {
      const toyID = req.params.id;
      const query = { _id: new ObjectId(toyID) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // Get Categories
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

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

    // Toy Update (PUT request)
    app.put("/update-toy/:id", async (req, res) => {
      const toyID = req.params.id;
      const updateToy = req.body;
      const filter = { _id: new ObjectId(toyID) };

      const updateDoc = {
        $set: {
          price: updateToy.price,
          availableQuantity: updateToy.availableQuantity,
          description: updateToy.description,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/delete-toy/:id", async (req, res) => {
      const toyID = req.params.id;
      const filter = { _id: new ObjectId(toyID) };
      const result = await toysCollection.deleteOne(filter);
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
  res.send(`Express server running at`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
