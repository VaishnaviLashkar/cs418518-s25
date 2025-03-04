require('dotenv').config();
const express = require('express');
const cors = require("cors");
const connectDB = require('./config/db');
const routes = require('./routes')
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing in .env file');
}
connectDB();
app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
