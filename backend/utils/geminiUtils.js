const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiAPI {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }

        console.log("✅ Initializing Gemini API with model discovery");
        
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.availableModels = [];
        this.currentModel = null;
    }

    // Discover available models
    async discoverAvailableModels() {
        try {
            console.log("🔍 Discovering available Gemini models...");
            
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to list models: ${response.status}`);
            }

            const data = await response.json();
            
            // Filter for models that support generateContent
            const generateModels = data.models.filter(model => 
                model.supportedGenerationMethods && 
                model.supportedGenerationMethods.includes('generateContent')
            );
            
            this.availableModels = generateModels.map(m => m.name.replace('models/', ''));
            
            console.log("✅ Available models that support generateContent:");
            this.availableModels.forEach(model => console.log(`   - ${model}`));
            
            return this.availableModels;
            
        } catch (error) {
            console.error("❌ Failed to discover models:", error.message);
            // Fallback to discovered models from your log
            this.availableModels = [
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "gemini-2.0-flash",
                "gemini-2.0-flash-001",
                "gemini-2.0-flash-lite-001",
                "gemini-2.0-flash-lite",
                "gemini-2.5-flash-lite"
            ];
            console.log("⚠️ Using fallback model list");
            return this.availableModels;
        }
    }

    // Try each available model until one works
    async tryAllModels(prompt) {
        if (this.availableModels.length === 0) {
            await this.discoverAvailableModels();
        }

        const errors = [];
        
        for (const modelName of this.availableModels) {
            try {
                console.log(`🔄 Trying model: ${modelName}`);
                
                const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 0.8,
                        maxOutputTokens: 8192,
                    }
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                
                if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                    throw new Error('Unexpected response structure');
                }

                console.log(`✅ Successfully used model: ${modelName}`);
                this.currentModel = modelName;
                return data.candidates[0].content.parts[0].text;
                
            } catch (error) {
                console.log(`❌ Model ${modelName} failed:`, error.message);
                errors.push(`${modelName}: ${error.message}`);
            }
        }

        throw new Error(`All models failed. Errors: ${errors.join('; ')}`);
    }

    async generateQuiz(category, count = 15, difficulty = 'medium', context = {}) {
        console.log(`🎯 Generating ${count} ${difficulty} ${category} quiz questions using Gemini AI...`);
        
        const prompt = this.buildPrompt(category, count, difficulty, context);

        try {
            const textResponse = await this.tryAllModels(prompt);
            const questions = this.parseQuizResponse(textResponse, category, difficulty);
            
            if (!questions || questions.length === 0) {
                throw new Error('Failed to parse quiz questions from Gemini response');
            }
            
            console.log(`✅ Successfully generated ${questions.length} AI-powered questions using model: ${this.currentModel}`);
            return questions;
            
        } catch (error) {
            console.error('❌ Quiz generation error:', error);
            throw new Error(`Gemini AI generation failed: ${error.message}`);
        }
    }

    // Clean Amharic text that might contain special characters
    cleanAmharicText(text) {
        if (!text) return text;
        // Remove any non-printable characters but keep Amharic
        return text.replace(/[^\u1200-\u137F\s\.,!?()-]/g, '').trim();
    }

    // Ultra-aggressive JSON cleaning and repair
    cleanJsonText(text) {
        if (!text) return '';
        
        // Step 1: Remove markdown code blocks
        let cleaned = text.replace(/```json\s*/g, '');
        cleaned = cleaned.replace(/```\s*$/g, '');
        cleaned = cleaned.replace(/`/g, '');
        
        // Step 2: Find the first [ and last ]
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        
        if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
            return '';
        }
        
        // Extract the JSON array
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        
        // Step 3: Fix common JSON errors
        // Remove trailing commas before } or ]
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
        
        // Add quotes to unquoted keys (but careful with Amharic text)
        cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
        
        // Fix line breaks in strings
        cleaned = cleaned.replace(/\n/g, ' ');
        
        // Remove multiple spaces
        cleaned = cleaned.replace(/\s+/g, ' ');
        
        // Escape any remaining problematic characters
        cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
        
        return cleaned;
    }

    // Try multiple parsing strategies with increasing aggression
    tryParseJson(text) {
        const errors = [];
        
        // Strategy 1: Try the original text
        try {
            return JSON.parse(text);
        } catch (e) {
            errors.push(`Original parse failed: ${e.message}`);
        }
        
        // Strategy 2: Aggressive cleaning
        try {
            const cleaned = this.cleanJsonText(text);
            if (cleaned) {
                return JSON.parse(cleaned);
            }
        } catch (e) {
            errors.push(`Aggressive clean failed: ${e.message}`);
        }
        
        // Strategy 3: Try to extract with regex (more flexible)
        try {
            // Match array of objects - be more lenient with the pattern
            const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
            if (arrayMatch) {
                // Clean the matched string
                const matched = arrayMatch[0];
                const cleaned = this.cleanJsonText(matched);
                return JSON.parse(cleaned);
            }
        } catch (e) {
            errors.push(`Regex extract failed: ${e.message}`);
        }
        
        // Strategy 4: Manual reconstruction with error correction
        try {
            // Try to build JSON manually, fixing common issues
            let jsonStr = text;
            
            // Remove everything before the first {
            const firstBrace = jsonStr.indexOf('{');
            if (firstBrace > 0) {
                jsonStr = jsonStr.substring(firstBrace - 1); // Include the [ if present
            }
            
            // Find the last }
            const lastBrace = jsonStr.lastIndexOf('}');
            if (lastBrace > 0) {
                jsonStr = jsonStr.substring(0, lastBrace + 1);
            }
            
            // Ensure we have an array wrapper
            if (!jsonStr.trim().startsWith('[')) {
                jsonStr = '[' + jsonStr + ']';
            }
            
            // Try to parse with more aggressive cleaning
            const cleaned = this.cleanJsonText(jsonStr);
            return JSON.parse(cleaned);
        } catch (e) {
            errors.push(`Reconstruction failed: ${e.message}`);
        }
        
        throw new Error(`All parsing strategies failed. Errors: ${errors.join('; ')}`);
    }

    parseQuizResponse(text, category, difficulty) {
        try {
            if (!text) {
                throw new Error('Empty response from Gemini API');
            }
            
            console.log('Raw response preview (first 200 chars):', text.substring(0, 200) + '...');
            
            // Parse JSON using enhanced method
            let questions = this.tryParseJson(text);
            
            // Validate that we got an array
            if (!Array.isArray(questions)) {
                if (typeof questions === 'object' && questions !== null) {
                    questions = [questions];
                } else {
                    throw new Error('Gemini response is not an array or object');
                }
            }
            
            // Format questions (all in Amharic)
            const formattedQuestions = questions.map((q, index) => {
                // Clean the question text
                const questionText = this.cleanAmharicText(q.question || `ጥያቄ ${index + 1}`);
                
                // Ensure options are properly formatted and clean them
                const options = Array.isArray(q.options) ? q.options.map(opt => {
                    if (typeof opt === 'string') {
                        // Remove prefixes like "ሀ)", "ለ)", etc.
                        let cleanText = opt.replace(/^[ሀ-ፐ][\)\.]\s*/, ''); // Remove Amharic letter prefixes
                        cleanText = cleanText.replace(/^[a-zA-Z][\)\.]\s*/, ''); // Remove English letter prefixes
                        cleanText = this.cleanAmharicText(cleanText);
                        return { text: cleanText || 'አማራጭ' };
                    }
                    
                    let cleanText = opt.text || '';
                    cleanText = cleanText.replace(/^[ሀ-ፐ][\)\.]\s*/, '');
                    cleanText = cleanText.replace(/^[a-zA-Z][\)\.]\s*/, '');
                    cleanText = this.cleanAmharicText(cleanText);
                    
                    return {
                        text: cleanText || `አማራጭ ${index + 1}`
                    };
                }) : [];
                
                // Ensure we have exactly 4 options
                while (options.length < 4) {
                    options.push({ text: `አማራጭ ${options.length + 1}` });
                }
                
                // Clean explanation
                const explanation = this.cleanAmharicText(q.explanation || 'ማብራሪያ የለም');
                
                return {
                    question: questionText,
                    options: options.slice(0, 4),
                    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                    explanation: explanation,
                    category: category,
                    difficulty: difficulty,
                    source: 'gemini',
                    createdAt: new Date()
                };
            });
            
            console.log(`✅ Successfully parsed ${formattedQuestions.length} questions`);
            return formattedQuestions;
            
        } catch (error) {
            console.error('Error parsing quiz response:', error);
            console.error('Problematic text (first 500 chars):', text?.substring(0, 500));
            throw error;
        }
    }

    buildPrompt(category, count, difficulty, context) {
        const { month, day, saint } = context;
        
        // Base prompt structure - requesting Amharic only with strict JSON format
        const basePrompt = `እባክዎን ${count} የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ${category} ጥያቄዎችን በአማርኛ ቋንቋ ብቻ ያመንጩ።

መስፈርቶች:
- ጥያቄዎቹ ${difficulty} ደረጃ መሆን አለባቸው
- እያንዳንዱ ጥያቄ 4 አማራጮች ሊኖሩት ይገባል
- አንድ ትክክለኛ መልስ ብቻ ይኑር
- ለትክክለኛው መልስ ማብራሪያ ይስጡ

አስፈላጊ መመሪያዎች:
- አማራጮችን በሚዘረዝሩበት ጊዜ እንደ "ሀ)", "ለ)", "ሐ)", "መ)" ወይም "A)", "B)", "C)", "D)" ያሉ ቅድመ ቅጥያዎችን አይጠቀሙ።
- አማራጮችን በቀላል ጽሑፍ ብቻ ይጻፉ።
- JSON ብቻ ይመልሱ፣ ሌላ ምንም ተጨማሪ ጽሑፍ አያስፈልግም።
- ማርክዳውን አይጠቀሙ።

መልሱን በዚህ ትክክለኛ መዋቅር በJSON ድርድር መልሱ፡

[
  {
    "question": "ጥያቄው በአማርኛ",
    "options": [
      {"text": "አማራጭ 1"},
      {"text": "አማራጭ 2"},
      {"text": "አማራጭ 3"},
      {"text": "አማራጭ 4"}
    ],
    "correctAnswer": 0,
    "explanation": "የትክክለኛው መልስ ማብራሪያ በአማርኛ"
  }
]`;

        // Add category-specific context
        switch(category) {
            case 'synaxarium':
                return basePrompt + `

ተጨማሪ መረጃ ለሲናክሳሪየም:
- ስለ ኢትዮጵያ ኦርቶዶክስ ቅዱሳን እና የእረፍት ቀናቸው ይጠይቁ
- ስለ ቅዱሳን ተአምራት እና ሕይወት ይጠይቁ
${month ? `- አሁን ያለው ወር: ${month}` : ''}
${day ? `- አሁን ያለው ቀን: ${day}` : ''}
${saint ? `- ስለ ቅዱስ ${saint} በተለይ ይጠይቁ` : ''}`;
                
            case 'gizae':
                return basePrompt + `

ተጨማሪ መረጃ ለግጻዊ:
- ስለ መጽሐፍ ቅዱስ ንባቦች ይጠይቁ
- ስለ ብሉይ እና ሐዲስ ኪዳን ምንባቦች ይጠይቁ
- የተለየ ምዕራፍ እና ቁጥር ይጥቀሱ`;
                
            case 'holidays':
                return basePrompt + `

ተጨማሪ መረጃ ለበዓላት:
- ስለ ዋና ዋና በዓላት (ገና, ጥምቀት, ፋሲካ, መስቀል) ይጠይቁ
- ስለ ጾም ወቅቶች እና ልማዶች ይጠይቁ
- ስለ ተንቀሳቃሽ እና ቋሚ በዓላት ይጠይቁ`;
                
            case 'bible':
                return basePrompt + `

ተጨማሪ መረጃ ለመጽሐፍ ቅዱስ:
- ስለ ብሉይ እና ሐዲስ ኪዳን ክስተቶች ይጠይቁ
- ስለ መጽሐፍ ቅዱስ ገጸ ባሕርያት ይጠይቁ
- የኢትዮጵያ ኦርቶዶክስ አተረጓጎም ይጠቀሱ`;
                
            default:
                return basePrompt;
        }
    }
}

module.exports = new GeminiAPI();