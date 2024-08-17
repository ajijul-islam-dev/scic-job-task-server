const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
var bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://product-searching-85f3a.web.app",
      "http://localhost:5173",
    ],
  })
);
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

const db = client.db("procuct-searching");

const productsCollection = db.collection("products");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // server test api
    app.get("/", async (req, res) => {
      res.json({
        message: "Server Is Connected",
      });
    });

    // bulk api for add products
    app.post("/products", async (req, res) => {
      const products = await req.body;
      const result = await productsCollection.insertMany(products);
      res.json({
        message: "data inserted",
        success: true,
        data: result,
      });
    });

    // get categories
    app.get("/categories", async (req, res) => {
      const result = await productsCollection.distinct("category");
      res.json({
        success: true, 
        data: result,
      });
    });

    app.get("/products", async (req, res) => {
      const { brandName, minPrice, maxPrice, sortBy, categoryName } = req.query;
      const query = {};

      // Case-insensitive search for brandName
      if (brandName) {
        query.name = { $regex: new RegExp(brandName, "i") }; 
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Filter by category name
      if (categoryName) {
        query.category = categoryName;
      }

      try {
        let cursor = productsCollection.find(query);

        // Apply sorting if sortBy is provided
        if (sortBy) {
          const sortOption = {};
          sortOption[sortBy] = -1;
          cursor = cursor.sort(sortOption);
        }

        const result = await cursor.toArray();
        res.send({ data: result });
      } catch (error) {
        res.status(500).json({ error: "An error occurred" });
      }
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

app.listen(port, () => {
  console.log("server is Running On PORT", port);
});
