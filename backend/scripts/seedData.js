const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Saint, Reading, Holiday } = require('../models/Calendar');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const bcrypt = require('bcryptjs');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Connected to MongoDB');
        
        // Clear existing data
        await User.deleteMany({});
        await Saint.deleteMany({});
        await Reading.deleteMany({});
        await Holiday.deleteMany({});
        await Quiz.deleteMany({});
        
        console.log('Cleared existing data');

        // Create admin user
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@ethiopiancalendar.com',
            password: 'Admin123',
            role: 'admin',
            emailVerified: true
        });

        console.log('Created admin user');

        // Sample saints data
        const saintsData = [
            {
                name: 'John the Baptist',
                nameAmharic: 'ዮሐንስ መጥምቅ',
                description: 'The Forerunner and Baptizer of Jesus Christ',
                descriptionAmharic: 'የኢየሱስ ክርስቶስ መጥምቅ እና መሐይም',
                category: ['prophet', 'martyr'],
                feastDay: { month: 1, day: 1 },
                biography: 'John the Baptist was a Jewish preacher and ascetic...',
                miracles: [
                    {
                        title: 'Baptism of Jesus',
                        description: 'When Jesus was baptized, the heavens opened and the Spirit descended like a dove.'
                    }
                ],
                iconography: {
                    symbols: ['lamb', 'cross', 'baptismal shell'],
                    colors: ['brown', 'white']
                }
            },
            {
                name: 'St. Virgin Mary',
                nameAmharic: 'ቅድስት ድንግል ማርያም',
                description: 'The Theotokos and Mother of God',
                descriptionAmharic: 'የቅድስት ድንግል ማርያም ልደት በዓል',
                category: ['prophet', 'martyr'], // ወይም ሞዴሉ ላይ የተፈቀዱትን ሌሎች ቃላት ተጠቀም
                feastDay: { month: 1, day: 5 },
                biography: 'The Virgin Mary, mother of Jesus Christ, is the most venerated saint in Ethiopian Orthodox tradition.',
                patronage: ['Ethiopia', 'mothers', 'children']
            },
            {
                name: 'St. George',
                nameAmharic: 'ቅዱስ ጊዮርጊስ',
                description: 'Great Martyr and Patron Saint of Ethiopia',
                descriptionAmharic: 'ታላቁ ሰማዕት እና የኢትዮጵያ ረዳት ቅዱስ',
                category: ['martyr', 'soldier'],
                feastDay: { month: 7, day: 23 },
                miracles: [
                    {
                        title: 'Slaying of the Dragon',
                        description: 'St. George saved a princess by slaying a dragon and converting the city to Christianity.'
                    }
                ]
            },
            {
                name: 'St. Tekle Haimanot',
                nameAmharic: 'ቅዱስ ተክለ ሃይማኖት',
                description: 'Ethiopian saint who prayed for 27 years on one leg',
                descriptionAmharic: 'ለ27 ዓመታት በአንድ እግሩ ቆሞ የጸለየ የኢትዮጵያ ቅዱስ',
                category: ['monk', 'confessor'],
                feastDay: { month: 12, day: 12 },
                biography: 'St. Tekle Haimanot founded the Debre Libanos monastery and was instrumental in the spread of Christianity in Ethiopia.'
            }
        ];

        await Saint.insertMany(saintsData);
        console.log('Seeded saints data');

        // Sample readings data
        const readingsData = [
            {
                date: { month: 1, day: 1 },
                season: 'ordinary',
                readings: [
                    {
                        title: 'First Reading',
                        titleAmharic: 'የመጀመሪያ ንባብ',
                        content: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
                        contentAmharic: 'በመጀመሪያ ቃል ነበረ፥ ቃልም ከእግዚአብሔር ጋር ነበረ፥ እግዚአብሔርም ቃል ነበረ።',
                        reference: 'John 1:1',
                        book: 'John',
                        chapter: 1,
                        verses: '1',
                        testament: 'new'
                    },
                    {
                        title: 'Second Reading',
                        titleAmharic: 'የሁለተኛ ንባብ',
                        content: 'And the Word became flesh and dwelt among us.',
                        contentAmharic: 'ቃልም ሥጋ ሆነ፥ በእኛም ዘንድ አደረ።',
                        reference: 'John 1:14',
                        book: 'John',
                        chapter: 1,
                        verses: '14',
                        testament: 'new'
                    }
                ],
                themes: ['incarnation', 'word of god'],
                keywords: ['logos', 'creation', 'light']
            },
            {
                date: { month: 1, day: 5 },
                season: 'ordinary',
                readings: [
                    {
                        title: 'Reading for the day',
                        titleAmharic: 'የዕለቱ ንባብ',
                        content: 'Hail, full of grace, the Lord is with you.',
                        contentAmharic: 'ሰላም ለኪ ሙላት ጸጋ፤ እግዚአብሔር ከአንቺ ጋር ነው።',
                        reference: 'Luke 1:28',
                        book: 'Luke',
                        chapter: 1,
                        verses: '28',
                        testament: 'new'
                    }
                ]
            }
        ];

        await Reading.insertMany(readingsData);
        console.log('Seeded readings data');

        // Sample holidays data
        const holidaysData = [
            {
                name: 'New Year',
                nameAmharic: 'አዲስ አመት',
                type: 'fixed',
                category: 'major',
                date: { month: 1, day: 1 },
                description: 'Ethiopian New Year celebration',
                descriptionAmharic: 'የኢትዮጵያ አዲስ አመት በዓል',
                traditions: [
                    {
                        name: 'Gift Giving',
                        description: 'Families exchange gifts and share meals'
                    }
                ],
                liturgicalColor: 'gold',
                foods: [
                    {
                        name: 'Doro Wat',
                        description: 'Spicy chicken stew',
                        allowed: true
                    }
                ]
            },
            {
                name: 'Finding of True Cross',
                nameAmharic: 'መስቀል',
                type: 'fixed',
                category: 'major',
                date: { month: 1, day: 17 },
                description: 'Feast of the Finding of the True Cross',
                descriptionAmharic: 'የቅዱስ እልፍ አድባር መስቀል መገኘት በዓል',
                traditions: [
                    {
                        name: 'Demera',
                        description: 'Bonfire celebration'
                    }
                ],
                liturgicalColor: 'red',
                scriptures: [
                    {
                        book: 'Matthew',
                        chapter: '27',
                        verses: '32-35'
                    }
                ]
            },
            {
                name: 'Christmas',
                nameAmharic: 'ገና',
                type: 'fixed',
                category: 'major',
                date: { month: 4, day: 29 },
                description: 'Birth of Jesus Christ',
                descriptionAmharic: 'የጌታችን ኢየሱስ ክርስቶስ ልደት',
                duration: {
                    days: 1,
                    description: 'Celebrated on Tahsas 29'
                },
                liturgicalColor: 'white',
                foods: [
                    {
                        name: 'Doro Wat',
                        description: 'Traditional chicken stew',
                        allowed: true
                    }
                ]
            },
            {
                name: 'Epiphany',
                nameAmharic: 'ጥምቀት',
                type: 'fixed',
                category: 'major',
                date: { month: 5, day: 11 },
                description: 'Baptism of Jesus Christ',
                descriptionAmharic: 'የጌታችን ኢየሱስ ክርስቶስ ጥምቀት',
                liturgicalColor: 'blue',
                traditions: [
                    {
                        name: 'Blessing of Water',
                        description: 'Ceremonial blessing of water sources'
                    }
                ]
            }
        ];

        await Holiday.insertMany(holidaysData);
        console.log('Seeded holidays data');

        // Sample quizzes
        const quizzesData = [
            {
                question: 'Who is the patron saint of Ethiopia?',
                questionAmharic: 'የኢትዮጵያ ረዳት ቅዱስ ማን ነው?',
                options: [
                    { text: 'St. George', textAmharic: 'ቅዱስ ጊዮርጊስ', isCorrect: true },
                    { text: 'St. Mary', textAmharic: 'ቅድስት ማርያም', isCorrect: false },
                    { text: 'St. Michael', textAmharic: 'ቅዱስ ሚካኤል', isCorrect: false },
                    { text: 'St. Tekle Haimanot', textAmharic: 'ቅዱስ ተክለ ሃይማኖት', isCorrect: false }
                ],
                category: 'synaxarium',
                difficulty: 'easy',
                explanation: 'St. George is widely venerated as the patron saint of Ethiopia.',
                explanationAmharic: 'ቅዱስ ጊዮርጊስ የኢትዮጵያ ረዳት ቅዱስ ተብሎ ይከበራል።',
                createdBy: adminUser._id
            },
            {
                question: 'Which Gospel begins with "In the beginning was the Word"?',
                questionAmharic: 'የትኛው ወንጌል "በመጀመሪያ ቃል ነበረ" በሚለው ይጀምራል?',
                options: [
                    { text: 'Matthew', textAmharic: 'ማቴዎስ', isCorrect: false },
                    { text: 'Mark', textAmharic: 'ማርቆስ', isCorrect: false },
                    { text: 'Luke', textAmharic: 'ሉቃስ', isCorrect: false },
                    { text: 'John', textAmharic: 'ዮሐንስ', isCorrect: true }
                ],
                category: 'gizae',
                difficulty: 'easy',
                explanation: 'The Gospel of John begins with this profound theological statement.',
                createdBy: adminUser._id
            },
            {
                question: 'When is Ethiopian Christmas (Genna) celebrated?',
                questionAmharic: 'የኢትዮጵያ ገና መቼ ነው የሚከበረው?',
                options: [
                    { text: 'December 25', textAmharic: 'ታህሳስ 25', isCorrect: false },
                    { text: 'January 7', textAmharic: 'ጥር 7', isCorrect: true },
                    { text: 'January 19', textAmharic: 'ጥር 19', isCorrect: false },
                    { text: 'February 2', textAmharic: 'የካቲት 2', isCorrect: false }
                ],
                category: 'holidays',
                difficulty: 'easy',
                explanation: 'Ethiopian Christmas is celebrated on January 7 (Tahsas 29).',
                createdBy: adminUser._id
            }
        ];

        await Quiz.insertMany(quizzesData);
        console.log('Seeded quizzes data');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();