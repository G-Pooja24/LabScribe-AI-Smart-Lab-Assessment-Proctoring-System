// Fix: Create the VoiceChat component using the Gemini Live API for real-time interaction.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Role } from '../../types';
import { MicrophoneIcon, StopIcon, LoadingSpinner } from './Icons';

// --- Audio Utility Functions (as per @google/genai guidelines) ---

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


// --- Component ---

interface VoiceChatProps {
    role: Role;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ role }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const systemInstruction = role === Role.Teacher
        ? `You are an AI assistant for teachers using the LabQMS platform. Be helpful, concise, and professional via voice. You can help with tasks like creating lesson plans, explaining concepts, or suggesting lab activities.`
        : `You are an AI study buddy for students using the LabQMS platform. Be friendly, encouraging, and helpful via voice. You can help students understand difficult topics and prepare for tests. Do not give away direct answers to test questions, but guide them to the solution.`;

    const stopRecording = useCallback(async () => {
        setIsRecording(false);
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error('Error closing session:', e);
            }
            sessionPromiseRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
    }, []);


    const startRecording = async () => {
        setIsConnecting(true);
        setError(null);
        setUserTranscript('');
        setModelTranscript('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        setIsConnecting(false);
                        setIsRecording(true);
                        
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setModelTranscript(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        if (message.serverContent?.turnComplete) {
                            setUserTranscript('');
                            setModelTranscript('');
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                             nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                             const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                             const source = outputAudioContextRef.current.createBufferSource();
                             source.buffer = audioBuffer;
                             source.connect(outputAudioContextRef.current.destination);
                             source.addEventListener('ended', () => { outputSourcesRef.current.delete(source); });
                             source.start(nextStartTimeRef.current);
                             nextStartTimeRef.current += audioBuffer.duration;
                             outputSourcesRef.current.add(source);
                        }
                        
                        if (message.serverContent?.interrupted) {
                            for (const source of outputSourcesRef.current.values()) {
                                source.stop();
                            }
                            outputSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setError('An error occurred with the connection.');
                        stopRecording();
                    },
                    onclose: () => {
                        console.log('Session closed.');
                        stopRecording();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                },
            });
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            setError(err.message || 'Could not access microphone.');
            setIsConnecting(false);
            stopRecording();
        }
    };
    
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, [stopRecording]);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 p-4 h-full">
             <h3 className="text-2xl font-bold text-brand-text font-display">Voice Assistant</h3>
             <p className="text-brand-text/80 text-center max-w-md">
                {isRecording ? "I'm listening..." : "Press the button and start speaking to your AI assistant."}
            </p>
            <div className="relative w-24 h-24">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isConnecting}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50
                        ${isRecording ? 'bg-red-500 text-white animate-pulse-glow-red' : 'bg-brand-primary text-white'}
                        ${isConnecting ? 'cursor-not-allowed' : ''}
                    `}
                >
                    {isConnecting ? (
                        <LoadingSpinner size="w-10 h-10" />
                    ) : isRecording ? (
                        <StopIcon className="w-10 h-10" />
                    ) : (
                        <MicrophoneIcon className="w-10 h-10" />
                    )}
                </button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            <div className="w-full max-w-2xl min-h-[120px] bg-brand-bg/50 border border-brand-primary/20 rounded-lg p-4 space-y-2 text-brand-text/80">
                <p><span className="font-bold text-brand-text">You:</span> {userTranscript}</p>
                <p><span className="font-bold text-brand-text">AI:</span> {modelTranscript}</p>
            </div>
        </div>
    );
};

export default VoiceChat;
