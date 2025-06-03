import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Zap, BarChart3, Globe, Shield, Cpu } from 'lucide-react';
import { cloudflareService } from '@/lib/cloudflare';
import { useToast } from '@/hooks/use-toast';

interface CloudflareDashboardProps {
  userId: number;
}

export function CloudflareDashboard({ userId }: CloudflareDashboardProps) {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [health, usage, recs] = await Promise.all([
        cloudflareService.healthCheck(),
        cloudflareService.getUsageAnalytics(),
        cloudflareService.getPersonalizedRecommendations(userId)
      ]);

      setHealthStatus(health);
      setAnalytics(usage);
      setRecommendations(recs);
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to Cloudflare services. Check your network connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGeneration = async () => {
    try {
      const prompt = "Create a productivity shortcut for managing daily tasks";
      const result = await cloudflareService.generateShortcutWithAI(prompt, userId);
      
      toast({
        title: "AI Shortcut Generated",
        description: `Created: ${result.title}`,
      });
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Unable to generate shortcut using Cloudflare AI",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await cloudflareService.uploadAsset(file);
      toast({
        title: "Upload Successful",
        description: `File uploaded to Cloudflare R2: ${result.key}`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Unable to upload file to Cloudflare R2",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cloudflare Integration</h2>
          <p className="text-muted-foreground">
            Enhanced with edge computing for oneseco.com
          </p>
        </div>
        <Badge variant={healthStatus?.status === 'healthy' ? 'default' : 'destructive'}>
          <Globe className="w-3 h-3 mr-1" />
          {healthStatus?.status || 'Unknown'}
        </Badge>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge AI</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Cloudflare Workers AI ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CDN Cache</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              Cache hit rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">R2 Storage</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground">
              Asset delivery ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="storage">Asset Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cloudflare AI Integration</CardTitle>
              <CardDescription>
                Generate shortcuts using edge AI with reduced latency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleAIGeneration} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Shortcut
              </Button>
              
              {recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Personalized Recommendations</h4>
                  <div className="grid gap-2">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{rec.title}</h5>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                          <Badge variant="outline">{rec.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cloudflare R2 Storage</CardTitle>
              <CardDescription>
                Upload and manage assets with global CDN delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload files to Cloudflare R2
                </p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.txt"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Real-time insights from Cloudflare Analytics Engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Shortcuts</p>
                  <p className="text-2xl font-bold">{analytics?.totalShortcuts || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold">{analytics?.activeUsers || 0}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Performance Score</span>
                  <span className="text-sm">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}