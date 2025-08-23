import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Shuffle, Brain, Zap, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VybeStrykeScenario {
  id: number;
  title: string;
  situation: string;
  choices: {
    text: string;
    isCorrect: boolean;
    vcoins?: number;
  }[];
}

const scenarios: VybeStrykeScenario[] = [
  {
    id: 1,
    title: "Late Night Loop",
    situation: "It's midnight. You're doom-scrolling instead of sleeping. A test is tomorrow.",
    choices: [
      { text: "Why am I still awake? Ughhh... I'll just cram all night and hope for the best.", isCorrect: false },
      { text: "Time to hit the hay, I'm gonna crush this test! A good night's sleep is my secret weapon.", isCorrect: true, vcoins: 50 },
      { text: "Let's get this test over with! Time to stay up all night and cram everything in.", isCorrect: false },
      { text: "One more TikTok won't hurt... I can study in the morning during breakfast.", isCorrect: false }
    ]
  },
  {
    id: 2,
    title: "Pop Quiz Panic", 
    situation: "You're hit with a surprise quiz in your hardest class. You only studied for a different subject.",
    choices: [
      { text: "Ugh, seriously?! A pop quiz in THIS class? And I just spent all last night studying for history. This is NOT good.", isCorrect: false },
      { text: "Oh, sweet! A pop quiz! I totally vibe with this, even if it's not what I studied. I'm feeling pretty confident, actually.", isCorrect: false },
      { text: "Alright, deep breaths. It's a pop quiz, and I didn't study for this subject. Time to apply what I DO know and focus on the questions I can answer. No use panicking now.", isCorrect: true, vcoins: 50 },
      { text: "I'll just wing it and copy from whoever sits next to me. They probably studied.", isCorrect: false }
    ]
  },
  {
    id: 3,
    title: "Mind Blank Presentation",
    situation: "You're presenting a project you've worked really hard on, and halfway through, you completely blank on your next point, feeling everyone's eyes on you.",
    choices: [
      { text: "Uh, sorry guys, my brain just totally blanked. What was I even talking about?", isCorrect: false },
      { text: "Hold on, I got this. Just a quick brain fart.", isCorrect: false },
      { text: "My apologies, it seems I've momentarily lost my train of thought. Let me quickly collect myself and resume.", isCorrect: true, vcoins: 50 },
      { text: "Um... yeah so... anyone have any questions while I figure out where I was going with this?", isCorrect: false }
    ]
  },
  {
    id: 4,
    title: "The Misread Meme",
    situation: "You text your crush a meme you think is hilarious, but they respond with a confused 'What's that supposed to mean?' and now you're spiraling, wondering if you just ruined everything.",
    choices: [
      { text: "OMG I'm so sorry! I didn't mean it like that at all. It was just a joke, my bad!", isCorrect: false },
      { text: "lol my bad if u didn't get it, but it was just a joke 😂", isCorrect: false },
      { text: "Oh no, I'm really sorry if that came across wrong! I was just trying to be funny, but I totally understand why you'd be upset. My bad.", isCorrect: true, vcoins: 50 },
      { text: "Never mind, forget I sent it. It wasn't that funny anyway.", isCorrect: false }
    ]
  },
  {
    id: 5,
    title: "Group Chat Blowup",
    situation: "You open your phone to see 50+ unread messages in your main friend group chat. Your two best friends are in an all-caps fight about a party invite, and everyone else is taking sides. You get a direct message from one of them saying, 'Are you with me or them?'",
    choices: [
      { text: "Fr like why is everyone so pressed rn chill", isCorrect: false },
      { text: "lol chill everyone, what's good?", isCorrect: false },
      { text: "I'm here to listen if anyone wants to talk it out calmly, but let's take a break from the public drama.", isCorrect: true, vcoins: 50 },
      { text: "I'm staying out of this mess. Y'all figure it out.", isCorrect: false }
    ]
  },
  {
    id: 6,
    title: "Silent Treatment", 
    situation: "You're at a party and your best friend completely ignores you the entire night, then blocks you on social media without a word.",
    choices: [
      { text: "Hey, I've noticed things have been quiet between us. Everything okay? I'm here if you want to talk.", isCorrect: true, vcoins: 50 },
      { text: "K, bye then. Guess we're not friends anymore.", isCorrect: false },
      { text: "I'm not sure what happened, but I'm going to respect your silence. If you ever want to reconnect, you know where to find me.", isCorrect: false },
      { text: "Two can play this game. I'll block them back and see how they like it.", isCorrect: false }
    ]
  },
  {
    id: 7,
    title: "Party Pressure",
    situation: "You're at a party, and someone you barely know hands you a red solo cup, saying 'Take a sip!' Your crush is looking right at you, and you feel everyone's eyes on you, waiting to see what you'll do.",
    choices: [
      { text: "I need some time to think about this. Can we slow down a bit?", isCorrect: false },
      { text: "Woah, slow down there! I'm not really into rushing things.", isCorrect: false },
      { text: "Nah, I'm good. Thanks though! Just sticking to water tonight.", isCorrect: true, vcoins: 50 },
      { text: "Sure, why not? It's just one drink.", isCorrect: false }
    ]
  },
  {
    id: 8,
    title: "New Romance Rumble",
    situation: "You're navigating feelings for two different people at school, one who's super outgoing and the other who's more reserved, and you're constantly worried about hurting someone or sending mixed signals.",
    choices: [
      { text: "Bruh, this is so awkward. Like, why do I gotta choose? Can't I just chill with both?", isCorrect: false },
      { text: "OMG, this is so stressful! How am I supposed to pick just one? I feel like I'm gonna mess everything up.", isCorrect: false },
      { text: "I'm gonna take some time to get to know both of them better, without putting any pressure on myself to choose right now. See where things naturally lead.", isCorrect: true, vcoins: 50 },
      { text: "I'll just string them both along until I figure out which one I like more.", isCorrect: false }
    ]
  },
  {
    id: 9,
    title: "Public Breakup Blues",
    situation: "You're at the busiest lunch table, and your partner suddenly announces they're breaking up with you, right in front of everyone.",
    choices: [
      { text: "Bruh, really? In front of everyone? This is so awkward.", isCorrect: false },
      { text: "Good to know. Saved me the trouble later, I guess.", isCorrect: false },
      { text: "I wish you all the best. I'm going to grab a coffee, anyone want anything?", isCorrect: true, vcoins: 50 },
      { text: "Are you serious right now? You couldn't wait until we were alone?", isCorrect: false }
    ]
  },
  {
    id: 10,
    title: "Scholarship Secret",
    situation: "You've been secretly applying for scholarships, and you just got an email saying you won a big one, but you haven't told your parents you applied.",
    choices: [
      { text: "I'll just keep it secret until graduation and surprise them then.", isCorrect: false },
      { text: "Time to come clean and share the good news! They'll be proud even if they're surprised.", isCorrect: true, vcoins: 50 },
      { text: "I'll tell them I just heard about this scholarship today and applied on a whim.", isCorrect: false },
      { text: "Maybe I'll wait until I actually need the money for college to tell them.", isCorrect: false }
    ]
  }
];

