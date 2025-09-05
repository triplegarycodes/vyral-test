import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Palette, Type, RotateCcw } from "lucide-react";

export const CustomizationWidget = () => {
  const { themeSettings, updateColors, updateFonts, resetToDefault } = useTheme();
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  // Color presets for easy selection
  const colorPresets = [
    { name: 'Gaming Blue', primary: '212 100% 50%', accent: '195 100% 60%' },
    { name: 'Neon Purple', primary: '270 100% 60%', accent: '285 100% 70%' },
    { name: 'Electric Green', primary: '120 100% 50%', accent: '140 100% 60%' },
    { name: 'Sunset Orange', primary: '25 100% 55%', accent: '35 100% 65%' },
    { name: 'Cyber Pink', primary: '320 100% 60%', accent: '330 100% 70%' },
    { name: 'Ocean Teal', primary: '180 100% 45%', accent: '195 100% 55%' },
  ];

  const fontOptions = {
    primary: [
      { name: 'Inter', value: 'Inter' },
      { name: 'Poppins', value: 'Poppins' },
      { name: 'Roboto', value: 'Roboto' },
      { name: 'Montserrat', value: 'Montserrat' },
      { name: 'Space Grotesk', value: 'Space Grotesk' },
    ],
    gaming: [
      { name: 'Orbitron', value: 'Orbitron' },
      { name: 'JetBrains Mono', value: 'JetBrains Mono' },
      { name: 'Fira Code', value: 'Fira Code' },
      { name: 'Space Grotesk', value: 'Space Grotesk' },
    ]
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            className="rounded-full w-12 h-12 bg-primary/90 hover:bg-primary shadow-lg glow-primary transition-all duration-300 hover:scale-110"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-gaming flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Customize UI
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors" className="flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="fonts" className="flex items-center gap-1">
                <Type className="w-3 h-3" />
                Fonts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset, index) => (
                    <Card 
                      key={index}
                      className="p-3 cursor-pointer transition-all hover:scale-105 border-2 hover:border-primary/50"
                      onClick={() => updateColors({ 
                        primary: preset.primary, 
                        accent: preset.accent 
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.primary})` }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${preset.accent})` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{preset.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Current Theme Preview</Label>
                <Card className="p-4 bg-gradient-primary">
                  <div className="space-y-2">
                    <div className="h-4 bg-background/20 rounded animate-pulse" />
                    <div className="h-3 bg-background/15 rounded animate-pulse w-3/4" />
                    <Button size="sm" variant="secondary" className="mt-2">
                      Preview Button
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="fonts" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label>Primary Font (Interface)</Label>
                <Select
                  value={themeSettings.primaryFont}
                  onValueChange={(value) => updateFonts(value, themeSettings.gamingFont)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.primary.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Gaming Font (Headers)</Label>
                <Select
                  value={themeSettings.gamingFont}
                  onValueChange={(value) => updateFonts(themeSettings.primaryFont, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.gaming.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Font Preview</Label>
                <Card className="p-4 space-y-2">
                  <h3 
                    className="text-lg font-gaming font-bold"
                    style={{ fontFamily: themeSettings.gamingFont }}
                  >
                    Gaming Header
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ fontFamily: themeSettings.primaryFont }}
                  >
                    This is how regular text will appear in the interface with your selected fonts.
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={resetToDefault}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};