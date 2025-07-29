class DrVibeApp {
    constructor() {
        this.socket = io();
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isProcessing = false;
        this.voices = [];
        
        this.elements = {
            messages: document.getElementById('messages'),
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            resetBtn: document.getElementById('resetBtn'),
            micStatus: document.getElementById('micStatus'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            currentTranscript: document.getElementById('currentTranscript'),
            voiceSelect: document.getElementById('voiceSelect'),
            volumeControl: document.getElementById('volumeControl'),
            rateControl: document.getElementById('rateControl')
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.setupSpeechSynthesis();
        this.setupSocketListeners();
        
        // Check for browser support
        if (!this.checkBrowserSupport()) {
            this.showError('Your browser does not support the required speech APIs. Please use Chrome, Safari, or Edge.');
            return;
        }

        this.updateStatus('Ready to start conversation');
    }

    checkBrowserSupport() {
        const hasWebRTC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        const hasSpeechSynthesis = !!window.speechSynthesis;
        
        console.log('Browser support check:', {
            WebRTC: hasWebRTC,
            SpeechRecognition: hasSpeechRecognition,
            SpeechSynthesis: hasSpeechSynthesis,
            UserAgent: navigator.userAgent
        });

        if (!hasWebRTC) {
            this.showError('Your browser does not support microphone access. Please use Chrome, Safari, or Edge.');
            return false;
        }

        if (!hasSpeechRecognition) {
            this.showError('Your browser does not support speech recognition. Please use Chrome, Safari, or Edge.');
            return false;
        }

        if (!hasSpeechSynthesis) {
            this.showError('Your browser does not support text-to-speech. Please use Chrome, Safari, or Edge.');
            return false;
        }

        // Check if we're on HTTPS or localhost
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (!isSecure) {
            this.showError('Speech recognition requires HTTPS or localhost. Please use https:// or run on localhost.');
            return false;
        }

        return true;
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startConversation());
        this.elements.stopBtn.addEventListener('click', () => this.stopConversation());
        this.elements.resetBtn.addEventListener('click', () => this.resetConversation());
        
        this.elements.voiceSelect.addEventListener('change', (e) => {
            this.selectedVoice = this.voices[e.target.value];
        });
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.isListening = true;
            this.updateStatus('Listening...', 'listening');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update the live transcript display
            const fullTranscript = finalTranscript + interimTranscript;
            if (fullTranscript.trim()) {
                this.elements.currentTranscript.textContent = fullTranscript;
                this.elements.currentTranscript.classList.add('active');
            }

            // Send final transcript to server
            if (finalTranscript.trim()) {
                this.socket.emit('speech-text', {
                    text: finalTranscript,
                    isFinal: true
                });
                
                this.addMessage('user', finalTranscript);
                this.elements.currentTranscript.textContent = 'Listening...';
                this.elements.currentTranscript.classList.remove('active');
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.handleSpeechError(event.error);
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            if (this.isListening && !this.isProcessing) {
                // Restart recognition if we're still supposed to be listening
                setTimeout(() => {
                    if (this.isListening) {
                        this.recognition.start();
                    }
                }, 100);
            }
        };
    }

    setupSpeechSynthesis() {
        if (!this.synthesis) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Load available voices
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
            this.populateVoiceSelect();
        };

        // Load voices when they become available
        if (this.voices.length === 0) {
            this.synthesis.onvoiceschanged = loadVoices;
        } else {
            loadVoices();
        }
    }

    populateVoiceSelect() {
        this.elements.voiceSelect.innerHTML = '<option value="">Default Voice</option>';
        
        this.voices.forEach((voice, index) => {
            if (voice.lang.startsWith('en')) {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                this.elements.voiceSelect.appendChild(option);
            }
        });

        // Select a good default voice
        const defaultVoice = this.voices.find(voice => 
            voice.lang === 'en-US' && voice.name.includes('Google')
        ) || this.voices.find(voice => voice.lang.startsWith('en'));
        
        if (defaultVoice) {
            const index = this.voices.indexOf(defaultVoice);
            this.elements.voiceSelect.value = index;
            this.selectedVoice = defaultVoice;
        }
    }

    setupSocketListeners() {
        this.socket.on('ai-response', (data) => {
            this.handleAIResponse(data);
        });

        this.socket.on('partial-transcript', (data) => {
            this.elements.currentTranscript.textContent = data.text;
            this.elements.currentTranscript.classList.add('active');
        });

        this.socket.on('conversation-reset', () => {
            this.elements.messages.innerHTML = '';
            this.elements.currentTranscript.textContent = 'Conversation reset. Ready to start again.';
            this.elements.currentTranscript.classList.remove('active');
        });

        this.socket.on('error', (data) => {
            this.showError(data.message);
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.stopConversation();
        });
    }

    async startConversation() {
        if (!this.recognition) {
            this.showError('Speech recognition not available');
            return;
        }

        // Check microphone permission first
        try {
            const permission = await this.checkMicrophonePermission();
            if (!permission) {
                this.showError('Microphone permission required. Please allow microphone access and try again.');
                return;
            }
        } catch (error) {
            console.error('Microphone permission check failed:', error);
            this.showError('Unable to access microphone. Please check browser permissions.');
            return;
        }

        try {
            this.isListening = true;
            this.recognition.start();
            
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            
            this.updateStatus('Starting...', 'processing');
            
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showError('Failed to start speech recognition. Try refreshing the page.');
            this.isListening = false;
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
        }
    }

    async checkMicrophonePermission() {
        try {
            // Try to get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the stream immediately, we just needed to check permission
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }

    stopConversation() {
        if (this.recognition) {
            this.isListening = false;
            this.recognition.stop();
        }

        // Stop any ongoing speech synthesis
        this.synthesis.cancel();

        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        
        this.updateStatus('Stopped');
        this.elements.currentTranscript.textContent = 'Click "Start Conversation" to begin';
        this.elements.currentTranscript.classList.remove('active');
    }

    resetConversation() {
        this.stopConversation();
        this.socket.emit('reset-conversation');
    }

    handleAIResponse(data) {
        const { text, timestamp } = data;
        
        this.addMessage('ai', text, timestamp);
        this.speakText(text);
    }

    addMessage(type, text, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.textContent = text;
        messageDiv.appendChild(messageContent);
        
        if (timestamp) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = new Date(timestamp).toLocaleTimeString();
            messageDiv.appendChild(timeDiv);
        }
        
        this.elements.messages.appendChild(messageDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    speakText(text) {
        if (!this.synthesis || !text.trim()) {
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice settings
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        utterance.volume = parseFloat(this.elements.volumeControl.value);
        utterance.rate = parseFloat(this.elements.rateControl.value);
        utterance.pitch = 1;

        utterance.onstart = () => {
            this.updateStatus('AI Speaking...', 'speaking');
            this.isProcessing = true;
        };

        utterance.onend = () => {
            this.isProcessing = false;
            if (this.isListening) {
                this.updateStatus('Listening...', 'listening');
            } else {
                this.updateStatus('Ready');
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isProcessing = false;
            if (this.isListening) {
                this.updateStatus('Listening...', 'listening');
            }
        };

        this.synthesis.speak(utterance);
    }

    updateStatus(text, state = '') {
        this.elements.statusText.textContent = text;
        this.elements.statusIndicator.className = `status-indicator ${state}`;
    }

    handleSpeechError(error) {
        console.error('Speech recognition error:', error);
        
        let errorMessage = 'Speech recognition error';
        let suggestion = '';
        
        switch (error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try speaking again.';
                suggestion = 'Make sure your microphone is working and try speaking louder.';
                break;
            case 'audio-capture':
                errorMessage = 'Microphone not accessible. Please check permissions.';
                suggestion = 'Click the microphone icon in your browser address bar and allow access.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied. Please allow microphone access.';
                suggestion = 'Refresh the page and click "Allow" when prompted for microphone access.';
                break;
            case 'network':
                errorMessage = 'Network error with speech recognition service.';
                suggestion = 'Try using Chrome or Edge browser. Some browsers require HTTPS for speech recognition.';
                break;
            case 'service-not-allowed':
                errorMessage = 'Speech recognition service not available.';
                suggestion = 'Try using Chrome, Safari, or Edge. Firefox has limited support.';
                break;
            default:
                errorMessage = `Speech recognition error: ${error}`;
                suggestion = 'Try refreshing the page or using a different browser (Chrome recommended).';
        }
        
        this.showError(errorMessage + (suggestion ? ' Suggestion: ' + suggestion : ''));
        
        // Try to restart if it's a temporary error
        if (['no-speech', 'aborted'].includes(error) && this.isListening) {
            setTimeout(() => {
                if (this.isListening) {
                    this.recognition.start();
                }
            }, 1000);
        } else {
            this.stopConversation();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.style.background = 'var(--error-color)';
        errorDiv.style.color = 'white';
        errorDiv.textContent = `Error: ${message}`;
        
        this.elements.messages.appendChild(errorDiv);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DrVibeApp();
});
