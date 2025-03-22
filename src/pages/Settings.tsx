import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/authContext";
import { TestRunner } from '@/components/TestRunner';

const Settings = () => {
  const { settings, updateSettings, loading, error } = useUserSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-6 bg-destructive/10 text-destructive">
          <p>Error loading settings: {error}</p>
        </Card>
      </div>
    );
  }

  const handleSettingChange = async (key: string, value: any) => {
    try {
      await updateSettings({ [key]: value });
      toast.success("Setting updated successfully");
    } catch (err) {
      toast.error("Failed to update setting");
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive email updates and alerts</p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Language */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Language & Region</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Language</h3>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Report Preferences */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Report Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Report Format</h3>
                  <p className="text-sm text-muted-foreground">Choose your preferred report format</p>
                </div>
                <select
                  value={settings.reportFormat}
                  onChange={(e) => handleSettingChange('reportFormat', e.target.value as 'detailed' | 'summary')}
                  className="bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="detailed">Detailed</option>
                  <option value="summary">Summary</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Tests</h2>
        <TestRunner />
      </div>
    </div>
  );
};

export default Settings;
