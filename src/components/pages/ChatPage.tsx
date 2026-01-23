import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

interface ChatMessage {
  _id: string;
  senderId?: string;
  recipientId?: string;
  content?: string;
  timestamp?: Date | string;
  isRead?: boolean;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { member } = useMember();
  const [otherUser, setOtherUser] = useState<UserProfiles | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
    // Refresh messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id, member]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    if (!id || !member?.loginEmail) return;

    try {
      setIsLoading(true);
      // Load other user profile
      const userProfile = await BaseCrudService.getById<UserProfiles>('userprofiles', id);
      setOtherUser(userProfile);
      
      // Load messages
      await loadMessages();
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!id || !member?.loginEmail) return;

    try {
      const result = await BaseCrudService.getAll<ChatMessage>('chatmessages', {}, { limit: 1000 });
      
      // Filter messages between current user and other user
      const filteredMessages = result.items.filter(msg => 
        (msg.senderId === member.loginEmail && msg.recipientId === id) ||
        (msg.senderId === id && msg.recipientId === member.loginEmail)
      );

      // Sort by timestamp
      filteredMessages.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateA - dateB;
      });

      setMessages(filteredMessages);

      // Mark messages as read
      for (const msg of filteredMessages) {
        if (msg.recipientId === member.loginEmail && !msg.isRead) {
          await BaseCrudService.update<ChatMessage>('chatmessages', {
            _id: msg._id,
            isRead: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !member?.loginEmail || !id) return;

    try {
      setIsSending(true);
      await BaseCrudService.create('chatmessages', {
        _id: crypto.randomUUID(),
        senderId: member.loginEmail,
        recipientId: id,
        content: messageText,
        timestamp: new Date(),
        isRead: false
      });

      setMessageText('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Chat Header */}
      <div className="bg-primary text-primary-foreground py-6 border-b-2 border-neutralborder">
        <div className="max-w-[100rem] mx-auto px-8 md:px-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/profiles">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 h-10 px-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              {otherUser?.profilePicture && (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-foreground/20">
                  <Image
                    src={otherUser.profilePicture}
                    alt={otherUser.fullName || 'User'}
                    className="w-full h-full object-cover"
                    width={48}
                  />
                </div>
              )}
              <div>
                <h1 className="font-heading text-2xl uppercase">
                  {otherUser?.fullName || 'Chat'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 max-w-[100rem] mx-auto w-full px-8 md:px-16 py-8 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-paragraph text-lg text-secondary-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${msg.senderId === member?.loginEmail ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.senderId === member?.loginEmail
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="font-paragraph text-sm break-words">{msg.content}</p>
                  <p className={`font-paragraph text-xs mt-2 ${
                    msg.senderId === member?.loginEmail
                      ? 'text-primary-foreground/70'
                      : 'text-secondary-foreground/70'
                  }`}>
                    {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-secondary border-t-2 border-neutralborder py-6">
        <div className="max-w-[100rem] mx-auto px-8 md:px-16">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 font-paragraph h-12"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 font-paragraph"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
