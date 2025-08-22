import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shuffle, Brain, Zap } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  options: [string, string, string];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "Late Night Loop - It's midnight. You're doom-scrolling instead of sleeping. A test is tomorrow",
    options: [
      "Why am I still awake Ughhh...",
      "Time to hit the hay, I'm gonna crush this test!",
      "Let's get this test over with! Time to stay up all night and cram."
    ]
  },
  {
    id: 2,
    title: "Pop Quiz Panic - You're hit with a surprise quiz in your hardest class. You only studied for a different subject.",
    options: [
      "Ugh, seriously?! A pop quiz in *this* class? And I just spent all last night studying for history. This is NOT good.",
      "Oh, sweet! A pop quiz! I totally vibe with this, even if it's not what I studied. I'm feeling pretty confident, actually.",
      "Alright, deep breaths. It's a pop quiz, and I didn't study for *this* subject. Time to apply what I *do* know and focus on the questions I can answer. No use panicking now."
    ]
  },
  {
    id: 3,
    title: "Mind Blank During Presentation - You're mid-sentence in front of the class and suddenly forget everything",
    options: [
      "Uh, sorry guys, my brain just totally blanked. What was I even talking about?",
      "Hold on, I got this. Just a quick brain fart.",
      "My apologies, it seems I've momentarily lost my train of thought. Let me quickly collect myself and resume."
    ]
  },
  {
    id: 4,
    title: "The Misread Text - You text someone a joke. They misinterpret it and get upset.",
    options: [
      "OMG I'm so sorry! I didn't mean it like that at all. It was just a joke, my bad!",
      "lol my bad if u didn't get it, but it was just a joke 😂",
      "Oh no, I'm really sorry if that came across wrong! I was just trying to be funny, but I totally understand why you'd be upset. My bad."
    ]
  },
  {
    id: 5,
    title: "Group Chat Blowup - Your group chat is imploding with drama and your name gets mentioned.",
    options: [
      "Fr like why is everyone so pressed rn chill",
      "lol chill everyone, what's good?",
      "I'm here to listen if anyone wants to talk it out calmly, but let's take a break from the public drama."
    ]
  },
  {
    id: 6,
    title: "They Ghosted You - A close friend stops talking to you with no explanation.",
    options: [
      "Hey, I've noticed things have been quiet between us. Everything okay? I'm here if you want to talk.",
      "K, bye then. Guess we're not friends anymore.",
      "I'm not sure what happened, but I'm going to respect your silence. If you ever want to reconnect, you know where to find me."
    ]
  },
  {
    id: 7,
    title: "Too Fast, Too Soon - Someone you like starts pushing you to open up fast emotionally or physically.",
    options: [
      "I need some time to think about this. Can we slow down a bit?",
      "Woah, slow down there! I'm not really into rushing things.",
      "I appreciate your enthusiasm, but I prefer to take things at a pace that feels comfortable for both of us."
    ]
  },
  {
    id: 8,
    title: "Caught Between Two Crushes - You're vibing with two different people at the same time.",
    options: [
      "Bruh, this is so awkward. Like, why do I gotta choose? Can't I just chill with both?",
      "OMG, this is so stressful! How am I supposed to pick just one? I feel like I'm gonna mess everything up.",
      "I'm gonna take some time to get to know both of them better, without putting any pressure on myself to choose right now. See where things naturally lead."
    ]
  },
  {
    id: 9,
    title: "Breakup in Public - Someone breaks up with you in front of people at lunch.",
    options: [
      "Bruh, really? In front of everyone? This is so awkward.",
      "Good to know. Saved me the trouble later, I guess.",
      "I wish you all the best. I'm going to grab a coffee, anyone want anything?"
    ]
  },
  {
    id: 10,
    title: "Everyone Else Got In - You're the only one who didn't make the team or club.",
    options: [
      "This sucks, but I guess I'll just have to try something else.",
      "Bummer! That totally stinks, but don't let it get you down. There are tons of other cool things to try.",
      "That's tough, but remember, one door closing often means another one opens. This is a chance to explore new interests and discover hidden talents you didn't even know you had."
    ]
  }
];

export const VybeStryke = () => {
  const [currentScenarios, setCurrentScenarios] = useState<Scenario[]>([]);
  const [selectedResponses, setSelectedResponses] = useState<{[key: number]: number}>({});

  useEffect(() => {
    generateRandomScenarios();
  }, []);

  const generateRandomScenarios = () => {
    // Shuffle scenarios and pick 5 random ones
    const shuffled = [...scenarios].sort(() => Math.random() - 0.5);
    setCurrentScenarios(shuffled.slice(0, 5));
    setSelectedResponses({});
  };

  const handleResponseSelect = (scenarioId: number, optionIndex: number) => {
    setSelectedResponses(prev => ({
      ...prev,
      [scenarioId]: optionIndex
    }));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-gaming font-bold gradient-primary bg-clip-text text-transparent mb-2">
          VybeStryke
        </h1>
        <p className="text-muted-foreground">Navigate life scenarios and discover your response style</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-6">
        <Button 
          onClick={generateRandomScenarios}
          variant="gaming"
          className="flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          New Scenarios
        </Button>
      </div>

      {/* Scenarios Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Scenario</TableHead>
              <TableHead className="w-1/4">Option 1</TableHead>
              <TableHead className="w-1/4">Option 2</TableHead>
              <TableHead className="w-1/4">Option 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentScenarios.map((scenario) => (
              <TableRow key={scenario.id}>
                <TableCell className="font-medium align-top">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{scenario.title}</span>
                  </div>
                </TableCell>
                {scenario.options.map((option, index) => (
                  <TableCell key={index} className="align-top">
                    <Button
                      variant={selectedResponses[scenario.id] === index ? "default" : "ghost"}
                      size="sm"
                      className="h-auto p-3 text-left justify-start whitespace-normal"
                      onClick={() => handleResponseSelect(scenario.id, index)}
                    >
                      <span className="text-xs leading-relaxed">{option}</span>
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Response Summary */}
      {Object.keys(selectedResponses).length > 0 && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Your Response Pattern</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            You've responded to {Object.keys(selectedResponses).length} out of {currentScenarios.length} scenarios. 
            Each choice reveals something about how you handle different situations!
          </p>
        </Card>
      )}
    </div>
  );
};