import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageSquare, Share2, Plus, Palette, Music, Camera, Code, Pen, Flag, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreativePost {
  id: string;
  title: string;
  content: string;
  post_type: string;
  media_urls?: string[];
  tags?: string[];
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  moderation_status: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
  user_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
  };
}

export const BVyral = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CreativePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CreativePost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [postType, setPostType] = useState("art");
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('creative_posts')
      .select(`
        *,
        profiles!creative_posts_user_id_fkey (username, display_name, avatar_url)
      `)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      // Check which posts the current user has liked
      if (user) {
        const { data: likes } = await supabase
          .from('creative_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data.map(p => p.id));

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        
        const postsWithLikes = data.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
          profiles: post.profiles || { username: null, display_name: null, avatar_url: null }
        }));
        
        setPosts(postsWithLikes as CreativePost[]);
      } else {
        const postsWithDefaults = data.map(post => ({
          ...post,
          user_liked: false,
          profiles: post.profiles || { username: null, display_name: null, avatar_url: null }
        }));
        
        setPosts(postsWithDefaults as CreativePost[]);
      }
    }
    setLoading(false);
  };

  const moderateContent = (text: string): boolean => {
    // Basic content moderation - check for inappropriate content
    const bannedWords = ['spam', 'hate', 'inappropriate']; // This would be more comprehensive in real app
    const lowerText = text.toLowerCase();
    return !bannedWords.some(word => lowerText.includes(word));
  };

  const createPost = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create posts",
        variant: "destructive"
      });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add both a title and content",
        variant: "destructive"
      });
      return;
    }

    // Moderate content
    if (!moderateContent(newPost.title + " " + newPost.content)) {
      toast({
        title: "Content flagged",
        description: "Your post contains inappropriate content and cannot be published",
        variant: "destructive"
      });
      return;
    }

    const tags = newPost.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const { error } = await supabase
      .from('creative_posts')
      .insert({
        title: newPost.title,
        content: newPost.content,
        post_type: postType,
        tags: tags,
        user_id: user.id,
        moderation_status: 'approved' // In real app, this would be 'pending'
      });

    if (error) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Post created! 🎨",
        description: "Your creative work has been shared with the community"
      });
      setNewPost({ title: "", content: "", tags: "" });
      setShowCreatePost(false);
      fetchPosts();
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.user_liked) {
      // Unlike
      const { error } = await supabase
        .from('creative_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count - 1, user_liked: false }
            : p
        ));
      }
    } else {
      // Like
      const { error } = await supabase
        .from('creative_post_likes')
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes_count: p.likes_count + 1, user_liked: true }
            : p
        ));
      }
    }
  };

  const openComments = async (post: CreativePost) => {
    setSelectedPost(post);
    
    const { data, error } = await supabase
      .from('creative_post_comments')
      .select(`
        *,
        profiles!creative_post_comments_user_id_fkey (username, display_name)
      `)
      .eq('post_id', post.id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else if (data) {
      const commentsWithProfiles = data.map(comment => ({
        ...comment,
        profiles: comment.profiles || { username: 'Anonymous', display_name: 'Anonymous' }
      }));
      setComments(commentsWithProfiles as Comment[]);
    }
  };

  const addComment = async () => {
    if (!user || !selectedPost || !newComment.trim()) return;

    // Moderate comment content
    if (!moderateContent(newComment)) {
      toast({
        title: "Comment flagged",
        description: "Your comment contains inappropriate content",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('creative_post_comments')
      .insert({
        post_id: selectedPost.id,
        user_id: user.id,
        content: newComment,
        moderation_status: 'approved' // In real app, this would be 'pending'
      });

    if (error) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Comment added! 💬",
        description: "Your comment has been posted"
      });
      setNewComment("");
      openComments(selectedPost); // Refresh comments
      
      // Update comment count in posts
      setPosts(prev => prev.map(p => 
        p.id === selectedPost.id 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));
    }
  };

  const reportPost = async (postId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('moderation_flags')
      .insert({
        reporter_id: user.id,
        content_id: postId,
        content_type: 'creative_post',
        reason: 'inappropriate_content',
        description: 'User reported this post as inappropriate'
      });

    if (error) {
      toast({
        title: "Error reporting post",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Post reported",
        description: "Thank you for helping keep our community safe"
      });
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'art': return <Palette className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      case 'photography': return <Camera className="w-4 h-4" />;
      case 'writing': return <Pen className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  const filteredPosts = activeTab === 'featured' 
    ? posts.filter(p => p.is_featured)
    : posts;

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
            B-Vyral
          </h1>
          <p className="text-muted-foreground">Loading creative content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          B-Vyral
        </h1>
        <p className="text-muted-foreground">Share your creativity with the world</p>
      </div>

      {/* Create Post Button */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="gaming">
            <Plus className="w-4 h-4 mr-2" />
            Share Your Creation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gaming-purple" />
              Create New Post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="art">🎨 Art & Design</SelectItem>
                  <SelectItem value="music">🎵 Music</SelectItem>
                  <SelectItem value="writing">✍️ Writing</SelectItem>
                  <SelectItem value="photography">📸 Photography</SelectItem>
                  <SelectItem value="code">💻 Code Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                placeholder="Give your creation a title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Tell us about your creative process, inspiration, or techniques..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>

            <div>
              <Label>Tags (optional)</Label>
              <Input
                placeholder="digital art, portrait, experimental..."
                value={newPost.tags}
                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createPost} className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                Share Creation
              </Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Recent</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share your creativity!
                </p>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="p-4 hover:border-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gaming-purple to-accent flex items-center justify-center">
                        {post.profiles?.avatar_url ? (
                          <img 
                            src={post.profiles.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {(post.profiles?.display_name || post.profiles?.username || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {post.profiles?.display_name || post.profiles?.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getPostTypeIcon(post.post_type)}
                        <span className="ml-1 capitalize">{post.post_type}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reportPost(post.id)}
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{post.content}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(post.id)}
                        className={post.user_liked ? "text-red-500" : ""}
                      >
                        <Heart className={`w-4 h-4 mr-1 ${post.user_liked ? "fill-current" : ""}`} />
                        {post.likes_count}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openComments(post)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {post.comments_count}
                      </Button>
                    </div>

                    {post.is_featured && (
                      <Badge className="bg-gaming-orange text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Comments Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-semibold">{selectedPost.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedPost.content}</p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gaming-purple to-accent flex items-center justify-center">
                        <span className="text-xs text-white">
                          {(comment.profiles?.display_name || comment.profiles?.username || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {comment.profiles?.display_name || comment.profiles?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>

              {user && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button onClick={addComment} size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};