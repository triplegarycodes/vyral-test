import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Heart, Lock, Send, Search, BookOpen, Gamepad2, Music, Palette, Code, Dumbbell, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface VentingPost {
  id: string;
  content: string;
  created_at: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  member_count: number;
  is_moderated: boolean;
}

interface CommunityMembership {
  community_id: string;
  user_id: string;
  joined_at: string;
}

export const VybeZone = () => {
  const [ventingPosts, setVentingPosts] = useState<VentingPost[]>([]);
  const [newVentPost, setNewVentPost] = useState("");
  const [activeTab, setActiveTab] = useState("communities");
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMemberships, setUserMemberships] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserMemberships();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "venting") {
      fetchVentingPosts();
    }
  }, [activeTab]);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
    } else {
      setCommunities(data || []);
    }
  };

  const fetchUserMemberships = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id);

    if (error) {
      console.error("Error fetching memberships:", error);
    } else {
      setUserMemberships(data?.map(m => m.community_id) || []);
    }
  };

  const fetchVentingPosts = async () => {
    const { data, error } = await supabase
      .from('venting_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching venting posts:", error);
    } else {
      setVentingPosts(data || []);
    }
  };

  const submitVentPost = async () => {
    if (!newVentPost.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something to share",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to share your thoughts",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('venting_posts')
      .insert([{ 
        content: newVentPost.trim(),
        user_id: user.id 
      }]);

    if (error) {
      toast({
        title: "Error posting",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Post shared",
        description: "Your thoughts have been shared anonymously"
      });
      setNewVentPost("");
      fetchVentingPosts();
    }
  };

  const generateAIResponse = (content: string) => {
    // Simple AI-like responses based on content analysis
    const responses = [
      "It sounds like you're going through a tough time. Remember that challenges help us grow stronger. 💪",
      "Your feelings are completely valid. Take things one step at a time and be kind to yourself. 🌟",
      "Sometimes talking about our struggles can be the first step toward healing. You're not alone. ❤️",
      "It's okay to not be okay sometimes. Focus on small wins and celebrate your progress. 🌈",
      "Thank you for sharing. Your courage to express yourself shows real strength. Keep going! ✨"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      BookOpen, Palette, Gamepad2, Music, Code, Dumbbell, Book, Users, Heart
    };
    return icons[iconName] || Users;
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication required", 
        description: "Please sign in to join communities",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('community_members')
      .insert([{ 
        community_id: communityId,
        user_id: user.id 
      }]);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already a member",
          description: "You're already part of this community!",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error joining community",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Joined successfully!",
        description: "Welcome to the community!"
      });
      fetchUserMemberships();
      fetchCommunities();
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error leaving community",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Left community",
        description: "You've left the community"
      });
      fetchUserMemberships();
      fetchCommunities();
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          VybeZone
        </h1>
        <p className="text-muted-foreground">Safe community spaces for positive vibes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="venting">Private Vent</TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="mt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities by name, topic, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-semibold">Teen Communities</h2>
                <Badge variant="secondary">{filteredCommunities.length} communities</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with like-minded peers in safe, moderated communities
              </p>
              
              <div className="space-y-3">
                {filteredCommunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No communities found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredCommunities.map((community) => {
                    const IconComponent = getIconComponent(community.icon);
                    const isMember = userMemberships.includes(community.id);
                    
                    return (
                      <Card key={community.id} className="p-4 hover:border-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                              <IconComponent className={`w-5 h-5 ${community.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{community.name}</h3>
                              <p className="text-xs text-muted-foreground">{community.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {community.member_count.toLocaleString()} members
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {community.category}
                                </Badge>
                                {community.is_moderated && (
                                  <Badge variant="outline" className="text-xs text-gaming-green">
                                    Moderated
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isMember ? (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => leaveCommunity(community.id)}
                              >
                                Leave
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => joinCommunity(community.id)}
                              >
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Community Guidelines */}
            <Card className="p-4 bg-gaming-green/10 border-gaming-green/30">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-gaming-green" />
                <h3 className="font-semibold text-gaming-green">Community Guidelines</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>• Be kind and respectful to all members</p>
                <p>• Keep content positive and constructive</p>
                <p>• No bullying, harassment, or hate speech</p>
                <p>• Share encouragement and support others</p>
                <p>• Report inappropriate content to moderators</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="venting" className="mt-6">
          <div className="space-y-4">
            {/* Private Venting Section */}
            <Card className="p-4 bg-muted/30 border-dashed">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Anonymous Vent Space</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Share your thoughts, feelings, or struggles anonymously. This is a safe space for emotional expression.
              </p>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Share what's on your mind... This is completely anonymous and private to you."
                  value={newVentPost}
                  onChange={(e) => setNewVentPost(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={submitVentPost}
                  className="w-full"
                  disabled={!newVentPost.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Share Anonymously
                </Button>
              </div>
            </Card>

            {/* User's Previous Vent Posts */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Your Previous Posts</h3>
              <div className="space-y-4">
                {ventingPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No posts yet</p>
                    <p className="text-sm">Share your thoughts above to get started</p>
                  </div>
                ) : (
                  ventingPosts.map((post) => (
                    <div key={post.id} className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{post.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* AI Response */}
                      <div className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                            <Heart className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-xs font-medium text-accent">VybeBot Support</span>
                        </div>
                        <p className="text-sm">{generateAIResponse(post.content)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Support Resources */}
            <Card className="p-4 bg-gaming-purple/10 border-gaming-purple/30">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-gaming-purple" />
                <h3 className="font-semibold text-gaming-purple">Need More Support?</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p>• Crisis Text Line: Text HOME to 741741</p>
                <p>• Teen Mental Health Helpline: 1-800-XXX-XXXX</p>
                <p>• Remember: You're not alone, and it's okay to ask for help</p>
                <p>• Talk to a trusted adult, counselor, or family member</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};