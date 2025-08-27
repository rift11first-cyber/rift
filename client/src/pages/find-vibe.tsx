import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { CharacterAvatar } from '@/components/character-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, CHARACTERS, CharacterTypeValue } from '@shared/schema';
import { MatchResult } from '@/types';
import { Plus, Heart, MapPin, Clock, Calendar, Check, X, MessageCircle, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

// Define types for invitations and notifications
interface Invitation {
  id?: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderCharacter?: CharacterTypeValue;
  senderGender?: string;
  receiverName?: string;
  receiverCharacter?: CharacterTypeValue;
  receiverGender?: string;
  location: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

interface Notification {
  id?: string;
  senderId: string;
  receiverId: string;
  type: 'invitation' | 'connection' | 'message';
  invitationId?: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function FindVibePage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [invitationData, setInvitationData] = useState({
    location: '',
    date: '',
    time: '',
    reason: ''
  });
  const [canSendInvitation, setCanSendInvitation] = useState(true);
  const [connections, setConnections] = useState<User[]>([]);

  useEffect(() => {
    if (!user?.character) return;

    fetchMatches();
    checkInvitationLimit();
    
    // Set up real-time listeners for both sent and received invitations
    if (user) {
      // Query for received invitations
      const receivedInvitationsQuery = query(
        collection(db, 'invitations'),
        where('receiverId', '==', user.id)
      );
      
      // Query for sent invitations
      const sentInvitationsQuery = query(
        collection(db, 'invitations'),
        where('senderId', '==', user.id)
      );
      
      const unsubscribeReceived = onSnapshot(receivedInvitationsQuery, async (snapshot) => {
        const receivedInvitationsData: Invitation[] = [];
        
        for (const docSnapshot of snapshot.docs) {
          const invitationData = { id: docSnapshot.id, ...docSnapshot.data() } as Invitation;
          
          // Fetch sender details
          try {
            const senderDoc = await getDoc(doc(db, 'users', invitationData.senderId));
            if (senderDoc.exists()) {
              const senderData = senderDoc.data() as User;
              invitationData.senderName = senderData.fullName || senderData.username;
              invitationData.senderCharacter = senderData.character;
              invitationData.senderGender = senderData.gender;
            }
          } catch (error) {
            console.error('Error fetching sender details:', error);
          }
          
          receivedInvitationsData.push(invitationData);
        }
        
        setInvitations(prev => {
          const sent = prev.filter(inv => inv.senderId === user.id);
          return [...receivedInvitationsData, ...sent].sort((a, b) => 
            b.createdAt?.toDate().getTime() - a.createdAt?.toDate().getTime()
          );
        });
      });
      
      const unsubscribeSent = onSnapshot(sentInvitationsQuery, async (snapshot) => {
        const sentInvitationsData: Invitation[] = [];
        
        for (const docSnapshot of snapshot.docs) {
          const invitationData = { id: docSnapshot.id, ...docSnapshot.data() } as Invitation;
          
          // Fetch receiver details for sent invitations
          try {
            const receiverDoc = await getDoc(doc(db, 'users', invitationData.receiverId));
            if (receiverDoc.exists()) {
              const receiverData = receiverDoc.data() as User;
              invitationData.receiverName = receiverData.fullName || receiverData.username;
              invitationData.receiverCharacter = receiverData.character;
              invitationData.receiverGender = receiverData.gender;
            }
          } catch (error) {
            console.error('Error fetching receiver details:', error);
          }
          
          sentInvitationsData.push(invitationData);
        }
        
        setInvitations(prev => {
          const received = prev.filter(inv => inv.receiverId === user.id);
          return [...received, ...sentInvitationsData].sort((a, b) => 
            b.createdAt?.toDate().getTime() - a.createdAt?.toDate().getTime()
          );
        });
      });

      // Set up real-time listener for connections
      if (user.connections && user.connections.length > 0) {
        const connectionsQuery = query(
          collection(db, 'users'),
          where('__name__', 'in', user.connections)
        );
        
        const unsubscribeConnections = onSnapshot(connectionsQuery, (snapshot) => {
          const connectionsData: User[] = [];
          snapshot.forEach((doc) => {
            connectionsData.push({ id: doc.id, ...doc.data() } as User);
          });
          setConnections(connectionsData);
        });
        
        return () => {
          unsubscribeReceived();
          unsubscribeSent();
          unsubscribeConnections();
        };
      }
      
      return () => {
        unsubscribeReceived();
        unsubscribeSent();
      };
    }
  }, [user]);

  const checkInvitationLimit = async () => {
    if (!user) return;
    
    try {
      // Check if user has sent an invitation in the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const invitationsQuery = query(
        collection(db, 'invitations'),
        where('senderId', '==', user.id),
        where('createdAt', '>=', oneWeekAgo)
      );
      
      const invitationsSnapshot = await getDocs(invitationsQuery);
      setCanSendInvitation(invitationsSnapshot.empty);
    } catch (error) {
      console.error('Error checking invitation limit:', error);
    }
  };

  const fetchMatches = async () => {
    if (!user?.character) return;

    try {
      // Get all users from the same college excluding current user
      const usersQuery = query(
        collection(db, 'users'),
        where('college', '==', user.college),
        where('profileComplete', '==', true),
        limit(50)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as User)
        .filter(u => u.id !== user.id && u.character);

      // Implement 2:1 matching algorithm
      const differentCharacterUsers = allUsers.filter(u => u.character !== user.character);
      const sameCharacterUsers = allUsers.filter(u => u.character === user.character);

      // Calculate match percentages (simplified)
      const calculateMatchPercentage = (targetUser: User): number => {
        if (targetUser.character === user.character) return 95; // Same character high compatibility
        
        // Different character compatibility based on character traits
        const compatibilityMap: Record<CharacterTypeValue, CharacterTypeValue[]> = {
          strategist: ['explorer', 'visionary'],
          explorer: ['strategist', 'dreamer'], 
          guardian: ['healer', 'connector'],
          maverick: ['rebel', 'artist'],
          artist: ['maverick', 'dreamer'],
          visionary: ['strategist', 'rebel'],
          healer: ['guardian', 'connector'],
          rebel: ['maverick', 'visionary'],
          dreamer: ['explorer', 'artist'],
          connector: ['healer', 'guardian']
        };

        if (user.character && compatibilityMap[user.character]?.includes(targetUser.character!)) {
          return Math.floor(Math.random() * 20) + 75; // 75-95%
        }
        return Math.floor(Math.random() * 25) + 50; // 50-75%
      };

      // Select 2 different characters and 1 same character
      const selectedDifferent = differentCharacterUsers
        .slice(0, 2)
        .map(u => ({
          user: {
            id: u.id,
            name: u.fullName || u.username,
            character: u.character!,
            gender: u.gender || 'Not specified',
            matchPercentage: calculateMatchPercentage(u)
          },
          matchType: 'different' as const
        }));

      const selectedSame = sameCharacterUsers
        .slice(0, 1)
        .map(u => ({
          user: {
            id: u.id,
            name: u.fullName || u.username,
            character: u.character!,
            gender: u.gender || 'Not specified',
            matchPercentage: calculateMatchPercentage(u)
          },
          matchType: 'same' as const
        }));

      setMatches([...selectedDifferent, ...selectedSame]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!user || !selectedMatch || !canSendInvitation) return;
    
    try {
      // Create invitation
      await addDoc(collection(db, 'invitations'), {
        senderId: user.id,
        receiverId: selectedMatch.user.id,
        location: invitationData.location,
        date: invitationData.date,
        time: invitationData.time,
        reason: invitationData.reason,
        status: 'pending',
        createdAt: serverTimestamp()
      } as Invitation);

      // Create notification for the receiver
      await addDoc(collection(db, 'notifications'), {
        senderId: user.id,
        receiverId: selectedMatch.user.id,
        type: 'invitation',
        message: `${user.fullName || user.username} sent you a meeting invitation!`,
        read: false,
        createdAt: serverTimestamp()
      } as Notification);

      // Update invitation limit
      setCanSendInvitation(false);
      
      // Reset form and close dialog
      setInvitationData({
        location: '',
        date: '',
        time: '',
        reason: ''
      });
      setInvitationDialogOpen(false);
      
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const handleInvitationResponse = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      const invitationRef = doc(db, 'invitations', invitationId);
      await updateDoc(invitationRef, {
        status: response
      });
      
      if (response === 'accepted') {
        // Create connection for both users
        const invitationDoc = await getDoc(invitationRef);
        const invitationData = invitationDoc.data() as Invitation;
        
        // Update both users' connections
        const senderRef = doc(db, 'users', invitationData.senderId);
        const receiverRef = doc(db, 'users', invitationData.receiverId);
        
        // Use transaction or batch write for atomicity
        const senderDoc = await getDoc(senderRef);
        const receiverDoc = await getDoc(receiverRef);
        
        if (senderDoc.exists() && receiverDoc.exists()) {
          const senderData = senderDoc.data() as User;
          const receiverData = receiverDoc.data() as User;
          
          // Add to connections array if it doesn't exist
          const senderConnections = senderData.connections || [];
          const receiverConnections = receiverData.connections || [];
          
          if (!senderConnections.includes(invitationData.receiverId)) {
            await updateDoc(senderRef, {
              connections: [...senderConnections, invitationData.receiverId]
            });
          }
          
          if (!receiverConnections.includes(invitationData.senderId)) {
            await updateDoc(receiverRef, {
              connections: [...receiverConnections, invitationData.senderId]
            });
          }
        }

        // Create notification for the sender
        await addDoc(collection(db, 'notifications'), {
          senderId: user!.id,
          receiverId: invitationData.senderId,
          type: 'connection',
          message: `${user!.fullName || user!.username} accepted your meeting invitation!`,
          read: false,
          createdAt: serverTimestamp()
        } as Notification);
      }
      
      alert(`Invitation ${response}!`);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Failed to respond to invitation. Please try again.');
    }
  };

  const handleLike = async (match: MatchResult) => {
    if (!user) return;
    
    try {
      // Create a like notification
      await addDoc(collection(db, 'notifications'), {
        senderId: user.id,
        receiverId: match.user.id,
        type: 'connection',
        message: `${user.fullName || user.username} liked your profile!`,
        read: false,
        createdAt: serverTimestamp()
      } as Notification);
      
      alert('Like sent!');
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  if (!user?.profileComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find Your Vibe</h1>
            <p className="text-muted-foreground">
              Discover a person who matches your vibe and start a meaningful connection!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Finding your perfect matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                To find a perfect match make sure to invite more friends from your college to join Flick!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <Card key={match.user.id} className="hover:shadow-lg transition-shadow" data-testid={`card-match-${index}`}>
                <CardContent className="p-6 text-center">
                  <CharacterAvatar 
                    character={match.user.character as CharacterTypeValue} 
                    size="lg" 
                    className="mx-auto mb-4"
                  />
                  
                  <h3 className="font-semibold mb-2" data-testid={`text-match-name-${index}`}>
                    {match.user.name}
                  </h3>
                  
                  {/* Display gender information */}
                  <div className="flex items-center justify-center text-sm text-muted-foreground mb-3">
                    <UserIcon className="h-3 w-3 mr-1" />
                    <span>{match.user.gender}</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Badge variant={match.matchType === 'same' ? 'secondary' : 'default'}>
                      {CHARACTERS[match.user.character as CharacterTypeValue].name}
                    </Badge>
                    <Badge variant="outline">
                      {match.user.matchPercentage}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {CHARACTERS[match.user.character as CharacterTypeValue].traits.join(' • ')}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="flex-1" 
                          size="sm" 
                          data-testid={`button-connect-${index}`}
                          disabled={!canSendInvitation}
                          onClick={() => setSelectedMatch(match)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Meeting Invitation to {match.user.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="e.g., Campus Cafe, Library, etc."
                              value={invitationData.location}
                              onChange={(e) => setInvitationData({...invitationData, location: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="date">Date</Label>
                              <Input
                                id="date"
                                type="date"
                                value={invitationData.date}
                                onChange={(e) => setInvitationData({...invitationData, date: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="time">Time</Label>
                              <Input
                                id="time"
                                type="time"
                                value={invitationData.time}
                                onChange={(e) => setInvitationData({...invitationData, time: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="reason">Reason for Meeting</Label>
                            <Textarea
                              id="reason"
                              placeholder="Tell them why you'd like to meet..."
                              value={invitationData.reason}
                              onChange={(e) => setInvitationData({...invitationData, reason: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSendInvitation} disabled={!invitationData.location || !invitationData.date || !invitationData.time}>
                            Send Invitation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      data-testid={`button-like-${index}`}
                      onClick={() => handleLike(match)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {match.matchType === 'same' && (
                    <div className="mt-3 text-xs text-secondary">
                      <span className="bg-secondary/20 px-2 py-1 rounded">Similar Mind</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Your Connections - Now includes invitations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Your Connections</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pending Invitations Received */}
            {invitations.filter(inv => inv.status === 'pending' && inv.receiverId === user.id).length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Pending Invitations</h4>
                <div className="space-y-3">
                  {invitations.filter(inv => inv.status === 'pending' && inv.receiverId === user.id).map((invitation) => (
                    <div key={invitation.id} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {invitation.senderCharacter && (
                            <CharacterAvatar 
                              character={invitation.senderCharacter} 
                              size="sm" 
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold">{invitation.senderName || 'Someone'}</span>
                              <Badge variant="outline" className="text-xs">
                                Invitation
                              </Badge>
                            </div>
                            {invitation.senderGender && (
                              <div className="text-xs text-muted-foreground mb-1">
                                <UserIcon className="h-3 w-3 inline mr-1" />
                                {invitation.senderGender}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mb-2">
                              {invitation.reason}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{invitation.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(invitation.date), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{invitation.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleInvitationResponse(invitation.id!, 'accepted')}
                            className="px-3"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleInvitationResponse(invitation.id!, 'declined')}
                            className="px-3"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Invitations Sent */}
            {invitations.filter(inv => inv.status === 'pending' && inv.senderId === user.id).length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Sent Invitations</h4>
                <div className="space-y-3">
                  {invitations.filter(inv => inv.status === 'pending' && inv.senderId === user.id).map((invitation) => (
                    <div key={invitation.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {invitation.receiverCharacter && (
                            <CharacterAvatar 
                              character={invitation.receiverCharacter} 
                              size="sm" 
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold">You invited {invitation.receiverName || 'Someone'}</span>
                              <Badge variant="outline" className="text-xs">
                                Waiting for response
                              </Badge>
                            </div>
                            {invitation.receiverGender && (
                              <div className="text-xs text-muted-foreground mb-1">
                                <UserIcon className="h-3 w-3 inline mr-1" />
                                {invitation.receiverGender}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mb-2">
                              {invitation.reason}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{invitation.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(invitation.date), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{invitation.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Invitations */}
            {invitations.filter(inv => inv.status === 'accepted').length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Accepted Connections</h4>
                <div className="space-y-3">
                  {invitations.filter(inv => inv.status === 'accepted').map((invitation) => {
                    const isReceiver = invitation.receiverId === user.id;
                    const displayName = isReceiver 
                      ? invitation.senderName || 'Connected User'
                      : `You connected with ${invitation.receiverName || 'Someone'}`;
                    
                    return (
                      <div key={invitation.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {isReceiver ? (
                            invitation.senderCharacter && (
                              <CharacterAvatar 
                                character={invitation.senderCharacter} 
                                size="sm" 
                              />
                            )
                          ) : (
                            invitation.receiverCharacter && (
                              <CharacterAvatar 
                                character={invitation.receiverCharacter} 
                                size="sm" 
                              />
                            )
                          )}
                          <div>
                            <span className="font-medium">{displayName}</span>
                            {isReceiver ? (
                              invitation.senderGender && (
                                <div className="text-xs text-muted-foreground">
                                  <UserIcon className="h-3 w-3 inline mr-1" />
                                  {invitation.senderGender}
                                </div>
                              )
                            ) : (
                              invitation.receiverGender && (
                                <div className="text-xs text-muted-foreground">
                                  <UserIcon className="h-3 w-3 inline mr-1" />
                                  {invitation.receiverGender}
                                </div>
                              )
                            )}
                            <div className="text-xs text-muted-foreground">
                              Meeting at {invitation.location} on {format(new Date(invitation.date), 'MMM d')} at {invitation.time}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Existing Connections */}
            {connections.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Previous Connections</h4>
                <div className="space-y-3">
                  {connections.slice(0, 3).map((connection, index) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CharacterAvatar 
                          character={connection.character as CharacterTypeValue} 
                          size="sm" 
                        />
                        <div>
                          <span className="font-medium">{connection.fullName || connection.username}</span>
                          {connection.gender && (
                            <div className="text-xs text-muted-foreground">
                              <UserIcon className="h-3 w-3 inline mr-1" />
                              {connection.gender}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {connections.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{connections.length - 3} more connections
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {invitations.length === 0 && connections.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🤝</div>
                <p className="text-muted-foreground">No connections yet</p>
                <p className="text-sm text-muted-foreground">Start connecting with your matches above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="h-20 md:hidden" />
    </div>
  );
} 