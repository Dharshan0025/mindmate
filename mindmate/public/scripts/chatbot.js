// Chatbot functionality
function initChatbot() {
    const chatInput = document.getElementById('chatbot-input-text');
    const sendBtn = document.getElementById('send-chatbot-message');
    const messagesContainer = document.getElementById('chatbot-messages');
    const personaSelect = document.getElementById('persona-select');
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Quick prompts
    document.querySelectorAll('.quick-prompt').forEach(prompt => {
        prompt.addEventListener('click', () => {
            chatInput.value = prompt.getAttribute('data-prompt');
            chatInput.focus();
        });
    });
    
    // Functions
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessageToChat('user', message);
        chatInput.value = '';
        
        // Get selected persona
        const persona = personaSelect.value;
        
        showLoading(true);
        
        try {
            // Get chatbot response
            const response = await getChatbotResponse(message, persona);
            
            // Add chatbot response to chat
            addMessageToChat('bot', response);
            
        } catch (error) {
            console.error('Error in chatbot:', error);
            addMessageToChat('bot', "I'm having trouble understanding. Could you try rephrasing that?");
        } finally {
            showLoading(false);
            scrollChatToBottom();
        }
    }
    
    function addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'chatbot-message-container';
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="user-message-content">${message}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="chatbot-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-message">
                    ${formatChatbotResponse(message)}
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        scrollChatToBottom();
    }
    
    function formatChatbotResponse(text) {
        // Convert markdown-like formatting to HTML
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>'); // italic
        formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>'); // alternative italic
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>'); // links
        
        // Convert line breaks to paragraphs or br tags
        formatted = formatted.split('\n\n').map(para => {
            if (para.trim() === '') return '';
            return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        }).join('');
        
        return formatted;
    }
    
    function scrollChatToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function showLoading(show) {
        if (show) {
            document.getElementById('loading-overlay').style.display = 'flex';
        } else {
            document.getElementById('loading-overlay').style.display = 'none';
        }
    }
}