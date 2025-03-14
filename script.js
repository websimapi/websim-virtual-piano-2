const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const notes = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
};

let isRecording = false;
let recordingStartTime;
let recordedNotes = [];
let playbackTimeout;

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('mousedown', () => playNote(key.dataset.note));
    key.addEventListener('mouseup', () => stopNote(key.dataset.note));
    key.addEventListener('mouseleave', () => stopNote(key.dataset.note));
});

document.addEventListener('keydown', (e) => {
    const keyMap = {
        'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4',
        'g': 'G4', 'h': 'A4', 'j': 'B4', 'w': 'C#4',
        'e': 'D#4', 't': 'F#4', 'y': 'G#4', 'u': 'A#4'
    };
    if (keyMap[e.key] && !e.repeat) {
        const key = document.querySelector(`[data-note="${keyMap[e.key]}"]`);
        key.classList.add('active');
        playNote(keyMap[e.key]);
    }
});

document.addEventListener('keyup', (e) => {
    const keyMap = { ... }; // Same as above
    if (keyMap[e.key]) {
        const key = document.querySelector(`[data-note="${keyMap[e.key]}"]`);
        key.classList.remove('active');
        stopNote(keyMap[e.key]);
    }
});

document.getElementById('recordBtn').addEventListener('click', toggleRecording);
document.getElementById('playBtn').addEventListener('click', playRecording);
document.getElementById('clearBtn').addEventListener('click', clearRecording);

function playNote(note) {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.frequency.setValueAtTime(notes[note], audioContext.currentTime);
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    osc.start();
    
    osc._gain = gainNode;
    osc._note = note;
    
    if (isRecording) {
        recordedNotes.push({
            note,
            time: Date.now() - recordingStartTime,
            type: 'start'
        });
    }
}

function stopNote(note) {
    if (isRecording) {
        recordedNotes.push({
            note,
            time: Date.now() - recordingStartTime,
            type: 'stop'
        });
    }
}

function toggleRecording() {
    isRecording = !isRecording;
    document.getElementById('recordBtn').textContent = isRecording ? '⏹ Stop' : '● Record';
    if (isRecording) {
        recordingStartTime = Date.now();
        recordedNotes = [];
    }
}

function playRecording() {
    let currentTime = 0;
    recordedNotes.forEach(event => {
        setTimeout(() => {
            const key = document.querySelector(`[data-note="${event.note}"]`);
            if (event.type === 'start') {
                key.classList.add('active');
                playNote(event.note);
            } else {
                key.classList.remove('active');
                stopNote(event.note);
            }
        }, event.time);
    });
}

function clearRecording() {
    recordedNotes = [];
    clearTimeout(playbackTimeout);
}

