const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const resourcesRouter = require('./src/routes/resources');
const adminRouter = require('./src/routes/admin');
const aiRouter = require('./src/routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, 'static')));

app.use('/api/resources', resourcesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HealthBridge server running on port ${PORT}`);
});
