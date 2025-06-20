import Item from '../models/itemModel.js'; 
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const addItem = async (req, res) => {
    try {
        const { name, type, description } = req.body;

       
        const coverImage = req.files && req.files['coverImage'] && req.files['coverImage'][0]
                           ? req.files['coverImage'][0].path 
                           : '';
        const additionalImages = req.files && req.files['additionalImages']
                               ? req.files['additionalImages'].map(file => file.path) 
                               : [];

    
        if (!coverImage) {
            console.warn('coverImage URL is empty, Mongoose validation will likely fail.');
          
            return res.status(400).json({ message: 'Cover image upload failed or was missing.' });
        }



        const newItem = new Item({
            name,
            type,
            description,
            coverImage, 
            additionalImages
        });

        const savedItem = await newItem.save();

        res.status(201).json({ message: 'Item successfully added', item: savedItem });
    } catch (error) {
        console.error('Error adding item (caught by controller):', error);
       
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllItems = async (req, res) => {
    try {
        const items = await Item.find({}).sort({ dateAdded: -1 });
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Error fetching item by ID:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') { 
            return res.status(400).json({ message: 'Invalid Item ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const sendEnquiryEmail = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: `Enquiry for Item: ${item.name}`,
            html: `
                <p>Hello,</p>
                <p>An enquiry has been made for the following item:</p>
                <ul>
                    <li><strong>Item Name:</strong> ${item.name}</li>
                    <li><strong>Item Type:</strong> ${item.type}</li>
                    <li><strong>Description:</strong> ${item.description}</li>
                    <li><strong>Item ID:</strong> ${item._id}</li>
                </ul>
                <p>This is an automated email. Do not reply to this email. For further details, please contact the interested party directly.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Enquiry email sent successfully!' });
    } catch (error) {
        console.error('Error sending enquiry email:', error);
        if (error.code === 'EAUTH') {
            return res.status(500).json({ message: 'Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env', error: error.message });
        }
        if (error.responseCode) {
            return res.status(500).json({ message: `Email service error: ${error.responseCode} - ${error.response}`, error: error.message });
        }
        res.status(500).json({ message: 'Failed to send enquiry email', error: error.message });
    }
};