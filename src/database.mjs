import { MongoClient, ServerApiVersion } from "mongodb";

const DB_USER = "PLAdmin";
const DB_PASS = "rFP7L9cmIGORk23z";
const DB_NAME = "ProfitAndLostDB";

// MongoDB connection URI
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@profit-lost.dojlby3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient instance
const client = new MongoClient(DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Function to initiate connection with the database
async function run() {
  try {
    // Connect to the server (optional starting in version 4.7)
    await client.connect();
    console.log("Successfully connected to MongoDB");

    // Send a ping to confirm the connection (optional)
    const pingResult = await client.db("admin").command({ ping: 1 });
    console.log("Ping to MongoDB:", pingResult);
  } catch (error) {
    // Handle any error that occurs during the connection
    console.error("Error connecting to MongoDB:", error);
    // Try to close the client if there is an error
    try {
      await client.close();
    } catch (closeError) {
      console.error("Error closing the connection to MongoDB:", closeError);
    }
    throw error; // Rethrow the error to handle it further up
  }
}

// Export the client, run function, and DB_NAME
export { client, run, DB_NAME };
