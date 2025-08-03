import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HelpCircle, ChevronDown, Save, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { FSRSService } from "@/services/fsrsService";
import { useAuth } from "@/hooks/useAuth";

interface FSRSSettings {
  request_retention: number;
  maximum_interval: number;
  enable_fuzz: boolean;
  enable_short_term: boolean;
  learning_steps: string;
  relearning_steps: string;
}

const DEFAULT_SETTINGS: FSRSSettings = {
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: "1m, 10m",
  relearning_steps: "10m"
};

const PRESETS = {
  beginner: {
    name: "Beginner",
    description: "Conservative settings with frequent reviews",
    settings: {
      request_retention: 0.95,
      maximum_interval: 180,
      enable_fuzz: false,
      enable_short_term: true,
      learning_steps: "1m, 5m, 10m",
      relearning_steps: "5m"
    }
  },
  standard: {
    name: "Standard",
    description: "Balanced settings for most users",
    settings: DEFAULT_SETTINGS
  },
  aggressive: {
    name: "Aggressive",
    description: "Longer intervals, fewer reviews",
    settings: {
      request_retention: 0.85,
      maximum_interval: 36500,
      enable_fuzz: true,
      enable_short_term: true,
      learning_steps: "1m, 10m",
      relearning_steps: "10m"
    }
  }
};

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FSRSSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<FSRSSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user's current settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const fsrsService = await FSRSService.getInstanceForUser(user.id);
        const params = fsrsService.getParameters();
        
        const loadedSettings: FSRSSettings = {
          request_retention: params.request_retention,
          maximum_interval: params.maximum_interval,
          enable_fuzz: params.enable_fuzz,
          enable_short_term: params.enable_short_term,
          learning_steps: params.learning_steps.join(", "),
          relearning_steps: params.relearning_steps.join(", ")
        };
        
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } catch (error) {
        console.error('Failed to load FSRS settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Parse learning steps
      const learningSteps = settings.learning_steps
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      const relearningSteps = settings.relearning_steps
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Validate steps format
      const stepRegex = /^\d+[mhd]$/;
      const invalidLearning = learningSteps.find(step => !stepRegex.test(step));
      const invalidRelearning = relearningSteps.find(step => !stepRegex.test(step));
      
      if (invalidLearning) {
        toast.error(`Invalid learning step format: "${invalidLearning}". Use format like "1m", "5h", "2d"`);
        return;
      }
      
      if (invalidRelearning) {
        toast.error(`Invalid relearning step format: "${invalidRelearning}". Use format like "1m", "5h", "2d"`);
        return;
      }

      const fsrsService = await FSRSService.getInstanceForUser(user.id);
      const result = await fsrsService.updateUserParameters(user.id, {
        request_retention: settings.request_retention,
        maximum_interval: settings.maximum_interval,
        enable_fuzz: settings.enable_fuzz,
        enable_short_term: settings.enable_short_term,
        learning_steps: learningSteps as unknown as any,
        relearning_steps: relearningSteps as unknown as any
      });

      if (result.success) {
        setOriginalSettings(settings);
        toast.success('Settings saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setShowResetDialog(false);
  };

  const applyPreset = (preset: typeof PRESETS.standard) => {
    setSettings(preset.settings);
  };

  const SettingItem = ({ 
    title, 
    description, 
    tooltip,
    children 
  }: { 
    title: string;
    description: string;
    tooltip: string;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{title}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">FSRS Settings</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">FSRS Settings</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowResetDialog(true)}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
            <CardDescription>
              Apply pre-configured settings based on your learning style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{preset.name}</h3>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="w-full"
                      >
                        Apply Preset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle>FSRS Parameters</CardTitle>
            <CardDescription>
              Configure the spaced repetition algorithm to match your learning preferences.
              Changes will affect future card scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Request Retention */}
            <SettingItem
              title="Target Retention"
              description={`Current: ${(settings.request_retention * 100).toFixed(0)}%`}
              tooltip="The percentage of cards you want to remember when reviewing. Higher values mean more frequent reviews but better retention. Most users should stay between 85-95%."
            >
              <div className="px-2">
                <Slider
                  value={[settings.request_retention]}
                  onValueChange={([value]) => setSettings({...settings, request_retention: value})}
                  min={0.8}
                  max={0.98}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>80%</span>
                  <span>98%</span>
                </div>
              </div>
            </SettingItem>

            {/* Maximum Interval */}
            <SettingItem
              title="Maximum Interval"
              description={`Current: ${settings.maximum_interval} days`}
              tooltip="The longest possible time between reviews. Very easy cards will never be scheduled beyond this interval. 365 days = 1 year, 36500 = 100 years."
            >
              <div className="px-2">
                <Slider
                  value={[settings.maximum_interval]}
                  onValueChange={([value]) => setSettings({...settings, maximum_interval: value})}
                  min={30}
                  max={36500}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>30 days</span>
                  <span>100 years</span>
                </div>
              </div>
            </SettingItem>

            {/* Enable Fuzz */}
            <SettingItem
              title="Enable Fuzz"
              description={settings.enable_fuzz ? "Enabled - Adds randomness to intervals" : "Disabled - Consistent intervals"}
              tooltip="Adds slight randomness to review intervals to prevent all cards from clustering on the same dates. Disable this if you want completely consistent intervals for new cards (fixes Easy button showing different times)."
            >
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.enable_fuzz}
                  onCheckedChange={(checked) => setSettings({...settings, enable_fuzz: checked})}
                />
                <Badge variant={settings.enable_fuzz ? "default" : "secondary"}>
                  {settings.enable_fuzz ? "Random intervals" : "Consistent intervals"}
                </Badge>
              </div>
            </SettingItem>

            {/* Enable Short Term */}
            <SettingItem
              title="Enable Learning Steps"
              description={settings.enable_short_term ? "Enabled - Use learning steps for new cards" : "Disabled - Skip learning steps"}
              tooltip="When enabled, new cards follow learning steps (e.g., 1m, 10m) before graduating to the main algorithm. When disabled, new cards immediately use algorithm-calculated intervals."
            >
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.enable_short_term}
                  onCheckedChange={(checked) => setSettings({...settings, enable_short_term: checked})}
                />
                <Badge variant={settings.enable_short_term ? "default" : "secondary"}>
                  {settings.enable_short_term ? "Use learning steps" : "Skip to algorithm"}
                </Badge>
              </div>
            </SettingItem>

            {/* Learning Steps */}
            <SettingItem
              title="Learning Steps"
              description="Intervals for new cards before they graduate to the main algorithm"
              tooltip="The review intervals for new cards. Format: '1m, 10m' means review after 1 minute, then 10 minutes. Use 'm' for minutes, 'h' for hours, 'd' for days."
            >
              <Input
                value={settings.learning_steps}
                onChange={(e) => setSettings({...settings, learning_steps: e.target.value})}
                placeholder="1m, 10m"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Format: "1m, 10m, 1h, 1d" (m=minutes, h=hours, d=days)
              </p>
            </SettingItem>

            {/* Relearning Steps */}
            <SettingItem
              title="Relearning Steps"
              description="Intervals for cards you forgot (rated 'Again')"
              tooltip="The review intervals for cards you marked as 'Again' (forgot). These cards re-enter learning mode with these intervals before returning to the main algorithm."
            >
              <Input
                value={settings.relearning_steps}
                onChange={(e) => setSettings({...settings, relearning_steps: e.target.value})}
                placeholder="10m"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Format: "10m, 1d" (m=minutes, h=hours, d=days)
              </p>
            </SettingItem>
          </CardContent>
        </Card>

        {/* Advanced Section */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Advanced Information</CardTitle>
                    <CardDescription>
                      Understanding FSRS and spaced repetition concepts
                    </CardDescription>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">About FSRS</h4>
                    <p className="text-muted-foreground">
                      Free Spaced Repetition Scheduler (FSRS) is a modern spaced repetition algorithm 
                      that optimizes review intervals based on memory research and your personal performance.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Card States</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li><strong>New:</strong> Cards you haven't studied yet</li>
                      <li><strong>Learning:</strong> Cards progressing through learning steps</li>
                      <li><strong>Review:</strong> Cards in the main spaced repetition cycle</li>
                      <li><strong>Relearning:</strong> Cards you forgot, re-entering learning mode</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Rating Guidelines</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li><strong>Again:</strong> You forgot the card completely</li>
                      <li><strong>Hard:</strong> You remembered with significant difficulty</li>
                      <li><strong>Good:</strong> You remembered with normal effort</li>
                      <li><strong>Easy:</strong> You remembered instantly without effort</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all FSRS parameters to their default values. 
              Your current changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}