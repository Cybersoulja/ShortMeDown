import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechRecognition from "@/hooks/use-speech-recognition";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptComplete: (transcript: string) => void;
}

export function VoiceModal({ isOpen, onClose, onTranscriptComplete }: VoiceModalProps) {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    error
  } = useSpeechRecognition();

  // Start listening when modal opens
  useEffect(() => {
    if (isOpen && hasRecognitionSupport) {
      startListening();
    }
    return () => {
      if (isListening) {
        stopListening();
      }
      resetTranscript();
    };
  }, [isOpen, hasRecognitionSupport, isListening, startListening, stopListening, resetTranscript]);

  // Handle stop button
  const handleStop = () => {
    stopListening();
    onTranscriptComplete(transcript);
    onClose();
  };

  // Handle close without saving
  const handleClose = () => {
    stopListening();
    resetTranscript();
    onClose();
  };

  // Error state if speech recognition is not supported
  if (!hasRecognitionSupport) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-white rounded-t-2xl w-full max-w-md p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Voice Input</DialogTitle>
            <Button variant="ghost" className="absolute right-4 top-4" onClick={handleClose}>
              <X className="h-6 w-6 text-ios-gray-1" />
            </Button>
          </DialogHeader>
          
          <div className="text-center text-ios-red">
            Speech recognition is not supported in your browser.
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="destructive" 
              className="px-6 py-3 rounded-full font-medium"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white rounded-t-2xl w-full max-w-md p-6 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Voice Input</DialogTitle>
          <Button variant="ghost" className="absolute right-4 top-4" onClick={handleClose}>
            <X className="h-6 w-6 text-ios-gray-1" />
          </Button>
        </DialogHeader>
        
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full bg-ios-blue/10 flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}>
            <Mic className="h-10 w-10 text-ios-blue" />
          </div>
        </div>
        
        <div className="flex justify-center space-x-1 h-10 items-center">
          {/* Waveform visualization */}
          {isListening && (
            <div className="flex items-end space-x-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-ios-blue rounded"
                  style={{
                    height: `${Math.floor(Math.random() * 20) + 3}px`,
                    animation: `waveform ${Math.random() * 0.5 + 0.5}s infinite`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-center text-ios-gray-1">
          {isListening 
            ? "Listening... Tell me what you want to automate" 
            : error 
              ? `Error: ${error}` 
              : transcript 
                ? "Ready to use your recorded speech" 
                : "Click start to begin recording"
          }
        </p>
        
        {transcript && (
          <div className="p-3 bg-ios-gray-4 rounded-lg text-sm max-h-24 overflow-y-auto">
            {transcript}
          </div>
        )}
        
        <div className="flex justify-center">
          {isListening ? (
            <Button 
              variant="destructive" 
              className="px-6 py-3 rounded-full font-medium"
              onClick={handleStop}
            >
              Stop
            </Button>
          ) : (
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="px-6 py-3 rounded-full font-medium"
                onClick={handleClose}
              >
                Cancel
              </Button>
              {transcript && (
                <Button 
                  variant="default"
                  className="px-6 py-3 rounded-full font-medium bg-ios-blue text-white"
                  onClick={handleStop}
                >
                  Use
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
