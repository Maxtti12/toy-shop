const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3000;
const connectionString = 'mongodb+srv://root:Abcd1234@toyshop.a4pjos5.mongodb.net/toyshop?retryWrites=true&w=majority';

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static("public"));

// Connect to the MongoDB cluster
MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db('toyshop');
    const toysCollection = db.collection('toys');

    // Define your API endpoints
    app.get('/', async (req, res) => {
      // Retrieve the list of toys from MongoDB
      const toys = await toysCollection.find().toArray();

      // Render the homepage template
      res.render('index', { title: 'My Toy Shop', toys });
    });

    app.get('/toys', async (req, res) => {
      // Retrieve the list of toys from MongoDB
      const toys = await toysCollection.find().toArray();

      // Render the toys template with the list of toys
      res.render('toys', { title: 'Toys', toys });
    });

app.get('/search', async (req, res) => {
  const query = req.query.q;
  const toys = await toysCollection.find({ name: { $regex: query, $options: 'i' } }).sort({ _id: -1 }).limit(3).toArray();
  res.render('toys', { title: 'Toys', toys });
});



    app.post('/addToys', async (req, res) => {
      // Get the toy data from the request body
      const { name, description, price, imageUrl } = req.body;

      // Insert the new toy into the MongoDB collection
      await toysCollection.insertOne({ name, description, price, imageUrl });

      // Redirect the user back to the toy list page
      res.redirect('/toys');
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => {
    console.log(`Error connecting to MongoDB: ${err}`);
  });
