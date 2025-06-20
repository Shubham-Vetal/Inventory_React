import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';

dotenv.config();

const app = express();


connectDB(); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/items', itemRoutes); 

app.get('/', (req, res) => {
    res.send('Item Management Backend API is running!'); 
});



export default app; 