// Journal functionality
function initJournal() {
    // DOM elements
    const entryText = document.getElementById('entry-text');
    const analyzeBtn = document.getElementById('analyze-btn');
    const saveEntryBtn = document.getElementById('save-entry-btn');
    const recordBtn = document.getElementById('record-btn');
    const recordingTime = document.getElementById('recording-time');
    const recordedAudio = document.getElementById('recorded-audio');
    
    let mediaRecorder;
    let audioChunks = [];
    let recordingInterval;
    let seconds = 0;
    
    // Event listeners
    entryText.addEventListener('input', () => {
        saveEntryBtn.disabled = entryText.value.trim() === '';
    });
    
    analyzeBtn.addEventListener('click', analyzeEntry);
    saveEntryBtn.addEventListener('click', saveEntry);
    
    // Voice recording
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        recordBtn.addEventListener('click', toggleRecording);
    } else {
        recordBtn.disabled = true;
        recordBtn.title = 'Audio recording not supported in your browser';
    }
    
    // Functions
    async function analyzeEntry() {
        const text = entryText.value.trim();
        if (!text) {
            alert('Please enter some text to analyze');
            return;
        }
        
        showLoading(true);
        
        try {
            const analysis = await analyzeTextEmotion(text);
            displayAnalysisResults(analysis);
            
            // Enable save button
            saveEntryBtn.disabled = false;
            
            // Update UI theme based on primary emotion
            updateThemeBasedOnEmotion(analysis.primaryEmotion);
            
            // Update current mood in dashboard
            updateCurrentMood(analysis.primaryEmotion, analysis.sentimentScore);
            
        } catch (error) {
            console.error('Error analyzing entry:', error);
            alert('Failed to analyze entry. Please try again.');
        } finally {
            showLoading(false);
        }
    }
    
    function displayAnalysisResults(analysis) {
        document.getElementById('primary-emotion').textContent = analysis.primaryEmotion;
        document.getElementById('secondary-emotion').textContent = analysis.secondaryEmotion;
        document.getElementById('sentiment-score').textContent = analysis.sentimentScore.toFixed(2);
        
        const keywordsContainer = document.getElementById('keywords-container');
        keywordsContainer.innerHTML = '';
        
        analysis.keywords.forEach(keyword => {
            const keywordEl = document.createElement('span');
            keywordEl.className = 'keyword';
            keywordEl.textContent = keyword;
            keywordsContainer.appendChild(keywordEl);
        });
        
        // Show analysis section
        document.getElementById('entry-analysis').style.display = 'block';
    }
    
    async function saveEntry() {
        const title = document.getElementById('entry-title').value.trim() || 'Untitled Entry';
        const content = entryText.value.trim();
        const analysis = {
            primaryEmotion: document.getElementById('primary-emotion').textContent,
            secondaryEmotion: document.getElementById('secondary-emotion').textContent,
            sentimentScore: parseFloat(document.getElementById('sentiment-score').textContent),
            keywords: Array.from(document.querySelectorAll('.keyword')).map(el => el.textContent)
        };
        
        showLoading(true);
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('User not authenticated');
            
            await firebase.firestore().collection('users').doc(user.uid).collection('journal').add({
                title,
                content,
                analysis,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                mood: analysis.primaryEmotion,
                sentiment: analysis.sentimentScore
            });
            
            // Clear form
            entryText.value = '';
            document.getElementById('entry-title').value = '';
            document.getElementById('entry-analysis').style.display = 'none';
            saveEntryBtn.disabled = true;
            
            // Show success message
            alert('Entry saved successfully!');
            
            // Update dashboard
            updateDashboard();
            
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save entry. Please try again.');
        } finally {
            showLoading(false);
        }
    }
    
    function toggleRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            stopRecording();
        } else {
            startRecording();
        }
    }
    
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (e) => {
                audioChunks.push(e.data);
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                
                // Display the recorded audio
                recordedAudio.src = URL.createObjectURL(audioBlob);
                recordedAudio.style.display = 'block';
                
                // Analyze the audio
                const analysis = await analyzeVoiceEmotion(audioBlob);
                displayAnalysisResults(analysis);
                
                // Enable save button
                saveEntryBtn.disabled = false;
            };
            
            mediaRecorder.start();
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            
            // Start timer
            seconds = 0;
            recordingInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                recordingTime.textContent = `${mins}:${secs}`;
            }, 1000);
            
            // Show recording status
            document.querySelector('.recording-status').style.display = 'flex';
            
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
            clearInterval(recordingInterval);
        }
    }
    
    function updateThemeBasedOnEmotion(emotion) {
        const themeMap = {
            'happiness': 'joy',
            'joy': 'joy',
            'calm': 'calm',
            'sadness': 'sadness',
            'anger': 'anger',
            'fear': 'anxiety',
            'anxiety': 'anxiety',
            'surprise': 'default',
            'disgust': 'default'
        };
        
        const theme = themeMap[emotion.toLowerCase()] || 'default';
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    function updateCurrentMood(emotion, score) {
        const moodIndicator = document.getElementById('current-mood-indicator');
        const moodLabel = moodIndicator.querySelector('.mood-label');
        const moodEmoji = moodIndicator.querySelector('.mood-emoji');
        
        const emojiMap = {
            'happiness': '😊',
            'joy': '😊',
            'calm': '😌',
            'sadness': '😢',
            'anger': '😠',
            'fear': '😨',
            'anxiety': '😰',
            'surprise': '😲',
            'disgust': '🤢'
        };
        
        moodLabel.textContent = emotion;
        moodEmoji.textContent = emojiMap[emotion.toLowerCase()] || '😐';
        
        // Update intensity bar
        const intensity = Math.abs(score) * 100;
        document.querySelector('.intensity-level').style.width = `${intensity}%`;
        
        // Update user profile mood
        const userMood = document.querySelector('.user-mood');
        userMood.textContent = `Feeling ${emotion.toLowerCase()}`;
        
        // Save to Firestore
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).update({
                currentMood: emotion,
                lastMoodUpdate: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
    
    function showLoading(show) {
        if (show) {
            document.getElementById('loading-overlay').style.display = 'flex';
        } else {
            document.getElementById('loading-overlay').style.display = 'none';
        }
    }
}