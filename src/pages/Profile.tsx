import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Mail, Calendar, Settings, Crown, CreditCard, RefreshCw, Bell, Shield, Link as LinkIcon, Twitch, Youtube, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscription, isPro, isYearOne, loading, refreshSubscription, openCustomerPortal } = useSubscription();
  const { twitchConnection, youtubeConnection, connectTwitch, connectYouTube, disconnectPlatform, isLoading: oauthLoading } = usePlatformOAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Form states
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <motion.div 
        className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="container mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Overview */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-primary h-24" />
              <CardHeader className="text-center -mt-12 pb-6">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                      {getInitials(fullName || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{fullName || "User"}</CardTitle>
                  {isPro && (
                    <Badge variant="secondary" className="bg-gradient-primary text-white animate-pulse">
                      <Crown className="w-3 h-3 mr-1" />
                      {subscription.subscription_tier}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">{user.email}</CardDescription>
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Subscription Management */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Subscription
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshSubscription}
                    disabled={loading}
                    className="ml-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-5 border border-border/40 rounded-xl bg-card/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 text-lg">
                        {isPro ? (
                          <>
                            <Crown className="w-5 h-5 text-amber-500" />
                            {subscription.subscription_tier} Plan
                          </>
                        ) : (
                          "Free Plan"
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isPro 
                          ? "You have access to all premium features"
                          : "Upgrade to unlock all Pro features"
                        }
                      </p>
                    </div>
                    {isPro && (
                      <Badge variant="outline" className="border-success text-success">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {subscription.subscription_end && (
                    <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {isYearOne ? 'Expires' : 'Renews'} on {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-3">
                    {isPro ? (
                      <Button onClick={openCustomerPortal} disabled={loading} className="bg-gradient-primary hover:opacity-90">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {loading ? "Loading..." : "Manage Subscription"}
                      </Button>
                    ) : (
                      <Button onClick={() => navigate('/pricing')} className="bg-gradient-primary hover:opacity-90">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Connected Platforms */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Connected Platforms
                </CardTitle>
                <CardDescription>
                  Connect your streaming accounts for seamless integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Twitch */}
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#9146FF]/10">
                      <Twitch className="w-5 h-5 text-[#9146FF]" />
                    </div>
                    <div>
                      <h4 className="font-medium">Twitch</h4>
                      <p className="text-sm text-muted-foreground">
                        {twitchConnection?.isConnected 
                          ? `Connected as ${twitchConnection.username}` 
                          : "Not connected"
                        }
                      </p>
                    </div>
                  </div>
                  {twitchConnection?.isConnected ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => disconnectPlatform("twitch")}
                      disabled={oauthLoading}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={connectTwitch}
                      disabled={oauthLoading}
                      className="bg-[#9146FF] hover:bg-[#7c3aed]"
                    >
                      Connect
                    </Button>
                  )}
                </div>

                {/* YouTube */}
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-card/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#FF0000]/10">
                      <Youtube className="w-5 h-5 text-[#FF0000]" />
                    </div>
                    <div>
                      <h4 className="font-medium">YouTube</h4>
                      <p className="text-sm text-muted-foreground">
                        {youtubeConnection?.isConnected 
                          ? `Connected as ${youtubeConnection.username}` 
                          : "Not connected"
                        }
                      </p>
                    </div>
                  </div>
                  {youtubeConnection?.isConnected ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => disconnectPlatform("youtube")}
                      disabled={oauthLoading}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={connectYouTube}
                      disabled={oauthLoading}
                      className="bg-[#FF0000] hover:bg-[#cc0000]"
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-card/50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-card/50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications} 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Information */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-card/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="bg-gradient-primary hover:opacity-90">
                      {isLoading ? "Updating..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </motion.div>

          {/* Account Actions */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Shield className="w-5 h-5" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl bg-destructive/5">
                  <div>
                    <h4 className="font-medium">Sign Out</h4>
                    <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                  <Button variant="destructive" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;