import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Users, BookOpen, Clock, Plus, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudySession {
  id: string;
  subject: string;
  description: string;
  session_date: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  active: boolean;
  profiles: {
    username: string;
    display_name: string;
  };
}

interface StudySessionWithParticipants extends StudySession {
  study_session_participants: {
    profiles: {
      username: string;
      display_name: string;
    };
  }[];
}

export const VybeLink = () => {
  const [studySessions, setStudySessions] = useState<StudySessionWithParticipants[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: "",
    description: "",
    session_date: "",
    duration_minutes: 60,
    max_participants: 4
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudySessions();
  }, []);

  const fetchStudySessions = async () => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        profiles!study_sessions_user_id_fkey(username, display_name),
        study_session_participants(
          profiles!study_session_participants_user_id_fkey(username, display_name)
        )
      `)
      .eq('active', true)
      .gte('session_date', new Date().toISOString())
      .order('session_date', { ascending: true });

    if (error) {
      toast({
        title: "Error loading study sessions",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setStudySessions(data || []);
    }
  };

  const createStudySession = async () => {
    if (!newSession.subject || !newSession.session_date) {
      toast({
        title: "Missing information",
        description: "Please fill in subject and date",
        variant: "destructive"
      });
      return;
    }

    const sessionDateTime = new Date(`${newSession.session_date}T12:00:00`).toISOString();

    const { error } = await supabase
      .from('study_sessions')
      .insert([{
        subject: newSession.subject,
        description: newSession.description,
        session_date: sessionDateTime,
        duration_minutes: newSession.duration_minutes,
        max_participants: newSession.max_participants
      }]);

    if (error) {
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Study session created!",
        description: "Other students can now join your session"
      });
      setNewSession({
        subject: "",
        description: "",
        session_date: "",
        duration_minutes: 60,
        max_participants: 4
      });
      setShowCreateSession(false);
      fetchStudySessions();
    }
  };

  const joinStudySession = async (sessionId: string) => {
    const { error } = await supabase
      .from('study_session_participants')
      .insert([{ session_id: sessionId }]);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already joined",
          description: "You're already part of this study session",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error joining session",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Joined study session!",
        description: "You've successfully joined the study group"
      });
      fetchStudySessions();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Math': 'text-primary',
      'Science': 'text-gaming-green',
      'English': 'text-gaming-purple',
      'History': 'text-gaming-orange',
      'Computer Science': 'text-accent',
    };
    return colors[subject as keyof typeof colors] || 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          VybeLink
        </h1>
        <p className="text-muted-foreground">Find study buddies and make meaningful connections</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-lg">{studySessions.length}</h3>
          <p className="text-xs text-muted-foreground">Active Sessions</p>
        </Card>
        
        <Card className="p-4 text-center">
          <BookOpen className="w-8 h-8 text-gaming-green mx-auto mb-2" />
          <h3 className="font-semibold text-lg">
            {studySessions.reduce((sum, session) => sum + session.study_session_participants.length, 0)}
          </h3>
          <p className="text-xs text-muted-foreground">Students Connected</p>
        </Card>
      </div>

      {/* Create Session Button */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Study Sessions</h2>
          <Button 
            variant="gaming" 
            size="sm" 
            onClick={() => setShowCreateSession(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Session
          </Button>
        </div>

        {showCreateSession && (
          <Card className="p-4 mb-4 border-accent/30">
            <h3 className="font-semibold mb-3">Create Study Session</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={newSession.subject} onValueChange={(value) => setNewSession({...newSession, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What topics will you cover? What should participants bring?"
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSession.session_date}
                    onChange={(e) => setNewSession({...newSession, session_date: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select 
                    value={newSession.duration_minutes.toString()} 
                    onValueChange={(value) => setNewSession({...newSession, duration_minutes: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Select 
                  value={newSession.max_participants.toString()} 
                  onValueChange={(value) => setNewSession({...newSession, max_participants: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5 people</SelectItem>
                    <SelectItem value="6">6 people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createStudySession} className="flex-1">Create Session</Button>
                <Button variant="outline" onClick={() => setShowCreateSession(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Study Sessions List */}
        <div className="space-y-4">
          {studySessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active study sessions</p>
              <p className="text-sm">Create the first session to get started!</p>
            </div>
          ) : (
            studySessions.map((session) => (
              <Card key={session.id} className="p-4 hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${getSubjectColor(session.subject)}`}>
                        {session.subject}
                      </h3>
                      <Badge variant="secondary">
                        {session.study_session_participants.length}/{session.max_participants} joined
                      </Badge>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(session.session_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        Host: {session.profiles?.display_name || session.profiles?.username || 'Anonymous'}
                      </span>
                    </div>
                    
                    {session.study_session_participants.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {session.study_session_participants.map((participant, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {participant.profiles?.display_name || participant.profiles?.username || 'Student'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant={session.study_session_participants.length >= session.max_participants ? "outline" : "gaming"}
                    size="sm"
                    disabled={session.study_session_participants.length >= session.max_participants}
                    onClick={() => joinStudySession(session.id)}
                  >
                    {session.study_session_participants.length >= session.max_participants ? "Full" : "Join"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Safety Guidelines */}
      <Card className="p-4 bg-gaming-green/10 border-gaming-green/30">
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-6 h-6 text-gaming-green" />
          <h3 className="font-semibold text-gaming-green">Safe Study Guidelines</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p>• Always meet in public spaces (libraries, cafes, school)</p>
          <p>• Let a parent/guardian know your study plans</p>
          <p>• Keep sessions focused on academic goals</p>
          <p>• Report any inappropriate behavior immediately</p>
          <p>• Virtual sessions are available for added safety</p>
        </div>
      </Card>
    </div>
  );
};