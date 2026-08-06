import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, MessageSquare, Loader2, ArrowLeft, User } from 'lucide-react';

interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  profiles: { id: string; full_name?: string; email?: string };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function ConversationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Record<string, ConversationParticipant[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(id || null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      const other = participants[activeConversation]?.find(p => p.user_id !== user?.id);
      setRecipientName(other?.profiles.full_name || other?.profiles.email || 'Member');
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Get all conversation IDs the user is in
      const { data: convParticipants, error: cpError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, profiles!user_id(id, full_name, email)')
        .eq('user_id', user?.id);

      if (cpError) throw cpError;

      const convIds = (convParticipants || []).map(p => p.conversation_id);
      setConversations(convIds);

      // Group participants by conversation
      const allParticipants: Record<string, ConversationParticipant[]> = {};
      for (const p of convParticipants || []) {
        if (!allParticipants[p.conversation_id]) allParticipants[p.conversation_id] = [];
        allParticipants[p.conversation_id].push({
          conversation_id: p.conversation_id,
          user_id: p.user_id,
          profiles: (p as any).profiles
        });
      }

      // Fetch other participants for each conversation
      const { data: otherParticipants, error: opError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, profiles!user_id(id, full_name, email)')
        .in('conversation_id', convIds)
        .neq('user_id', user?.id);

      if (opError) throw opError;

      for (const p of otherParticipants || []) {
        if (!allParticipants[p.conversation_id]) allParticipants[p.conversation_id] = [];
        allParticipants[p.conversation_id].push({
          conversation_id: p.conversation_id,
          user_id: p.user_id,
          profiles: (p as any).profiles
        });
      }

      setParticipants(allParticipants);

      if (id && convIds.includes(id)) {
        setActiveConversation(id);
      } else if (convIds.length > 0) {
        setActiveConversation(convIds[0]);
      }
    } catch (error: any) {
      console.error('Conversations load error:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Messages load error:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: activeConversation,
        sender_id: user.id,
        content: newMessage.trim()
      });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(activeConversation);

      // Notify other participants
      const others = participants[activeConversation]?.filter(p => p.user_id !== user.id) || [];
      for (const other of others) {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: other.user_id,
            type: 'message',
            title: 'New message',
            body: `You have a new message from ${user.user_metadata?.full_name || user.email}`,
            link: `/messaging/${activeConversation}`
          })
        });
      }
    } catch (error: any) {
      toast.error('Failed to send message', { description: error.message });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A89F91]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="messaging" />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
            <h1 className="text-3xl font-heading font-semibold text-foreground">Messages</h1>
          </div>

          {conversations.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-[#A89F91]/30">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#A89F91]/50" />
              <h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
              <p className="text-muted-foreground mb-6">Start a conversation by visiting a profile and sending a message.</p>
              <Button onClick={() => navigate('/search')} className="bg-[#A89F91] text-white">Find Profiles</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
              {/* Conversation List */}
              <Card className="md:col-span-1 overflow-hidden border-[#e8dfd3]">
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-1">
                    {conversations.map((convId) => {
                      const other = participants[convId]?.find(p => p.user_id !== user?.id);
                      const name = other?.profiles.full_name || other?.profiles.email || 'Member';
                      return (
                        <button
                          key={convId}
                          onClick={() => { setActiveConversation(convId); navigate(`/messaging/${convId}`); }}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${activeConversation === convId ? 'bg-[#A89F91]/10' : 'hover:bg-muted'}`}
                        >
                          <Avatar className="w-10 h-10 bg-[#A89F91] text-white"><AvatarFallback><User className="w-4 h-4" /></AvatarFallback></Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{name}</p>
                            <p className="text-xs text-muted-foreground truncate">Conversation</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>

              {/* Active Conversation */}
              <Card className="md:col-span-2 flex flex-col border-[#e8dfd3]">
                <div className="p-4 border-b border-[#e8dfd3]">
                  <h2 className="font-semibold text-foreground">{recipientName}</h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No messages yet. Send the first one below.</p>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender_id === user?.id ? 'bg-[#A89F91] text-white rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'}`}>{formatTime(msg.created_at)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSend} className="p-4 border-t border-[#e8dfd3] flex gap-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="min-h-[80px] resize-none"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()} className="bg-[#A89F91] text-white self-end">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
