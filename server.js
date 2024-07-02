const express = require('express');
const bodyParser = require('body-parser');
const htmlPdf = require('html-pdf-node');
const jwt = require('jsonwebtoken');

const app = express();
const PORT =  3000 || process.env.PORT;
const API_SECRET = 'abhi1234';

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware to verify API token
const verifyToken = (req, res, next) => {
    token = req.headers['authorization'];
    console.log(token);
    if (!token) {
        console.log('sdfdf');
        return res.status(403).send('A token is required for authentication');
    }

   
  
    try {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length); // Remove "Bearer " from the token
        }
        
        const decoded = jwt.verify(token, API_SECRET);
        req.user = decoded;
        
    } catch (err) {
        console.log('Token verification failed:', err); // Log any verification error
        return res.status(401).send('Invalid Token');
    }
    return next();
};

// Route to convert HTML and CSS to PDF
app.post('/convert', verifyToken, async (req, res) => {
    const { html, css } = req.body;
    if (!html || !css) {
        return res.status(400).send('HTML and CSS code are required');
    }

    const options = { format: 'A4' };
    const file = { content: `<style>${css}</style>${html}` };

    try {
        const pdfBuffer = await htmlPdf.generatePdf(file, options);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="converted.pdf"');
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).send('Error generating PDF');
    }
});


//get token to use the converter
app.get('/getToken', async(req, res) => {
    try{
            const token = jwt.sign({ user_id: 1 }, API_SECRET, { expiresIn: '2 days' });
        res.send(token);
    }catch(err){
        res.status(500).send("Error getting token");
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on Port :  ${PORT}`);
});