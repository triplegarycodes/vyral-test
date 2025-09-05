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
      { text: "One more TikTok won't hurt... I can study in the morning during breakfast.", isCorrect: false },
      { text: "Let me put my phone down and get some sleep. My brain needs rest to perform tomorrow.", isCorrect: true, vcoins: 50 },
      { text: "I'll just cram all night and hope for the best with energy drinks.", isCorrect: false },
      { text: "Maybe I can sleep for 2 hours and then study until the test.", isCorrect: false }
    ]
  },
  {
    id: 2,
    title: "Pop Quiz Panic",
    situation: "You're hit with a surprise quiz in your hardest class. You only studied for a different subject.",
    choices: [
      { text: "I'll just wing it and copy from whoever sits next to me.", isCorrect: false },
      { text: "Take a deep breath and use what I do know. No use panicking now.", isCorrect: true, vcoins: 50 },
      { text: "Ugh seriously?! This is so unfair, I studied for history all night!", isCorrect: false },
      { text: "I'll make up answers that sound smart and hope for partial credit.", isCorrect: false }
    ]
  },
  {
    id: 3,
    title: "Mind Blank During Presentation",
    situation: "You're mid-sentence in front of the class and suddenly forget everything.",
    choices: [
      { text: "Um... sorry guys, my brain just totally blanked. What was I talking about?", isCorrect: false },
      { text: "Let me take a moment to collect my thoughts and continue from where I left off.", isCorrect: true, vcoins: 50 },
      { text: "Anyone have questions while I figure out where I was going with this?", isCorrect: false },
      { text: "I'm just going to start over from the beginning, this is embarrassing.", isCorrect: false }
    ]
  },
  {
    id: 4,
    title: "The Misread Text",
    situation: "You text someone a joke. They misinterpret it and get upset.",
    choices: [
      { text: "Never mind, forget I sent it. It wasn't that funny anyway.", isCorrect: false },
      { text: "I'm sorry that came across wrong! I was trying to be funny but I understand why you're upset.", isCorrect: true, vcoins: 50 },
      { text: "lol my bad if u didn't get it, but it was just a joke 😂", isCorrect: false },
      { text: "You're being way too sensitive, it was obviously a joke.", isCorrect: false }
    ]
  },
  {
    id: 5,
    title: "Group Chat Blowup",
    situation: "Your group chat is imploding with drama and your name gets mentioned.",
    choices: [
      { text: "I'm staying out of this mess. Y'all figure it out.", isCorrect: false },
      { text: "Let's take a break from the drama and talk this out calmly when everyone's cooled down.", isCorrect: true, vcoins: 50 },
      { text: "Why is everyone so pressed right now? Chill out!", isCorrect: false },
      { text: "I can't believe my name got dragged into this. Who said what about me?", isCorrect: false }
    ]
  },
  {
    id: 6,
    title: "They Ghosted You",
    situation: "A close friend stops talking to you with no explanation.",
    choices: [
      { text: "Two can play this game. I'll block them back and see how they like it.", isCorrect: false },
      { text: "I'll give them space but let them know I'm here if they want to talk.", isCorrect: true, vcoins: 50 },
      { text: "K, bye then. Guess we're not friends anymore.", isCorrect: false },
      { text: "I'm going to keep texting until they respond and explain what happened.", isCorrect: false }
    ]
  },
  {
    id: 7,
    title: "Too Fast, Too Soon",
    situation: "Someone you like starts pushing you to open up fast emotionally or physically.",
    choices: [
      { text: "I guess if they really like me, I should go along with what they want.", isCorrect: false },
      { text: "I need to slow things down. I'm not comfortable rushing this.", isCorrect: true, vcoins: 50 },
      { text: "Maybe they'll lose interest if I don't keep up with their pace.", isCorrect: false },
      { text: "I'll just go with it and see what happens.", isCorrect: false }
    ]
  },
  {
    id: 8,
    title: "Caught Between Two Crushes",
    situation: "You're vibing with two different people at the same time.",
    choices: [
      { text: "I'll just string them both along until I figure out which one I like more.", isCorrect: false },
      { text: "I need to be honest with myself about my feelings and not lead anyone on.", isCorrect: true, vcoins: 50 },
      { text: "Can't I just chill with both? Why do I have to choose right now?", isCorrect: false },
      { text: "I'll see which one makes the first move and go with that.", isCorrect: false }
    ]
  },
  {
    id: 9,
    title: "Breakup in Public",
    situation: "Someone breaks up with you in front of people at lunch.",
    choices: [
      { text: "Are you serious right now? You couldn't wait until we were alone?", isCorrect: false },
      { text: "I understand. I hope you find what you're looking for.", isCorrect: true, vcoins: 50 },
      { text: "Good to know. Saved me the trouble later, I guess.", isCorrect: false },
      { text: "This is so awkward, everyone is staring at us.", isCorrect: false }
    ]
  },
  {
    id: 10,
    title: "Everyone Else Got In",
    situation: "You're the only one who didn't make the team or club.",
    choices: [
      { text: "This is so unfair. The selection process must have been rigged.", isCorrect: false },
      { text: "I'm disappointed, but I'll use this as motivation to improve and try again.", isCorrect: true, vcoins: 50 },
      { text: "I never really wanted to be part of it anyway.", isCorrect: false },
      { text: "I'm going to find out exactly why I didn't make it and argue my case.", isCorrect: false }
    ]
  },
  {
    id: 11,
    title: "Comment Section Spiral",
    situation: "Your video goes viral but the comments start roasting you.",
    choices: [
      { text: "I'm going to reply to every single negative comment and defend myself.", isCorrect: false },
      { text: "I'll turn off comments and focus on the positive messages I received.", isCorrect: true, vcoins: 50 },
      { text: "Time to delete everything and pretend this never happened.", isCorrect: false },
      { text: "I'll make another video calling out all the haters.", isCorrect: false }
    ]
  },
  {
    id: 12,
    title: "I'm Not Like Them",
    situation: "You feel fundamentally different from your friend group.",
    choices: [
      { text: "I need to change myself to fit in better with them.", isCorrect: false },
      { text: "It's okay to be different. I'll embrace who I am while maintaining our friendship.", isCorrect: true, vcoins: 50 },
      { text: "I should find new friends who are more like me.", isCorrect: false },
      { text: "I'll just pretend to be someone I'm not when I'm with them.", isCorrect: false }
    ]
  },
  {
    id: 13,
    title: "The GPA Gamble",
    situation: "You're failing a class and need to convince the teacher to help you pass.",
    choices: [
      { text: "I'll make up a sob story about personal problems to get sympathy.", isCorrect: false },
      { text: "I'll be honest about my struggles and ask for specific help to improve.", isCorrect: true, vcoins: 50 },
      { text: "I'll blame the teacher's teaching methods for my poor performance.", isCorrect: false },
      { text: "I'll offer to do extra credit work even if I haven't done the regular work.", isCorrect: false }
    ]
  },
  {
    id: 14,
    title: "Too Many APs",
    situation: "You're overloaded with hard classes but dropping one feels like failure.",
    choices: [
      { text: "I'll just power through and hope I don't burn out completely.", isCorrect: false },
      { text: "It's better to do well in fewer classes than poorly in many. I'll drop one.", isCorrect: true, vcoins: 50 },
      { text: "I'll get tutoring for all my classes and spend every free moment studying.", isCorrect: false },
      { text: "I'll ask friends to help me cheat on assignments to keep up.", isCorrect: false }
    ]
  },
  {
    id: 15,
    title: "Plagiarism Temptation",
    situation: "You forgot your essay and AI is right there to write it for you.",
    choices: [
      { text: "Just this once won't hurt. I'll use AI and edit it a bit.", isCorrect: false },
      { text: "I'll be honest with my teacher about forgetting and ask for an extension.", isCorrect: true, vcoins: 50 },
      { text: "I'll quickly write something terrible and submit it for partial credit.", isCorrect: false },
      { text: "I'll copy from online sources and hope the teacher doesn't notice.", isCorrect: false }
    ]
  },
  {
    id: 16,
    title: "Injury Denial",
    situation: "You get hurt during practice but don't want to lose your spot.",
    choices: [
      { text: "I'll just take some painkillers and push through the pain.", isCorrect: false },
      { text: "I need to tell the coach about my injury and get proper treatment.", isCorrect: true, vcoins: 50 },
      { text: "I'll hide the injury and hope it heals on its own.", isCorrect: false },
      { text: "I'll play through the pain and deal with consequences later.", isCorrect: false }
    ]
  },
  {
    id: 17,
    title: "Bench Warmer Blues",
    situation: "You try hard but still don't get any playing time.",
    choices: [
      { text: "I'll confront the coach and demand more playing time.", isCorrect: false },
      { text: "I'll ask the coach what specific skills I need to work on to earn more time.", isCorrect: true, vcoins: 50 },
      { text: "This is pointless. I'm going to quit and find something else to do.", isCorrect: false },
      { text: "I'll just show up to practice but stop trying as hard.", isCorrect: false }
    ]
  },
  {
    id: 18,
    title: "Toxic Teammate",
    situation: "A teammate bullies others but is the coach's favorite.",
    choices: [
      { text: "I'll stay quiet to avoid becoming their next target.", isCorrect: false },
      { text: "I'll document the behavior and speak with the coach privately about it.", isCorrect: true, vcoins: 50 },
      { text: "I'll confront them directly in front of everyone.", isCorrect: false },
      { text: "I'll start bullying them back to give them a taste of their own medicine.", isCorrect: false }
    ]
  },
  {
    id: 19,
    title: "They Want You to Steal",
    situation: "Your friends dare you to steal as a joke.",
    choices: [
      { text: "It's just a small thing, no one will miss it.", isCorrect: false },
      { text: "Nah, I'm not into that. Let's find something else fun to do.", isCorrect: true, vcoins: 50 },
      { text: "I'll do it just this once to prove I'm not a chicken.", isCorrect: false },
      { text: "Fine, but if we get caught, you're taking the blame.", isCorrect: false }
    ]
  },
  {
    id: 20,
    title: "Party Pressure",
    situation: "You're handed alcohol at a party. Everyone's watching.",
    choices: [
      { text: "Sure, why not? It's just one drink.", isCorrect: false },
      { text: "Nah, I'm good. Thanks though! Just sticking to soda tonight.", isCorrect: true, vcoins: 50 },
      { text: "I'll pretend to drink it but just hold the cup.", isCorrect: false },
      { text: "I'll take it so I don't look lame, but pour it out when no one's looking.", isCorrect: false }
    ]
  },
  {
    id: 21,
    title: "Witnessed Something Wrong",
    situation: "You saw something illegal or unsafe at school.",
    choices: [
      { text: "It's not my business. I'll just pretend I didn't see anything.", isCorrect: false },
      { text: "I need to report this to someone who can handle it properly.", isCorrect: true, vcoins: 50 },
      { text: "I'll tell my friends about it but not get involved myself.", isCorrect: false },
      { text: "I'll handle it myself and confront the person directly.", isCorrect: false }
    ]
  },
  {
    id: 22,
    title: "Parents Don't Get It",
    situation: "Your ADHD makes focus hard but they say 'just try harder.'",
    choices: [
      { text: "They're right, I just need to work harder and stop making excuses.", isCorrect: false },
      { text: "I'll help them understand ADHD better and work together on solutions.", isCorrect: true, vcoins: 50 },
      { text: "Fine, I'll just struggle in silence and not ask for help anymore.", isCorrect: false },
      { text: "I'll get angry and tell them they don't understand anything.", isCorrect: false }
    ]
  },
  {
    id: 23,
    title: "Sibling Rivalry Heat-Up",
    situation: "Your sibling gets more praise, awards, and attention.",
    choices: [
      { text: "I'll try to sabotage their success so I look better by comparison.", isCorrect: false },
      { text: "I'll focus on my own growth and celebrate both our achievements.", isCorrect: true, vcoins: 50 },
      { text: "I'll act out to get attention, even if it's negative attention.", isCorrect: false },
      { text: "I'll just give up trying since they're clearly the favorite.", isCorrect: false }
    ]
  },
  {
    id: 24,
    title: "Punished for Telling the Truth",
    situation: "You're honest about something and still get in trouble.",
    choices: [
      { text: "I'll never tell the truth again if this is what happens.", isCorrect: false },
      { text: "Being honest was still the right choice, even if the outcome wasn't what I hoped.", isCorrect: true, vcoins: 50 },
      { text: "I'll make sure to lie better next time so I don't get caught.", isCorrect: false },
      { text: "This is so unfair! I'm going to make them pay for punishing my honesty.", isCorrect: false }
    ]
  },
  {
    id: 25,
    title: "Anxiety Attack During Class",
    situation: "You start spiraling and the teacher calls on you.",
    choices: [
      { text: "I'll just mumble something and hope they move on quickly.", isCorrect: false },
      { text: "I'll take a deep breath and ask for a moment to collect myself.", isCorrect: true, vcoins: 50 },
      { text: "I'll make up an excuse about feeling sick and leave the room.", isCorrect: false },
      { text: "I'll just freeze up and not say anything at all.", isCorrect: false }
    ]
  },
  {
    id: 26,
    title: "Public Tears",
    situation: "You cry and people laugh.",
    choices: [
      { text: "I'll run away and skip the rest of the day.", isCorrect: false },
      { text: "I'll acknowledge my feelings are valid and find a trusted adult to talk to.", isCorrect: true, vcoins: 50 },
      { text: "I'll get angry and yell at everyone who laughed.", isCorrect: false },
      { text: "I'll laugh along and pretend it doesn't bother me.", isCorrect: false }
    ]
  },
  {
    id: 27,
    title: "Assignment Snowball",
    situation: "One missed assignment snowballs into panic.",
    choices: [
      { text: "I'll just give up since I'm already behind anyway.", isCorrect: false },
      { text: "I'll talk to my teachers and create a realistic plan to catch up.", isCorrect: true, vcoins: 50 },
      { text: "I'll try to do everything at once and probably do it all poorly.", isCorrect: false },
      { text: "I'll copy assignments from friends to catch up quickly.", isCorrect: false }
    ]
  },
  {
    id: 28,
    title: "Dream vs. Safety",
    situation: "You want to follow your dreams but your family expects a safe path.",
    choices: [
      { text: "I'll just do what my family wants to avoid conflict.", isCorrect: false },
      { text: "I'll have an honest conversation about my dreams and try to find a compromise.", isCorrect: true, vcoins: 50 },
      { text: "I'll secretly pursue my dreams while pretending to follow their plan.", isCorrect: false },
      { text: "I'll rebel completely and do exactly the opposite of what they want.", isCorrect: false }
    ]
  },
  {
    id: 29,
    title: "Dream College Rejection",
    situation: "Your dream college says no to getting in :(",
    choices: [
      { text: "My life is over. This was my only plan and now I have nothing.", isCorrect: false },
      { text: "This is disappointing, but I'll explore other great options and opportunities.", isCorrect: true, vcoins: 50 },
      { text: "I'll take a gap year and reapply next year with a better application.", isCorrect: false },
      { text: "I'll try to find a way to appeal the decision or transfer in later.", isCorrect: false }
    ]
  },
  {
    id: 30,
    title: "Risky Opportunity",
    situation: "You get a chance to leave your current life behind for a risky opportunity.",
    choices: [
      { text: "I'll jump at it without thinking about the consequences.", isCorrect: false },
      { text: "I'll carefully weigh the pros and cons before making this big decision.", isCorrect: true, vcoins: 50 },
      { text: "It's too scary. I'll stick with what I know even if it's not exciting.", isCorrect: false },
      { text: "I'll let someone else decide for me since I can't choose.", isCorrect: false }
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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateNewScenario = () => {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    // Shuffle the answer choices for randomization
    const shuffledChoices = shuffleArray(randomScenario.choices);
    setCurrentScenario({
      ...randomScenario,
      choices: shuffledChoices
    });
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