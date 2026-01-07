import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare, 
  Bell, 
  ShoppingBag, 
  Heart, 
  Tag, 
  Search, 
  MapPin, 
  Power, 
  ThumbsUp, 
  AlertTriangle, 
  Calendar, 
  PartyPopper, 
  Mail, 
  Users, 
  Lock,
  Plus,
  CheckCircle,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';

interface ForumTopic {
  id: string;
  title: string;
  category: string;
  author: string;
  authorRole: string;
  city: string;
  state: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned?: boolean;
}

interface Community {
  id: string;
  city: string;
  state: string;
  memberCount: number;
  createdDate: string;
}

// Mock forum topics data
const forumTopics: ForumTopic[] = [
  {
    id: '1',
    title: 'Best landscaping services in Beverly Hills?',
    category: 'Recommendations',
    author: 'Margaret Thompson',
    authorRole: 'Estate Manager',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 12,
    views: 156,
    lastActivity: '2024-03-15T10:30:00Z',
    isPinned: false
  },
  {
    id: '2',
    title: 'Power outage scheduled for March 20th',
    category: 'Utility Shut Offs',
    author: 'City Administrator',
    authorRole: 'Official',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 8,
    views: 234,
    lastActivity: '2024-03-14T16:45:00Z',
    isPinned: true
  },
  {
    id: '3',
    title: 'Estate sale this weekend - antique furniture',
    category: 'Estate Sales',
    author: 'Sarah Mitchell',
    authorRole: 'Household Manager',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 5,
    views: 89,
    lastActivity: '2024-03-14T14:20:00Z',
    isPinned: false
  },
  {
    id: '4',
    title: 'Looking for reliable pool maintenance',
    category: 'Wanted',
    author: 'James Anderson',
    authorRole: 'Private Chef',
    city: 'Malibu',
    state: 'CA',
    replies: 15,
    views: 178,
    lastActivity: '2024-03-15T09:15:00Z',
    isPinned: false
  },
  {
    id: '5',
    title: 'Lost cat near Sunset Boulevard',
    category: 'Lost & Found',
    author: 'Diana Foster',
    authorRole: 'Personal Assistant',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 3,
    views: 67,
    lastActivity: '2024-03-13T18:30:00Z',
    isPinned: false
  },
  {
    id: '6',
    title: 'Warning: Unreliable contractor',
    category: 'Beware Of',
    author: 'Robert Chen',
    authorRole: 'Security Director',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 22,
    views: 345,
    lastActivity: '2024-03-15T11:00:00Z',
    isPinned: true
  },
  {
    id: '7',
    title: 'City Council Meeting - March 25th',
    category: 'City Events',
    author: 'City Administrator',
    authorRole: 'Official',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 4,
    views: 123,
    lastActivity: '2024-03-12T10:00:00Z',
    isPinned: false
  },
  {
    id: '8',
    title: 'Donating gently used furniture',
    category: 'Donations',
    author: 'Alexandra Wright',
    authorRole: 'Art Curator',
    city: 'Malibu',
    state: 'CA',
    replies: 7,
    views: 98,
    lastActivity: '2024-03-14T12:30:00Z',
    isPinned: false
  },
  {
    id: '9',
    title: 'Neighborhood watch meeting this Thursday',
    category: 'Community Alerts',
    author: 'Thomas Bennett',
    authorRole: 'Chauffeur',
    city: 'Newport Beach',
    state: 'CA',
    replies: 18,
    views: 267,
    lastActivity: '2024-03-15T08:45:00Z',
    isPinned: true
  },
  {
    id: '10',
    title: 'Private dinner party - looking for servers',
    category: 'Collaborations',
    author: 'Jennifer Martinez',
    authorRole: 'Nanny',
    city: 'Beverly Hills',
    state: 'CA',
    replies: 6,
    views: 112,
    lastActivity: '2024-03-13T15:20:00Z',
    isPinned: false
  }
];

