// Gemini API integration for emotion analysis and chatbot
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Analyze text for emotions
async function analyzeTextEmotion(text) {
    try {
        const prompt = `Analyze the following text for emotional content. 
        Identify the primary and secondary emotions from this list: happiness, sadness, anger, fear, surprise, disgust, calm, anxiety. 
        Also provide a sentiment score from -1 (very negative) to 1 (very positive). 
        Return the response in JSON format with these keys: primaryEmotion, secondaryEmotion, sentimentScore, keywords (array of emotional keywords).
        Text: "${text}"`;
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        // Parse the response (Gemini returns text, so we need to extract JSON)
        const responseText = data.candidates[0].content.parts[0].text;
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        const jsonString = responseText.substring(jsonStart, jsonEnd);
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error analyzing text with Gemini:', error);
        return {
            primaryEmotion: 'unknown',
            secondaryEmotion: 'unknown',
            sentimentScore: 0,
            keywords: []
        };
    }
}

// Analyze voice for emotions (would use audio processing first, then text analysis)
async function analyzeVoiceEmotion(audioBlob) {
    // In a real app, you would:
    // 1. Convert audio to text using speech-to-text API
    // 2. Analyze the text with Gemini
    // 3. Also analyze tone, pace, etc. from the audio
    
    // For demo purposes, we'll just simulate this
    return {
        primaryEmotion: 'calm',
        secondaryEmotion: 'happiness',
        sentimentScore: 0.7,
        keywords: ['relaxed', 'peaceful', 'content']
    };
}

// Chatbot response based on selected persona
async function getChatbotResponse(message, persona = 'therapist') {
    try {
        let prompt;
        
        switch(persona) {
            case 'friend':
                prompt = `Respond as a caring friend to the following message. Be empathetic, casual, and supportive. Offer kind words and ask thoughtful questions. Message: "${message}"`;
                break;
            case 'parent':
                prompt = `Respond as a nurturing parent to the following message. Be warm, wise, and reassuring. Offer guidance and unconditional support. Message: "${message}"`;
                break;
            case 'mentor':
                prompt = `Respond as a wise mentor to the following message. Be insightful, encouraging, and solution-focused. Offer practical advice and perspective. Message: "${message}"`;
                break;
            case 'therapist':
            default:
                prompt = `Respond as a professional therapist to the following message. Be empathetic, non-judgmental, and clinically appropriate. Use reflective listening and ask open-ended questions. Message: "${message}"`;
        }
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error getting chatbot response:', error);
        return "I'm having trouble understanding. Could you try rephrasing that?";
    }
}

// Generate personalized suggestions based on mood
async function getSuggestionsForMood(mood, category) {
    try {
        const prompt = `Provide 3 ${category} suggestions for someone feeling ${mood}. 
        For movies: include title, year, and brief reason it fits the mood. 
        For music: include title, artist, and brief reason. 
        For books: include title, author, and brief reason. 
        For quotes: include the quote and author. 
        For activities: include the activity and brief instructions. 
        Return in JSON format with an array of items, each with 'title', 'description', and 'reason' fields.`;
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        const jsonStart = responseText.indexOf('[');
        const jsonEnd = responseText.lastIndexOf(']') + 1;
        const jsonString = responseText.substring(jsonStart, jsonEnd);
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error getting suggestions:', error);
        return [];
    }
}

// Detect potential mental health risks from journal entries
async function detectMentalHealthRisks(userId) {
    try {
        // Get recent journal entries from Firestore
        const entries = await firebase.firestore().collection('users').doc(userId)
            .collection('journal')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        const entriesText = entries.docs.map(doc => doc.data().content).join('\n\n');
        
        const prompt = `Analyze the following journal entries for signs of mental health risks like depression, anxiety, burnout, or isolation. 
        Look for patterns in language, emotional tone, and content. 
        Return a JSON response with: 
        - riskLevel (none, mild, moderate, severe)
        - potentialConditions (array)
        - keyPatterns (array of concerning patterns)
        - recommendation (suggested actions)
        
        Journal Entries:
        ${entriesText}`;
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text;
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;
        const jsonString = responseText.substring(jsonStart, jsonEnd);
        
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error detecting mental health risks:', error);
        return {
            riskLevel: 'none',
            potentialConditions: [],
            keyPatterns: [],
            recommendation: 'No significant risks detected. Continue monitoring.'
        };
    }
}