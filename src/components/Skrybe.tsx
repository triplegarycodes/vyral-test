import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wand2, Copy, RefreshCw, Zap, BookOpen, Feather, Stars } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AIResponse {
  id: string;
  prompt: string;
  response: string;
  type: string;
  timestamp: string;
}

export const Skrybe = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [selectedType, setSelectedType] = useState("creative");
  const [isGenerating, setIsGenerating] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const { toast } = useToast();

  const promptTypes = [
    { id: 'creative', name: '✨ Creative Writing', description: 'Stories, poems, creative pieces' },
    { id: 'academic', name: '📚 Academic Help', description: 'Essays, research, study guides' },
    { id: 'inspiration', name: '💫 Daily Inspiration', description: 'Motivational quotes and thoughts' },
    { id: 'brainstorm', name: '🧠 Brainstorming', description: 'Ideas, concepts, solutions' },
    { id: 'journal', name: '📔 Journal Prompts', description: 'Self-reflection questions' }
  ];

  // Simulated AI responses since we're doing frontend-only
  const generateMockResponse = (userPrompt: string, type: string): string => {
    const responses = {
      creative: [
        "The old lighthouse stood sentinel against the storm, its beam cutting through the darkness like hope through despair. Sarah had always wondered what secrets it held...",
        "In a world where colors had emotions, blue was melancholy and red was rage. But yellow? Yellow was pure, unbridled joy that danced on sunbeams...",
        "The last bookshop on Earth closed its doors today. But somewhere in the back room, between dusty shelves, a story was still being written..."
      ],
      academic: [
        "When approaching this topic, consider these three key perspectives: Historical context, contemporary relevance, and future implications. Let's break each down...",
        "The relationship between these concepts can be understood through a framework that examines cause, effect, and the interconnected systems at play...",
        "To effectively analyze this subject, we should first establish clear definitions, then examine the evidence, and finally draw logical conclusions..."
      ],
      inspiration: [
        "Your potential is like a seed - it needs nurturing, patience, and the right conditions to bloom. Trust the process, even when growth feels invisible. 🌱",
        "Every challenge you face is secretly strengthening muscles you didn't know you had. You're becoming more resilient with each step forward. ✨",
        "The most beautiful art comes from authentic expression. Your unique perspective is your superpower - don't try to dim it to fit in. Shine brightly! 🌟"
      ],
      brainstorm: [
        "Here are some innovative approaches to consider: 1) Reverse the problem - what if you solved the opposite? 2) Combine unrelated elements 3) Look at it from a child's perspective...",
        "Let's think outside the box: What if budget wasn't a constraint? What if you had unlimited time? What if you approached this like a game?...",
        "Breaking down your challenge: First, identify the core problem. Then, list assumptions you're making. Finally, question each assumption..."
      ],
      journal: [
        "What moment today made you feel most alive? What was happening around you, and how did your body feel in that moment?",
        "If you could send a message to yourself one year ago, what would you want that person to know? What wisdom have you gained?",
        "What fear are you ready to face? Sometimes naming our fears takes away their power over us. What's one small step you could take?"
      ]
    };

    const typeResponses = responses[type as keyof typeof responses] || responses.creative;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  };

  const generateResponse = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to get AI assistance",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use Skrybe",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGlowing(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newResponse: AIResponse = {
      id: Date.now().toString(),
      prompt: prompt,
      response: generateMockResponse(prompt, selectedType),
      type: selectedType,
      timestamp: new Date().toISOString()
    };

    setResponses(prev => [newResponse, ...prev]);
    setPrompt("");
    setIsGenerating(false);
    setGlowing(false);

    toast({
      title: "Response generated! ✨",
      description: "Your AI-powered content is ready"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied! 📋",
      description: "Text copied to clipboard"
    });
  };

  const regenerateResponse = (responseId: string) => {
    setResponses(prev => prev.map(r => 
      r.id === responseId 
        ? { ...r, response: generateMockResponse(r.prompt, r.type) }
        : r
    ));
    
    toast({
      title: "Response regenerated! 🔄",
      description: "New variation created"
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'creative': return <Feather className="w-4 h-4" />;
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'inspiration': return <Stars className="w-4 h-4" />;
      case 'brainstorm': return <Zap className="w-4 h-4" />;
      case 'journal': return <BookOpen className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const selectedTypeInfo = promptTypes.find(t => t.id === selectedType);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          Skrybe
        </h1>
        <p className="text-muted-foreground">AI-powered creative writing companion</p>
      </div>

      {/* Main Input Area */}
      <Card className={`p-6 transition-all duration-500 ${glowing ? 'glow-primary border-primary/50' : 'border-border/50'}`}>
        <div className="space-y-4">
          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Writing Mode</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {promptTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type.id)}
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Type Info */}
          {selectedTypeInfo && (
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                {getTypeIcon(selectedType)}
                <span className="font-medium text-sm">{selectedTypeInfo.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{selectedTypeInfo.description}</p>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Prompt</label>
            <Textarea
              placeholder={
                selectedType === 'creative' ? "Write a story about a character who discovers they can see people's dreams..." :
                selectedType === 'academic' ? "Help me understand the themes in Romeo and Juliet..." :
                selectedType === 'inspiration' ? "I need motivation to overcome challenges..." :
                selectedType === 'brainstorm' ? "Help me come up with ideas for my school project about climate change..." :
                "What should I reflect on to understand myself better?"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className={`transition-all duration-300 ${isGenerating ? 'animate-pulse' : ''}`}
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateResponse}
            disabled={isGenerating || !prompt.trim()}
            className="w-full relative overflow-hidden"
            variant="gaming"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Magic...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
            
            {/* Animated background effect */}
            {isGenerating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-in-right" />
            )}
          </Button>
        </div>
      </Card>

      {/* Responses */}
      <div className="space-y-4">
        {responses.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold mb-2">Ready to Create</h3>
            <p className="text-sm text-muted-foreground">
              Enter a prompt above and let AI help bring your ideas to life!
            </p>
          </Card>
        ) : (
          responses.map((response) => (
            <Card key={response.id} className="p-4 animate-fade-in">
              <div className="space-y-3">
                {/* Response Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(response.type)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {response.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(response.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => regenerateResponse(response.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(response.response)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Original Prompt */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-1">Your Prompt:</p>
                  <p className="text-sm text-muted-foreground">{response.prompt}</p>
                </div>

                {/* AI Response */}
                <div className="p-4 bg-gradient-to-br from-gaming-purple/10 to-accent/10 rounded-lg border border-gaming-purple/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-gaming-purple" />
                    <span className="text-sm font-medium text-gaming-purple">AI Response:</span>
                  </div>
                  <p className="text-sm leading-relaxed">{response.response}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Tips Card */}
      <Card className="p-4 bg-gaming-green/10 border-gaming-green/30">
        <div className="flex items-center gap-3 mb-2">
          <Wand2 className="w-5 h-5 text-gaming-green" />
          <h3 className="font-semibold text-gaming-green">Pro Tips</h3>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>• Be specific - the more details you provide, the better the response</p>
          <p>• Try different writing modes to explore various styles</p>
          <p>• Use the regenerate button to get alternative perspectives</p>
          <p>• Copy responses to build upon them in your own work</p>
        </div>
      </Card>
    </div>
  );
};