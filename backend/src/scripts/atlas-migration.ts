import { MongoClient } from "mongodb";
const sourceUri = "";
const targetUri = "";

const migrate = async () => {

  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    console.log("Connecting to source and target databases...");
    await sourceClient.connect();
    console.log("sourceClient connected");
    await targetClient.connect();
    console.log("targetClient connected");



    const sourceDb = sourceClient.db("diet");
    const targetDb = targetClient.db("diet");

    console.log("Fetching collections from source database...");
    const collections = await sourceDb.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);
      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      const totalDocuments = await sourceCollection.countDocuments();
      console.log(`Total documents in "${collectionName}": ${totalDocuments}`);

      let processedCount = 0;
      const failedDocuments: any[] = [];

      const cursor = sourceCollection.find();
      while (await cursor.hasNext()) {
        try {
          const document = await cursor.next();
          await targetCollection.insertOne(document);
          processedCount++;

          if (processedCount % 100 === 0 || processedCount === totalDocuments) {
            console.log(`Processed ${processedCount}/${totalDocuments} documents in ${collectionName}`);
          }
        } catch (docError) {
          console.error(`Error migrating document in ${collectionName}:`, docError);
          failedDocuments.push(docError);
        }
      }

      if (failedDocuments.length > 0) {
        console.warn(`Failed to migrate ${failedDocuments.length} documents in ${collectionName}. Logging errors...`);
        for (const error of failedDocuments) {
          console.error("Failed document error:", error);
        }
      }

      console.log(`Completed migration of collection: ${collectionName}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    console.log("Closing database connections...");
    await sourceClient.close();
    await targetClient.close();
    console.log("Database connections closed.");
  }
};

migrate();