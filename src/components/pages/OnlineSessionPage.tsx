import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Share2, 
  Settings, Copy, Users, Clock, Pen, Eraser, Palette, Image as ImageIcon,
  Download, RotateCcw, X, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BaseCrudService } from '@/integrations';
import { useMember } from '@/integrations';
import { Sessions, UserProfiles } from '@/entities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface DrawingPoint {
  x: number;
  y: number;
}

export default function OnlineSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { member } = useMember();
  
  const [session, setSession] = useState<Sessions | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionNotStarted, setSessionNotStarted] = useState(false);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Whiteboard states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [lastPoint, setLastPoint] = useState<DrawingPoint | null>(null);
  const canvasOffsetRef = useRef({ x: 0, y: 0 });

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      if (!id || !member?._id) return;

      try {
        setIsLoading(true);
        const sessionData = await BaseCrudService.getById<Sessions>('sessions', id);
        
        if (!sessionData) {
          navigate('/sessions');
          return;
        }

        // Check if user is part of this session
        const isParticipant = sessionData.hostId === member._id || sessionData.participantId === member._id;
        if (!isParticipant) {
          navigate('/sessions');
          return;
        }

        // Check if session time has started
        const sessionStartTime = new Date(sessionData.scheduledDateTime || '');
        const now = new Date();
        if (now < sessionStartTime) {
          setSessionNotStarted(true);
          setIsLoading(false);
          return;
        }

        setSession(sessionData);

        // Load other user's profile
        const otherUserId = sessionData.hostId === member._id ? sessionData.participantId : sessionData.hostId;
        if (otherUserId) {
          const profile = await BaseCrudService.getById<UserProfiles>('userprofiles', otherUserId);
          setOtherUser(profile);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        navigate('/sessions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [id, member, navigate]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvasOffsetRef.current = { x: rect.left, y: rect.top };
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Initialize video capture
  useEffect(() => {
    if (!isVideoOn) return;

    const startVideoCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: isMicOn
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startVideoCapture();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isVideoOn, isMicOn]);

  // Session timer
  useEffect(() => {
    if (!session) return;

    const startTime = new Date(session.scheduledDateTime || '');
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      setSessionTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleSendMessage = () => {
    if (newMessage.trim() && member) {
      const newMsg: ChatMessage = {
        id: String(chatMessages.length + 1),
        sender: member._id,
        senderName: member.profile?.nickname || 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(window.location.href);
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
    ctx.globalCompositeOperation = drawingMode === 'eraser' ? 'destination-out' : 'source-over';

    if (drawingMode === 'eraser') {
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.strokeStyle = brushColor;
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
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
      link.download = `whiteboard-${Date.now()}.png`;
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

  const handleEndCall = () => {
    if (confirm('Are you sure you want to end this session?')) {
      navigate('/sessions');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (sessionNotStarted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-heading text-3xl uppercase text-foreground mb-4">
              Session Not Started Yet
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground mb-8">
              This session is scheduled for {session ? format(new Date(session.scheduledDateTime || ''), 'MMM dd, yyyy - HH:mm') : 'later'}
            </p>
            <Button
              onClick={() => navigate('/sessions')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 font-paragraph"
            >
              Back to Sessions
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <p className="font-paragraph text-lg text-secondary-foreground">Session not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground">
      <Header />

      <div className="w-full h-[calc(100vh-80px)] flex flex-col md:flex-row bg-black">
        {/* Main Area - Whiteboard & Controls */}
        <div className="flex-1 flex flex-col">
          {/* Whiteboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 flex flex-col bg-white overflow-hidden"
          >
            {/* Whiteboard Toolbar */}
            <div className="border-b border-neutralborder p-3 bg-secondary space-y-2 flex-shrink-0">
              <div className="flex gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setDrawingMode('pen')}
                    className={`h-8 px-3 flex items-center justify-center gap-2 rounded-lg transition-colors text-xs ${
                      drawingMode === 'pen'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-background/80'
                    }`}
                  >
                    <Pen className="w-3 h-3" />
                    <span className="font-paragraph">Pen</span>
                  </Button>
                  <Button
                    onClick={() => setDrawingMode('eraser')}
                    className={`h-8 px-3 flex items-center justify-center gap-2 rounded-lg transition-colors text-xs ${
                      drawingMode === 'eraser'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground hover:bg-background/80'
                    }`}
                  >
                    <Eraser className="w-3 h-3" />
                    <span className="font-paragraph">Eraser</span>
                  </Button>
                </div>

                {/* Color Picker */}
                {drawingMode === 'pen' && (
                  <div className="flex gap-2 items-center">
                    <Palette className="w-3 h-3 text-secondary-foreground" />
                    <div className="flex gap-1">
                      {['#000000', '#FF0000', '#00AA00', '#0000FF', '#FFAA00', '#FF00FF'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`w-5 h-5 rounded-full border-2 transition-transform ${
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
                    max="8"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 h-2 bg-background rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-paragraph text-secondary-foreground w-4">{brushSize}</span>
                </div>

                {/* Image Upload */}
                <label className="h-8 px-3 flex items-center justify-center gap-2 bg-background text-foreground hover:bg-background/80 rounded-lg cursor-pointer transition-colors text-xs">
                  <ImageIcon className="w-3 h-3" />
                  <span className="font-paragraph">Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Action Buttons */}
                <Button
                  onClick={handleClearWhiteboard}
                  className="h-8 px-3 flex items-center justify-center gap-2 bg-destructive text-destructiveforeground hover:bg-destructive/90 rounded-lg text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="font-paragraph">Clear</span>
                </Button>
                <Button
                  onClick={handleDownloadWhiteboard}
                  className="h-8 px-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs"
                >
                  <Download className="w-3 h-3" />
                  <span className="font-paragraph">Save</span>
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-full"
                style={{ cursor: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="%23000000"/><circle cx="12" cy="12" r="8" fill="none" stroke="%23000000" stroke-width="1"/></svg>') 12 12, auto` }}
              />
            </div>
          </motion.div>

          {/* Session Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-black/80 backdrop-blur-md border-t border-neutralborder p-4 flex items-center justify-between flex-shrink-0"
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
                title="Screen Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>

              <Button
                className="h-12 w-12 rounded-full p-0 flex items-center justify-center bg-secondary-foreground text-background hover:bg-secondary-foreground/90"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleEndCall}
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

        {/* Right Sidebar - Videos & Chat (Compact) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-72 bg-black border-l border-neutralborder flex flex-col"
        >
          {/* Video Feeds - Top (Horizontal Stack) */}
          <div className="flex-shrink-0 p-3 border-b border-neutralborder">
            <div className="flex gap-2">
              {/* Your Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg overflow-hidden shadow-lg w-32 h-32 flex-shrink-0"
              >
                {isVideoOn ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded-full">
                      <p className="font-paragraph text-xs text-white">You</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-foreground flex items-center justify-center">
                    <div className="text-center">
                      <VideoOff className="w-6 h-6 text-secondary-foreground mx-auto mb-1" />
                      <p className="font-paragraph text-secondary-foreground text-xs">Video Off</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Participant Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg overflow-hidden shadow-lg w-32 h-32 flex-shrink-0"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-6 h-6 text-secondary-foreground mx-auto mb-1" />
                    <p className="font-paragraph text-secondary-foreground text-xs">{otherUser?.fullName || 'Participant'}</p>
                  </div>
                </div>
                <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded-full">
                  <p className="font-paragraph text-xs text-white">{otherUser?.fullName?.split(' ')[0] || 'P'}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Chat - Bottom */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="border-b border-neutralborder p-2 bg-black/50">
              <p className="font-heading text-xs uppercase text-primary tracking-wider">Chat</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {chatMessages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <p className="font-paragraph text-xs text-secondary-foreground">
                    No messages yet
                  </p>
                </motion.div>
              )}
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.sender === member?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-2 py-1 rounded text-xs ${
                      msg.sender === member?._id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-foreground'
                    }`}
                  >
                    <p className="font-paragraph text-xs opacity-70">{msg.senderName}</p>
                    <p className="font-paragraph text-xs">{msg.message}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-neutralborder p-2 space-y-1 bg-black/50">
              <div className="flex gap-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Message..."
                  className="flex-1 h-7 text-xs font-paragraph"
                />
                <Button
                  onClick={handleSendMessage}
                  className="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MessageSquare className="w-3 h-3" />
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
