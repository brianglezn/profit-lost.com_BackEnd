import { MongoClient, ServerApiVersion } from "mongodb";

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@profit-lost.dojlby3.mongodb.net/?retryWrites=true&w=majority&ssl=true`;

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
    // Connect to the server
    await client.connect();
    console.log("Successfully connected to MongoDB");

    // Send a ping to confirm the connection
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
export { client, run, DB_NAME, DB_URI };
