import express from 'express';
import MeasurementService  from "./services/MeasurementService";
import dotenv from 'dotenv';
import path from "node:path";
import {imageHolder} from "./imageHolder";

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app = express();

app.use(express.json());

console.log(process.env.GEMINI_API_KEY)

app.post('/upload', (req, res) => MeasurementService.uploadMeasurementUrl(req, res, imageHolder, process.env.GEMINI_API_KEY))

app.get('/confirm', MeasurementService.confirmMeasurement)

app.get('/image/:id', (req, res) => {
    const id = req.params.id;
    const imageData = imageHolder[id];

    if (imageData && imageData.expiresAt > Date.now()) {
        const dataUrl = `data:image/png;base64,${imageData.base64}`;
        res.send(`<img src="${dataUrl}" alt="Image"/>`);
    } else {
        res.status(404).send('Image not found or expired');
    }
})

app.get('/:customer_code/list', MeasurementService.listMeasurementsByCustomer)

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
