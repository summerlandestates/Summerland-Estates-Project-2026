import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { listings } from '../data/listings';
import { canShowConfirmHired } from '../utils/workIntentDetection';
import type { Conversation, HireConfirmation, HireStatus } from '../types';

export default function ConversationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hireOccurred, setHireOccurred] = useState<boolean | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [startDate, setStartDate] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<HireConfirmation | null>(null);
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
      lastMessageDate: '2024-03-11T11:00:00Z',
      hireStatus: 'none',
      hasWorkIntent: true
    };

    setConversation(mockConversation);

    // Check if there's a pending confirmation requiring response
    const storedConfirmation = localStorage.getItem(`hire_confirmation_${id}`);
    if (storedConfirmation) {
      const confirmation: HireConfirmation = JSON.parse(storedConfirmation);
      if (confirmation.status === 'pending-confirmation' && 
          confirmation.initiatedBy !== currentUserId &&
          !confirmation.secondPartyResponse) {
        setPendingConfirmation(confirmation);
        setShowResponseModal(true);
      }
    }
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

  const handleConfirmHired = () => {
    setShowConfirmModal(true);
  };

  const handleSubmitConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hireOccurred === null) {
      alert('Please select whether a hire occurred');
      return;
    }

    if (hireOccurred && !selectedProfile) {
      alert('Please select the profile involved');
      return;
    }

    const confirmation: HireConfirmation = {
      id: Date.now().toString(),
      conversationId: conversation?.id || '',
      initiatedBy: currentUserId,
      initiatedDate: new Date().toISOString(),
      hireOccurred,
      hiredProfileId: hireOccurred ? selectedProfile : undefined,
      startDate: hireOccurred ? startDate : undefined,
      status: 'pending-confirmation'
    };

    // Store confirmation
    localStorage.setItem(`hire_confirmation_${conversation?.id}`, JSON.stringify(confirmation));

    // Update conversation
    if (conversation) {
      setConversation({
        ...conversation,
        hireStatus: 'pending-confirmation',
        hireConfirmation: confirmation
      });
    }

    // In real app, send notification to other party
    alert(hireOccurred 
      ? 'Hire confirmation sent! The other party will be notified to confirm.'
      : 'No hire confirmation sent. The other party will be notified.'
    );

    setShowConfirmModal(false);
    resetConfirmationForm();
  };

  const handleSecondPartyResponse = (confirmed: boolean, disputed: boolean = false) => {
    if (!pendingConfirmation || !conversation) return;

    const response = {
      respondedBy: currentUserId,
      respondedDate: new Date().toISOString(),
      confirmed,
      disputed,
      disputeReason: disputed ? disputeReason : undefined
    };

    const updatedConfirmation: HireConfirmation = {
      ...pendingConfirmation,
      status: disputed ? 'disputed' : (confirmed ? 'confirmed' : 'not-hired'),
      secondPartyResponse: response
    };

    // Store updated confirmation
    localStorage.setItem(`hire_confirmation_${conversation.id}`, JSON.stringify(updatedConfirmation));

    // Update conversation
    setConversation({
      ...conversation,
      hireStatus: updatedConfirmation.status,
      hireConfirmation: updatedConfirmation
    });

    if (disputed) {
      alert('Dispute submitted. This conversation has been flagged for review. Account deletion is temporarily blocked for both parties.');
    } else if (confirmed && pendingConfirmation.hireOccurred) {
      alert('Hire confirmed! This placement has been recorded.');
    } else {
      alert('Confirmation recorded.');
    }

    setShowResponseModal(false);
    setPendingConfirmation(null);
    setDisputeReason('');
  };

  const resetConfirmationForm = () => {
    setHireOccurred(null);
    setSelectedProfile('');
    setStartDate('');
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
  const showConfirmButton = canShowConfirmHired(conversation, listings);

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

              {showConfirmButton && conversation.hireStatus === 'none' && (
                <Button
                  onClick={handleConfirmHired}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Hired
                </Button>
              )}

              {conversation.hireStatus === 'pending-confirmation' && (
                <Badge variant="secondary" className="bg-warning/10 text-warning border-warning">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Pending Confirmation
                </Badge>
              )}

              {conversation.hireStatus === 'confirmed' && (
                <Badge className="bg-success text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Hire Confirmed
                </Badge>
              )}

              {conversation.hireStatus === 'disputed' && (
                <Badge variant="destructive">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Under Review
                </Badge>
              )}
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

      {/* Initial Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-card text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Confirm Hire
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Confirming a hire helps keep the platform accurate. This confirmation is private and requires verification by both parties.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitConfirmation} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-foreground font-semibold">
                Did a hire occur from this conversation? *
              </Label>
              
              <div className="space-y-3">
                <div
                  onClick={() => setHireOccurred(true)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    hireOccurred === true
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      hireOccurred === true ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {hireOccurred === true && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Yes, a hire occurred</p>
                      <p className="text-xs text-muted-foreground">Select the profile and provide details</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setHireOccurred(false)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    hireOccurred === false
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      hireOccurred === false ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {hireOccurred === false && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">No hire occurred</p>
                      <p className="text-xs text-muted-foreground">No additional information needed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hireOccurred === true && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="selectedProfile" className="text-foreground">
                    Select the profile involved *
                  </Label>
                  <select
                    id="selectedProfile"
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                    required
                    className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3 py-2"
                  >
                    <option value="">Choose profile...</option>
                    {conversation.participants
                      .filter(p => p !== currentUserId)
                      .map(participantId => {
                        const profile = listings.find(l => l.id === participantId);
                        return profile ? (
                          <option key={profile.id} value={profile.id}>
                            {profile.name} - {profile.role}
                          </option>
                        ) : null;
                      })}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">
                    Start Date (Optional)
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background text-foreground border-border"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  resetConfirmationForm();
                }}
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={hireOccurred === null || (hireOccurred && !selectedProfile)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Second Party Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="bg-card text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              Confirm Hire Status
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {pendingConfirmation?.hireOccurred
                ? 'This profile has marked that a hire occurred. Please confirm or dispute.'
                : 'This profile has marked that no hire occurred. Please confirm or dispute.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pendingConfirmation?.hireOccurred && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>Profile:</strong> {listings.find(l => l.id === pendingConfirmation.hiredProfileId)?.name}
                </p>
                {pendingConfirmation.startDate && (
                  <p className="text-sm text-foreground mt-1">
                    <strong>Start Date:</strong> {new Date(pendingConfirmation.startDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => handleSecondPartyResponse(true, false)}
                className="w-full bg-success text-white hover:bg-success/90"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {pendingConfirmation?.hireOccurred ? 'Confirm Hire' : 'Confirm No Hire'}
              </Button>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    if (!disputeReason.trim()) {
                      alert('Please provide a reason for the dispute');
                      return;
                    }
                    handleSecondPartyResponse(false, true);
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Dispute
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="disputeReason" className="text-foreground text-xs">
                    Reason for dispute (required if disputing)
                  </Label>
                  <Textarea
                    id="disputeReason"
                    placeholder="Please explain why you're disputing this confirmation..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    rows={3}
                    className="bg-background text-foreground border-border text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
