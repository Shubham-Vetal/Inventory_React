import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    additionalImages: [
        {
            type: String
        }
    ],
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

const Item = mongoose.model('Item', itemSchema);

export default Item; 