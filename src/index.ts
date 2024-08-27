import express from 'express';
import { AppDataSource } from './data-source';

const app = express();
app.use(express.json());

const PORT = 8080;
AppDataSource.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
