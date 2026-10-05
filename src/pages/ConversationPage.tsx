import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { listings } from '../data/listings';
import type { Conversation } from '../types';

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = '1'; // Mock - would come from auth

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Mock conversation data - in real app, fetch from API
    const mockConversation: Conversation = {
      id: id || '1',
      participants: ['1', '18'], // Margaret Thompson and Patricia Reynolds
      messages: [
        {
          id: '1',
          senderId: '18',
          senderName: 'Patricia Reynolds',
          body: 'Hi Margaret, I have a great opportunity for an Estate Manager position in Bel Air. Would you be interested in discussing this role?',
          sentDate: '2024-03-10T10:00:00Z',
          read: true
        },
        {
          id: '2',
          senderId: '1',
          senderName: 'Margaret Thompson',
          body: 'Hi Patricia, yes I would be very interested! Can you tell me more about the position and the estate?',
          sentDate: '2024-03-10T14:30:00Z',
          read: true
        },
        {
          id: '3',
          senderId: '18',
          senderName: 'Patricia Reynolds',
          body: 'Great! It\'s a 30,000 sq ft property with a staff of 8. The family is looking for someone with your level of experience. Would you be available for an interview next week?',
          sentDate: '2024-03-11T09:15:00Z',
          read: true
        },
        {
          id: '4',
          senderId: '1',
          senderName: 'Margaret Thompson',
          body: 'Absolutely! I\'m available Tuesday or Thursday afternoon. Looking forward to meeting with them.',
          sentDate: '2024-03-11T11:00:00Z',
          read: true
        }
      ],
      createdDate: '2024-03-10T10:00:00Z',
      lastMessageDate: '2024-03-11T11:00:00Z'
    };

    setConversation(mockConversation);
  }, [id, currentUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'Current User',
      body: newMessage,
      sentDate: new Date().toISOString(),
      read: false
    };

    setConversation({
      ...conversation,
      messages: [...conversation.messages, message],
      lastMessageDate: message.sentDate
    });

    setNewMessage('');
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar currentPage="" />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-8 max-w-4xl text-center">
            <p className="text-xl text-muted-foreground">Loading conversation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p !== currentUserId);
  const otherProfile = listings.find(l => l.id === otherParticipant);

  return (
    <div className="min-h-screen bg-background page-transition">
      <NavBar currentPage="" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-4xl">
          <Button
            onClick={() => navigate('/messaging')}
            variant="ghost"
            className="mb-8 text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Messages
          </Button>

          {/* Conversation Header */}
          <Card className="p-6 bg-card text-card-foreground mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {otherProfile && (
                  <>
                    <img
                      src={otherProfile.profilePhoto}
                      alt={otherProfile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-heading font-bold text-foreground">
                        {otherProfile.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">{otherProfile.role}</p>
                    </div>
                  </>
                )}
              </div>

            </div>
          </Card>

          {/* Messages */}
          <Card className="p-6 bg-card text-card-foreground mb-6">
            <div className="space-y-6 max-h-[500px] overflow-y-auto mb-6">
              {conversation.messages.map((message) => {
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.sentDate).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-4 pt-6 border-t border-border">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                className="bg-background text-foreground border-border"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
