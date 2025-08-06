// Notification sound utility with improved browser compatibility
class NotificationSoundManager {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private userInteracted = false;
  private isClient = false;
  private html5Audio: HTMLAudioElement | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.isClient = true;
      this.initializeAudioContext();
      this.setupUserInteractionListeners();
      this.initializeHTML5Audio();
    }
  }

  private initializeHTML5Audio() {
    if (!this.isClient) return;
    
    try {
      // Create a simple audio element for fallback
      this.html5Audio = new Audio();
      this.html5Audio.preload = 'auto';
      
      // Create a simple beep sound using data URL
      const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      // Create a MediaStreamDestination to capture the audio
      const destination = audioContext.createMediaStreamDestination();
      gainNode.connect(destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      // Convert to blob and set as audio source
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        if (this.html5Audio) {
          this.html5Audio.src = url;
        }
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 300);
      
    } catch (error) {
      console.error('Failed to initialize HTML5 audio:', error);
    }
  }

  private initializeAudioContext() {
    if (!this.isClient) return;
    
    try {
      // Check if AudioContext is available
      const AudioContextClass = (window as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      // Create audio context
      this.audioContext = new AudioContextClass();
      this.isInitialized = true;
      
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private setupUserInteractionListeners() {
    if (!this.isClient) return;
    
    // Listen for user interactions to enable audio
    const enableAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('Audio context resumed');
          this.userInteracted = true;
        }).catch(error => {
          console.error('Failed to resume audio context:', error);
        });
      } else {
        this.userInteracted = true;
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown', 'mousedown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, enableAudio, { once: true, passive: true });
    });

    // Also try to resume on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', enableAudio, { once: true });
    } else {
      enableAudio();
    }
  }

  private async ensureAudioContext() {
    if (!this.isClient) return false;
    
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
        return false;
      }
    }

    return this.audioContext && this.audioContext.state === 'running';
  }

  private createNotificationSound(frequency: number, duration: number = 0.3) {
    if (!this.audioContext || !this.isClient) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Configure sound
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      // Play the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
    } catch (error) {
      console.error('Failed to create notification sound:', error);
    }
  }

  private playHTML5NotificationSound() {
    if (!this.isClient || !this.html5Audio) return;
    
    try {
      this.html5Audio.currentTime = 0;
      this.html5Audio.play().catch(error => {
        console.error('Failed to play HTML5 notification sound:', error);
      });
    } catch (error) {
      console.error('Failed to play HTML5 notification sound:', error);
    }
  }

  async playNotificationSound() {
    if (!this.isClient) return;
    
    // Try Web Audio API first
    const isReady = await this.ensureAudioContext();
    if (isReady) {
      this.createNotificationSound(800, 0.3);
    } else {
      // Fallback to HTML5 Audio
      this.playHTML5NotificationSound();
    }
  }

  async playChatMessageSound() {
    if (!this.isClient) return;
    
    // Try Web Audio API first
    const isReady = await this.ensureAudioContext();
    if (isReady) {
      this.createNotificationSound(600, 0.2);
    } else {
      // Fallback to HTML5 Audio
      this.playHTML5NotificationSound();
    }
  }

  async playAdvancedNotificationSound() {
    if (!this.isClient) return;
    
    // Try Web Audio API first
    const isReady = await this.ensureAudioContext();
    if (isReady) {
      try {
        if (!this.audioContext) return;

        // Create multiple oscillators for a richer sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Connect all oscillators to gain node
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Configure frequencies
        osc1.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        // Start and stop
        osc1.start(this.audioContext.currentTime);
        osc2.start(this.audioContext.currentTime);
        osc1.stop(this.audioContext.currentTime + 0.2);
        osc2.stop(this.audioContext.currentTime + 0.2);
        
      } catch (error) {
        console.error('Failed to play advanced notification sound:', error);
        // Fallback to HTML5 Audio
        this.playHTML5NotificationSound();
      }
    } else {
      // Fallback to HTML5 Audio
      this.playHTML5NotificationSound();
    }
  }

  // Method to test if audio is working
  async testAudio() {
    if (!this.isClient) return false;
    
    const isReady = await this.ensureAudioContext();
    if (isReady) {
      this.playNotificationSound();
      return true;
    } else if (this.html5Audio) {
      this.playHTML5NotificationSound();
      return true;
    }
    return false;
  }

  // Get the current state
  getState() {
    if (!this.isClient) {
      return {
        isInitialized: false,
        userInteracted: false,
        audioContextState: 'not-available'
      };
    }
    
    return {
      isInitialized: this.isInitialized,
      userInteracted: this.userInteracted,
      audioContextState: this.audioContext?.state || 'not-available'
    };
  }
}

// Create a singleton instance only on client side
let notificationSoundManager: NotificationSoundManager | null = null;

const getNotificationSoundManager = () => {
  if (typeof window !== 'undefined' && !notificationSoundManager) {
    notificationSoundManager = new NotificationSoundManager();
  }
  return notificationSoundManager;
};

// Export the functions
export const playNotificationSound = () => {
  const manager = getNotificationSoundManager();
  return manager?.playNotificationSound();
};

export const playChatMessageSound = () => {
  const manager = getNotificationSoundManager();
  return manager?.playChatMessageSound();
};

export const playNotificationSoundAdvanced = () => {
  const manager = getNotificationSoundManager();
  return manager?.playAdvancedNotificationSound();
};

export const testNotificationAudio = () => {
  const manager = getNotificationSoundManager();
  return manager?.testAudio() || Promise.resolve(false);
};

export const getNotificationAudioState = () => {
  const manager = getNotificationSoundManager();
  return manager?.getState() || {
    isInitialized: false,
    userInteracted: false,
    audioContextState: 'not-available'
  };
}; 