// Mock communities data
const existingCommunities: Community[] = [
  {
    id: '1',
    city: 'Beverly Hills',
    state: 'CA',
    memberCount: 156,
    createdDate: '2023-01-15'
  },
  {
    id: '2',
    city: 'Malibu',
    state: 'CA',
    memberCount: 89,
    createdDate: '2023-03-20'
  },
  {
    id: '3',
    city: 'Newport Beach',
    state: 'CA',
    memberCount: 124,
    createdDate: '2023-02-10'
  }
];

const forumCategories = [
  'Recommendations',
  'Utility Shut Offs',
  'Estate Sales',
  'Wanted',
  'Lost & Found',
  'Beware Of',
  'City Events',
  'Donations',
  'Community Alerts',
  'Collaborations'
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Recommendations': return ThumbsUp;
    case 'Utility Shut Offs': return Power;
    case 'Estate Sales': return Tag;
    case 'Wanted': return Search;
    case 'Lost & Found': return MapPin;
    case 'Beware Of': return AlertTriangle;
    case 'City Events': return Calendar;
    case 'Donations': return Heart;
    case 'Community Alerts': return Bell;
    case 'Collaborations': return Users;
    default: return MessageSquare;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Recommendations': return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
    case 'Utility Shut Offs': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    case 'Estate Sales': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'Wanted': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    case 'Lost & Found': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'Beware Of': return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'City Events': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    case 'Donations': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
    case 'Community Alerts': return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'Collaborations': return 'bg-green-500/10 text-green-600 border-green-500/20';
    default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  }
};

