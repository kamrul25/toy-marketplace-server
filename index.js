const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vylcgzn.mongodb.net/?retryWrites=true&w=majority`;

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
    //  await client.connect();

    const toyCollection = client.db("toyMarketplace").collection("allToy");

    const indexKeys = { toyName: 1 }; // Replace field1 with your actual field names
    const indexOptions = { name: "toyName" }; // Replace index_name with the desired index name
    // const result = await toyCollection.createIndex(indexKeys, indexOptions);
    toyCollection.createIndex(indexKeys, indexOptions);

    //for specified user and everyone
    app.get("/allToy", async (req, res) => {
      if (req.query?.email) {
        const email = req.query?.email;
        const query = { sellerEmail: email };
        const result = await toyCollection
          .find(query)
          .sort({ price: -1 })
          .toArray();
        res.json(result);
      }
       else {
        const result = await toyCollection.find().limit(20).toArray();
        res.json(result);
      }
    });

    // for sub-category
    app.get("/category/:subCategory", async (req, res) => {
      const subCategory = req.params.subCategory;
      const result = await toyCollection
        .find({ subCategory: subCategory })
        .toArray();
      res.json(result);
    });

    // for single data
    app.get("/allToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.json(result);
    });

    // get toy by text
    app.get("/getToyByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({ toyName: { $regex: text, $options: "i" }
          // $or: [{ toyName: { $regex: text, $options: "i" } }],
        })
        .toArray();
      res.json(result);
    });

    // create single data
    app.post("/allToy", async (req, res) => {
      const toy = req.body;
      const result = await toyCollection.insertOne(toy);
      res.json(result);
    });

    // update
    app.patch("/allToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateToy = req.body;
      const updateDoc = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          description: updateToy.description,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // delete single data
    app.delete("/allToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.json(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy MarketPlace Server is running");
});

app.listen(port, () => {
  console.log(`TOY MARKET PLACE SERVER is running on this port ${port}`);
});
