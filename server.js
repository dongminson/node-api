const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const os = require('os');
const cluster = require('cluster');
const rateLimit = require('express-rate-limit');
const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const auth = require('./routes/api/auth');
const friends = require('./routes/api/friends');


//npm run server
if (cluster.isMaster) {
  const cpuCount = os.cpus().length
  for (let i = 0; i < cpuCount; i++) {
      cluster.fork()
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

}
else {
    
  const app = express();

  app.enable('trust proxy')

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });

  app.use(limiter);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));


  // DB Config
  const db = require('./config/keys.js').mongoURI;

  // Connect to MongoDB

  mongoose
    .connect(db, {
        useNewUrlParser: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

  app.get('/', (req, res) => res.send('Hello World'));

  // Use Routes


  app.use('/api/users', users);
  app.use('/api/posts', posts);
  app.use('/api/auth', auth);
  app.use('/api/friends', friends);

  const port = process.env.PORT || 5000;

  app.listen(port, () => console.log(`Worker ${process.pid} started`));

}