export const VybeStryke = () => {
  const [currentScenario, setCurrentScenario] = useState<VybeStrykeScenario | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalVCoins, setTotalVCoins] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    generateNewScenario();
  }, []);

  const generateNewScenario = () => {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentScenario(randomScenario);
    setSelectedChoice(null);
    setShowResult(false);
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    if (selectedChoice !== null) return;
    
    setSelectedChoice(choiceIndex);
    setShowResult(true);
    
    const choice = currentScenario?.choices[choiceIndex];
    if (choice?.isCorrect && choice.vcoins) {
      setTotalVCoins(prev => prev + choice.vcoins);
      toast({
        title: "V-Coins Earned! 🎉",
        description: `You earned ${choice.vcoins} V-Coins for making a wise choice!`,
      });
    }
  };

  if (!currentScenario) return null;

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2 animate-fade-in">
          VybeStryke
        </h1>
        <p className="text-muted-foreground mb-4">Make wise choices and earn V-Coins for the V-Shop</p>
        
        {/* V-Coins Display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-yellow-600">{totalVCoins} V-Coins</span>
        </div>
      </div>

      {/* Scenario Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 animate-fade-in text-primary flex items-center gap-2">
            <Star className="w-5 h-5" />
            {currentScenario.title}
          </h2>
          <p className="text-foreground leading-relaxed bg-background/50 p-4 rounded-lg border">
            {currentScenario.situation}
          </p>
        </div>

        {/* Choice Buttons */}
        <div className="space-y-3">
          {currentScenario.choices.map((choice, index) => (
            <Button
              key={index}
              variant={selectedChoice === index ? (choice.isCorrect ? "default" : "destructive") : "outline"}
              className={`w-full text-left justify-start p-4 h-auto whitespace-normal ${
                showResult && choice.isCorrect ? "border-green-500 bg-green-500/10" : ""
              } ${
                showResult && selectedChoice === index && !choice.isCorrect ? "border-red-500 bg-red-500/10" : ""
              }`}
              onClick={() => handleChoiceSelect(index)}
              disabled={selectedChoice !== null}
            >
              <div className="flex items-start gap-3 w-full">
                <span className="font-semibold min-w-6 text-center bg-muted rounded px-2 py-1 text-xs">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm leading-relaxed">{choice.text}</span>
                {showResult && choice.isCorrect && (
                  <div className="ml-auto flex items-center gap-1 text-green-600">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs font-semibold">+{choice.vcoins}</span>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Result Feedback */}
        {showResult && (
          <div className="mt-6 p-4 rounded-lg border animate-fade-in">
            {selectedChoice !== null && currentScenario.choices[selectedChoice].isCorrect ? (
              <div className="flex items-center gap-2 text-green-600">
                <Zap className="w-5 h-5" />
                <span className="font-semibold">Great choice! You handled that with wisdom and maturity.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="w-5 h-5" />
                <span>That's one way to handle it. Consider how different responses might lead to better outcomes!</span>
              </div>
            )}
          </div>
        )}

        {/* Next Scenario Button */}
        {showResult && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={generateNewScenario}
              variant="gaming"
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Next Scenario
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};