export default function CollectivePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCity, setUserCity] = useState('');
  const [userState, setUserState] = useState('');
  const [canStartCommunity, setCanStartCommunity] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [newCommunityCity, setNewCommunityCity] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [communities, setCommunities] = useState<Community[]>(existingCommunities);
  const [topics, setTopics] = useState<ForumTopic[]>(forumTopics);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is logged in and get their profile location
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      const profileLocation = localStorage.getItem('userLocation') || '';
      if (profileLocation) {
        const [city, state] = profileLocation.split(',').map(s => s.trim());
        setUserCity(city);
        setUserState(state);
        
        // Check if community already exists for user's location
        const communityExists = communities.some(
          c => c.city === city && c.state === state
        );
        setCanStartCommunity(!communityExists);
      }
    }
  }, [communities]);

  const handleStartCommunityClick = () => {
    if (!isLoggedIn) {
      alert('Please create a profile first to start a community');
      navigate('/add-listing', {
        state: { communityOnly: true }
      });
      return;
    }

    setShowCreateCommunityModal(true);
  };

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();

    const inputCity = newCommunityCity.trim();
    
    // Check if city matches user's profile city
    if (inputCity.toLowerCase() !== userCity.toLowerCase()) {
      alert(`You can only create a community for ${userCity}, ${userState} (the city on your profile).`);
      return;
    }

    // Check if community already exists
    const communityExists = communities.some(
      c => c.city.toLowerCase() === inputCity.toLowerCase() && c.state === userState
    );

    if (communityExists) {
      alert(`A community already exists for ${inputCity}, ${userState}.`);
      return;
    }

    // Create new community
    const newCommunity: Community = {
      id: Date.now().toString(),
      city: inputCity,
      state: userState,
      memberCount: 1,
      createdDate: new Date().toISOString()
    };

    setCommunities([...communities, newCommunity]);
    localStorage.setItem(`joined_${inputCity}_${userState}`, 'true');
    
    alert(`${inputCity}, ${userState} Community created! You're the first member. All forum topics are now available.`);
    
    setShowCreateCommunityModal(false);
    setNewCommunityCity('');
    setCanStartCommunity(false);
  };

  const handleStartTopicClick = () => {
    if (!isLoggedIn) {
      alert('Please join a community to start a forum topic');
      navigate('/pricing');
      return;
    }

    // Check if user has joined their local community
    const hasJoined = localStorage.getItem(`joined_${userCity}_${userState}`) === 'true';
    if (!hasJoined) {
      alert(`Please join the ${userCity}, ${userState} community first to start a topic.`);
      return;
    }

    setShowCreateTopicModal(true);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTopicTitle.trim() || !newTopicCategory || !newTopicContent.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newTopic: ForumTopic = {
      id: Date.now().toString(),
      title: newTopicTitle,
      category: newTopicCategory,
      author: 'Current User', // Would come from auth
      authorRole: 'Estate Manager', // Would come from profile
      city: userCity,
      state: userState,
      replies: 0,
      views: 0,
      lastActivity: new Date().toISOString(),
      isPinned: false
    };

    setTopics([newTopic, ...topics]);
    
    alert('Forum topic created successfully!');
    
    setShowCreateTopicModal(false);
    setNewTopicTitle('');
    setNewTopicCategory('');
    setNewTopicContent('');
  };

  const handleTopicClick = (topic: ForumTopic) => {
    if (!isLoggedIn) {
      alert('Please join a community to participate in forum discussions');
      navigate('/pricing');
      return;
    }

    // Check if user has joined this community
    const hasJoined = localStorage.getItem(`joined_${topic.city}_${topic.state}`) === 'true';
    if (!hasJoined) {
      alert(`Join the ${topic.city}, ${topic.state} community to participate in this discussion`);
      return;
    }

    // Navigate to topic (mock for now)
    alert(`Opening topic: ${topic.title}`);
  };

  // Group topics by community
  const topicsByCommunity = topics.reduce((acc, topic) => {
    const key = `${topic.city}, ${topic.state}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(topic);
    return acc;
  }, {} as { [key: string]: ForumTopic[] });

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentPage="collective" />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-heading font-medium text-foreground mb-4 tracking-tight">
                  The Collective
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with your local estate community
                </p>
              </div>
              <Button
                onClick={() => navigate('/pricing')}
                size="lg"
                className="bg-primary text-primary-foreground px-8 py-4"
              >
                Join Communities
              </Button>
            </div>

            <Card className="p-8 bg-muted border-border">
              <p className="text-foreground leading-relaxed text-center">
                Join your exclusive enclave collective, meet your neighbors and nearby estate staff, share insights, alert your community, and create a safe space with those nearby.
              </p>
            </Card>
          </div>

          {/* Active Communities */}
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-medium text-foreground mb-6 tracking-tight">
              Active Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communities.map((community) => (
                <Card
                  key={community.id}
                  className="p-6 bg-card text-card-foreground hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                        {community.city}
                      </h3>
                      <p className="text-sm text-muted-foreground">{community.state}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-heading font-semibold text-foreground">
                        {community.memberCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-semibold text-foreground">
                        {topicsByCommunity[`${community.city}, ${community.state}`]?.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Topics</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/pricing')}
                    variant="outline"
                    className="w-full border-border text-foreground hover:bg-muted"
                  >
                    Join Community
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Forum Topics by Community */}
          {Object.entries(topicsByCommunity).map(([communityName, communityTopics]) => {
            const [city, state] = communityName.split(',').map(s => s.trim());
            const isUserCommunity = city === userCity && state === userState;
            const hasJoined = localStorage.getItem(`joined_${city}_${state}`) === 'true';

            return (
              <div key={communityName} className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-heading font-medium text-foreground tracking-tight">
                    {communityName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      {communityTopics.length} topics
                    </Badge>
                    {isUserCommunity && hasJoined && (
                      <Button
                        onClick={handleStartTopicClick}
                        size="sm"
                        className="bg-primary text-primary-foreground"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start a Topic
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {communityTopics
                    .sort((a, b) => {
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
                      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                    })
                    .map((topic) => {
                      const CategoryIcon = getCategoryIcon(topic.category);
                      const categoryColor = getCategoryColor(topic.category);
                      
                      return (
                        <Card
                          key={topic.id}
                          className="p-6 bg-card text-card-foreground hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => handleTopicClick(topic)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${categoryColor} border`}>
                              <CategoryIcon className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {topic.isPinned && (
                                      <Badge className="bg-primary text-primary-foreground text-xs">
                                        Pinned
                                      </Badge>
                                    )}
                                    <h3 className="text-lg font-heading font-semibold text-foreground truncate">
                                      {topic.title}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span>{topic.author}</span>
                                    <span>•</span>
                                    <span>{topic.authorRole}</span>
                                  </div>
                                </div>
                                <Badge variant="outline" className={`${categoryColor} border flex-shrink-0`}>
                                  {topic.category}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{topic.replies} replies</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>{topic.views} views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{new Date(topic.lastActivity).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* Start Community CTA */}
          <Card className="p-12 bg-card text-card-foreground border-2 border-border text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-4xl font-heading font-medium text-foreground mb-4 tracking-tight">
                Start a Community
              </h2>
              
              {isLoggedIn ? (
                <>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {canStartCommunity 
                      ? `Create a community for your city and be the first member.`
                      : `A community already exists for ${userCity}, ${userState}. Join it to connect with your neighbors!`}
                  </p>
                  
                  {canStartCommunity ? (
                    <Button
                      onClick={handleStartCommunityClick}
                      size="lg"
                      className="bg-primary text-primary-foreground px-12 py-4"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Start a Community
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/pricing')}
                      size="lg"
                      className="bg-primary text-primary-foreground px-12 py-4"
                    >
                      Join {userCity} Community
                    </Button>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-6">
                    You can only start a community that matches your profile location
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Create a profile to start a community for your city.
                  </p>
                  
                  <Button
                    onClick={() => navigate('/add-listing', { state: { communityOnly: true } })}
                    size="lg"
                    className="bg-primary text-primary-foreground px-12 py-4"
                  >
                    Create Profile
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-6">
                    Communities can only be started by verified members
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Create Community Modal */}
      <Dialog open={showCreateCommunityModal} onOpenChange={setShowCreateCommunityModal}>
        <DialogContent className="bg-card text-card-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading font-medium text-foreground tracking-tight">
              Start a Community
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter the city name to create a community. It must match the city on your profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCommunity} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="communityCity" className="text-foreground">
                City Name *
              </Label>
              <Input
                id="communityCity"
                placeholder="Enter city name"
                value={newCommunityCity}
                onChange={(e) => setNewCommunityCity(e.target.value)}
                required
                className="bg-background text-foreground border-border"
              />
              <p className="text-xs text-muted-foreground">
                Your profile location: {userCity}, {userState}
              </p>
            </div>

            <Card className="p-4 bg-muted border-border">
              <p className="text-sm text-foreground">
                <strong>Note:</strong> The city must match your profile location. Once created, all forum topics will be available in your community.
              </p>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateCommunityModal(false);
                  setNewCommunityCity('');
                }}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Topic Modal */}
      <Dialog open={showCreateTopicModal} onOpenChange={setShowCreateTopicModal}>
        <DialogContent className="bg-card text-card-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading font-medium text-foreground tracking-tight">
              Start a Forum Topic
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new discussion topic for the {userCity}, {userState} community.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTopic} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="topicTitle" className="text-foreground">
                Topic Title *
              </Label>
              <Input
                id="topicTitle"
                placeholder="Enter a clear, descriptive title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                required
                className="bg-background text-foreground border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicCategory" className="text-foreground">
                Category *
              </Label>
              <Select value={newTopicCategory} onValueChange={setNewTopicCategory} required>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  {forumCategories.map((category) => (
                    <SelectItem key={category} value={category} className="text-foreground cursor-pointer">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicContent" className="text-foreground">
                Content *
              </Label>
              <Textarea
                id="topicContent"
                placeholder="Describe your topic, question, or announcement..."
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                rows={8}
                required
                className="bg-background text-foreground border-border"
              />
            </div>

            <Card className="p-4 bg-muted border-border">
              <p className="text-sm text-foreground">
                <strong>Community Guidelines:</strong> Be respectful, stay on topic, and maintain discretion. Content that compromises trust will be removed.
              </p>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateTopicModal(false);
                  setNewTopicTitle('');
                  setNewTopicCategory('');
                  setNewTopicContent('');
                }}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Post Topic
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
