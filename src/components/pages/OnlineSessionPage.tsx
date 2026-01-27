import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Share2, 
  Settings, Maximize2, Copy, Users, Clock, LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export default function OnlineSessionPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'You',
      message: 'Hi! Ready to start the session?',
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      sender: 'Participant',
      message: 'Yes, let\'s begin! I\'m excited to learn.',
      timestamp: '10:31 AM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [whiteboardContent, setWhiteboardContent] = useState('');
  const [sessionTime, setSessionTime] = useState('00:15:32');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: ChatMessage = {
        id: String(chatMessages.length + 1),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText('https://meet.skillswap.com/session/abc123xyz');
    alert('Meeting link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-foreground">
      <Header />

      <div className="w-full h-[calc(100vh-80px)] flex flex-col md:flex-row bg-black">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black">
            {/* Your Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="w-full h-full flex items-center justify-center">
                {isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="font-paragraph text-primary text-sm">Your Video</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-foreground flex items-center justify-center">
                    <div className="text-center">
                      <VideoOff className="w-16 h-16 text-secondary-foreground mx-auto mb-4" />
                      <p className="font-paragraph text-secondary-foreground text-sm">Video Off</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                <p className="font-paragraph text-xs text-white">You</p>
              </div>
            </motion.div>

            {/* Participant Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-secondary-foreground mx-auto mb-4" />
                  <p className="font-paragraph text-secondary-foreground text-sm">Participant</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
                <p className="font-paragraph text-xs text-white">Alex Johnson</p>
              </div>
            </motion.div>
          </div>

          {/* Session Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-black/80 backdrop-blur-md border-t border-neutralborder p-4 flex items-center justify-between"
          >
            {/* Left: Session Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-heading text-sm text-primary">{sessionTime}</span>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`h-12 w-12 rounded-full p-0 flex items-center justify-center transition-all ${
                  isMicOn
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-destructive text-destructiveforeground hover:bg-destructive/90'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`h-12 w-12 rounded-full p-0 flex items-center justify-center transition-all ${
                  isVideoOn
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-destructive text-destructiveforeground hover:bg-destructive/90'
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`h-12 w-12 rounded-full p-0 flex items-center justify-center transition-all ${
                  isScreenSharing
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary-foreground text-background hover:bg-secondary-foreground/90'
                }`}
              >
                <Share2 className="w-5 h-5" />
              </Button>

              <Button
                className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-secondary-foreground text-background hover:bg-secondary-foreground/90"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                className="h-12 px-6 rounded-full bg-destructive text-destructiveforeground hover:bg-destructive/90 font-paragraph flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                End Call
              </Button>
            </div>

            {/* Right: Participants */}
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4" />
              <span className="font-paragraph text-sm">2 participants</span>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar - Chat & Whiteboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-96 bg-secondary border-l border-neutralborder flex flex-col"
        >
          {/* Tabs */}
          <div className="flex border-b border-neutralborder">
            <button className="flex-1 py-4 px-4 bg-primary text-primary-foreground font-heading text-sm uppercase tracking-wider border-b-2 border-primary">
              Chat
            </button>
            <button className="flex-1 py-4 px-4 text-secondary-foreground font-heading text-sm uppercase tracking-wider hover:bg-background/50 transition-colors">
              Whiteboard
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.sender === 'You'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-foreground'
                  }`}
                >
                  <p className="font-paragraph text-sm">{msg.message}</p>
                  <p className="font-paragraph text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-neutralborder p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 h-10 font-paragraph"
              />
              <Button
                onClick={handleSendMessage}
                className="h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>

            {/* Meeting Link Copy */}
            <div className="bg-background p-3 rounded-lg">
              <p className="font-heading text-xs uppercase text-secondary-foreground mb-2 tracking-wider">
                Meeting Link
              </p>
              <div className="flex gap-2">
                <Input
                  value="https://meet.skillswap.com/session/abc123xyz"
                  readOnly
                  className="flex-1 h-9 text-xs font-paragraph bg-foreground/5"
                />
                <Button
                  onClick={handleCopyMeetingLink}
                  className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
