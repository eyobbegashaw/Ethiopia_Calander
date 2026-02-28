const mongoose = require('mongoose');

// Saint Schema
const SaintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    nameAmharic: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    descriptionAmharic: String,
    biography: String,
    biographyAmharic: String,
    miracles: [{
        title: String,
        description: String,
        date: Date
    }],
    // በ Calendar.js ውስጥ ያለውን እንዲህ ቀይረው፡
    category: [{
        type: String,
        enum: [
            'prophet', 
            'martyr', 
            'apostle', 
            'theotokos', 
            'virgin', 
            'monk', 
            'soldier',   // ይህ አሁን ያስፈለገህ ነው
            'confessor', // ይህ ለተክለ ሃይማኖት ሊያስፈልግህ ይችላል
            'patriarch',
            'angel'
        ]
    }],
    feastDay: {
        month: {
            type: Number,
            min: 1,
            max: 13,
            required: true
        },
        day: {
            type: Number,
            min: 1,
            max: 30,
            required: true
        }
    },
    additionalFeastDays: [{
        month: Number,
        day: Number,
        description: String
    }],
    patronage: [String],
    iconography: {
        symbols: [String],
        colors: [String],
        description: String
    },
    images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    relics: [{
        location: String,
        description: String
    }],
    traditions: [String],
    prayers: [{
        title: String,
        content: String,
        language: {
            type: String,
            enum: ['am', 'en'],
            default: 'am'
        }
    }],
    hymns: [{
        title: String,
        lyrics: String,
        audioUrl: String
    }],
    references: [{
        type: String,
        reference: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verified: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Reading Schema
const ReadingSchema = new mongoose.Schema({
    date: {
        month: {
            type: Number,
            min: 1,
            max: 13,
            required: true
        },
        day: {
            type: Number,
            min: 0,
            max: 30,
            required: true
        }
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    season: {
        type: String,
        enum: ['ordinary', 'advent', 'lent', 'easter', 'pentecost', 'fasting']
    },
    readings: [{
        title: String,
        titleAmharic: String,
        content: String,
        contentAmharic: String,
        reference: String,
        book: String,
        chapter: Number,
        verses: String,
        testament: {
            type: String,
            enum: ['old', 'new']
        },
        language: {
            type: String,
            enum: ['geez', 'amharic', 'english'],
            default: 'amharic'
        },
        commentary: String,
        commentaryAmharic: String,
        relatedReadings: [String]
    }],
    themes: [String],
    keywords: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Holiday Schema
const HolidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nameAmharic: String,
    type: {
        type: String,
        enum: ['fixed', 'movable'],
        required: true
    },
    category: {
        type: String,
        enum: ['major', 'minor', 'fast', 'saint', 'commemoration']
    },
    date: {
        month: {
            type: Number,
            min: 1,
            max: 13
        },
        day: {
            type: Number,
            min: 1,
            max: 30
        },
        isLeapYearAdjustment: Boolean
    },
    duration: {
        days: Number,
        description: String
    },
    description: String,
    descriptionAmharic: String,
    traditions: [{
        name: String,
        nameAmharic: String,
        description: String
    }],
    liturgicalColor: String,
    scriptures: [{
        book: String,
        chapter: String,
        verses: String
    }],
    foods: [{
        name: String,
        description: String,
        allowed: Boolean
    }],
    restrictions: [String],
    prayers: [{
        title: String,
        content: String
    }],
    hymns: [String],
    images: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create indexes
SaintSchema.index({ name: 'text', nameAmharic: 'text', description: 'text' });
SaintSchema.index({ 'feastDay.month': 1, 'feastDay.day': 1 });
SaintSchema.index({ category: 1 });

ReadingSchema.index({ 'date.month': 1, 'date.day': 1 });
ReadingSchema.index({ season: 1 });

HolidaySchema.index({ type: 1 });
HolidaySchema.index({ 'date.month': 1, 'date.day': 1 });
HolidaySchema.index({ category: 1 });

const Saint = mongoose.model('Saint', SaintSchema);
const Reading = mongoose.model('Reading', ReadingSchema);
const Holiday = mongoose.model('Holiday', HolidaySchema);

module.exports = { Saint, Reading, Holiday };