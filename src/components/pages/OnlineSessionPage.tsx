import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Share2, 
  Settings, Copy, Users, Clock, Pen, Eraser, Palette, Image as ImageIcon,
  Download, RotateCcw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

interface DrawingPoint {
  x: number;
  y: number;
}

export default function OnlineSessionPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard'>('chat');
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
  const [sessionTime, setSessionTime] = useState('00:15:32');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Whiteboard states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [lastPoint, setLastPoint] = useState<DrawingPoint | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

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

  // Whiteboard drawing functions
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const drawLine = (fromX: number, fromY: number, toX: number, toY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawingMode === 'eraser') {
      ctx.clearRect(toX - brushSize / 2, toY - brushSize / 2, brushSize, brushSize);
      ctx.strokeStyle = 'transparent';
    } else {
      ctx.strokeStyle = brushColor;
    }
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCanvasCoordinates(e);
    setLastPoint(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    const coords = getCanvasCoordinates(e);
    drawLine(lastPoint.x, lastPoint.y, coords.x, coords.y);
    setLastPoint(coords);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleClearWhiteboard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleDownloadWhiteboard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'whiteboard.png';
      link.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Scale image to fit canvas
        const maxWidth = canvas.width * 0.8;
        const maxHeight = canvas.height * 0.8;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        ctx.drawImage(img, x, y, width, height);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 px-4 font-heading text-sm uppercase tracking-wider transition-colors ${
                activeTab === 'chat'
                  ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                  : 'text-secondary-foreground hover:bg-background/50'
              }`}
            >
              Chat
            </button>
            <button 
              onClick={() => setActiveTab('whiteboard')}
              className={`flex-1 py-4 px-4 font-heading text-sm uppercase tracking-wider transition-colors ${
                activeTab === 'whiteboard'
                  ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                  : 'text-secondary-foreground hover:bg-background/50'
              }`}
            >
              Whiteboard
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
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
            </>
          )}

          {/* Whiteboard Tab */}
          {activeTab === 'whiteboard' && (
            <div className="flex-1 flex flex-col">
              {/* Whiteboard Toolbar */}
              <div className="border-b border-neutralborder p-3 space-y-3">
                {/* Drawing Mode */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setDrawingMode('pen')}
                    className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-lg transition-colors ${
                      drawingMode === 'pen'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-background/80'
                    }`}
                  >
                    <Pen className="w-4 h-4" />
                    <span className="text-xs font-paragraph">Pen</span>
                  </Button>
                  <Button
                    onClick={() => setDrawingMode('eraser')}
                    className={`flex-1 h-9 flex items-center justify-center gap-2 rounded-lg transition-colors ${
                      drawingMode === 'eraser'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-background/80'
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span className="text-xs font-paragraph">Eraser</span>
                  </Button>
                </div>

                {/* Color Picker */}
                {drawingMode === 'pen' && (
                  <div className="flex gap-2 items-center">
                    <Palette className="w-4 h-4 text-secondary-foreground" />
                    <div className="flex gap-2 flex-wrap">
                      {['#000000', '#FF0000', '#00AA00', '#0000FF', '#FFAA00', '#FF00FF'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            brushColor === color ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Brush Size */}
                <div className="flex gap-2 items-center">
                  <label className="text-xs font-paragraph text-secondary-foreground">Size:</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="flex-1 h-2 bg-background rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-paragraph text-secondary-foreground w-6">{brushSize}</span>
                </div>

                {/* Image Upload */}
                <div className="flex gap-2">
                  <label className="flex-1 h-9 flex items-center justify-center gap-2 bg-background text-foreground hover:bg-background/80 rounded-lg cursor-pointer transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-paragraph">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleClearWhiteboard}
                    className="flex-1 h-9 flex items-center justify-center gap-2 bg-destructive text-destructiveforeground hover:bg-destructive/90 rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-xs font-paragraph">Clear</span>
                  </Button>
                  <Button
                    onClick={handleDownloadWhiteboard}
                    className="flex-1 h-9 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-paragraph">Save</span>
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 bg-white overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full cursor-crosshair"
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
