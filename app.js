import express from "express";
import bodyParser from "body-parser";
import Replicate from "replicate";
import multer from "multer";



const app = express();
const port = 3000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
const REPLICATE_API_TOKEN = "r8_N4uvBPBn7DTisiT8pzTIsM8x330FOOv3pYxHY";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const replicate = new Replicate({
    auth: REPLICATE_API_TOKEN,
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/main', (req, res) => {

    res.render('main.ejs', );
})

app.post('/main', upload.single('img'), async (req, res) => {
    const result = req.body;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const uploadedFile = {
        dataURL: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
    };

    try {
        const output = await replicate.run(
            "jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
            {
                input: {
                    eta: 0,
                    image: uploadedFile.dataURL,
                    scale: 9,
                    prompt: `style: ${result.style}, color:${result.color}, type:${result.type}`,
                    a_prompt: result.prompt,
                    n_prompt: result.nprompt,
                    ddim_steps: 20,
                    num_samples: "1",
                    value_threshold: 0.1,
                    image_resolution: "768",
                    detect_resolution: 512,
                    distance_threshold: 0.1
                }
            }
        );
        console.log(output);
        res.render('main.ejs', { output: output[1] });

    } catch (error) {
        console.log(error);
    }

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})