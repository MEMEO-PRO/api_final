const { MongoClient, ServerApiVersion } = require('mongodb');

// Connection URI and database configuration
const uri = "";
const dbName = 'AISPECS'; // Replace with your actual database name
const collectionName = 'Tasks'; // Replace with your actual collection name

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Function to convert time string to total seconds
function timeToSeconds(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(' ').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

async function run() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Perform a find operation on the collection
    const tasks = await collection.find({}).toArray();

    // Initialize total differences with all task types set to 0
    let totalDifferences = {
      'No Detections': 0,
      'Book': 0,
      'Instagram': 0
    };

    for (let i = 0; i < tasks.length - 1; i++) {
      const timeDiff = Math.abs(timeToSeconds(tasks[i].Time) - timeToSeconds(tasks[i + 1].Time));

      // Add the time difference to the current (previous) task
      if (tasks[i].Date === tasks[i + 1].Date) { // Check if tasks are on the same date
        const taskType = tasks[i].Task;
        totalDifferences[taskType] += timeDiff;
      }
    }

    // Output the total differences in JSON format
    console.log(JSON.stringify(totalDifferences, null, 2));
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
