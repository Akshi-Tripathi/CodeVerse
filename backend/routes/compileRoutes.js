const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/compile-the-code', async (req, res) => {
    const { source_code, language_id, stdin } = req.body;

    if (!source_code || !language_id) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log("Request received at /compile-the-code with data:", { source_code, language_id, stdin });

    try {
        const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
            source_code,
            language_id,
            stdin: stdin || '',
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                'X-RapidAPI-Key': '2de7061dd2msh6eb48271b284890p161251jsna13d1afb01b3' // Replace with a valid key
            }
        });

        console.log("Response from Judge0:", response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error communicating with Judge0:', error?.response?.data || error.message);

        // Handle specific errors
        if (error.response) {
            // API responded with an error
            res.status(error.response.status).json({
                success: false,
                message: error.response.data || 'Error from Judge0 API',
            });
        } else if (error.request) {
            // No response received
            res.status(500).json({
                success: false,
                message: 'No response from Judge0 API',
            });
        } else {
            // Other errors
            res.status(500).json({
                success: false,
                message: 'Unexpected error occurred',
                error: error.message,
            });
        }
    }
});

module.exports = router;
