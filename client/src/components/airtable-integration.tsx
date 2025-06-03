import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Database, Upload, Download, Search, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { airtableService } from '@/lib/airtable';
import { useToast } from '@/hooks/use-toast';

interface AirtableIntegrationProps {
  shortcuts: any[];
  onShortcutSync?: (shortcutId: string) => void;
}

export function AirtableIntegration({ shortcuts, onShortcutSync }: AirtableIntegrationProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [config, setConfig] = useState({
    apiKey: '',
    baseId: '',
    tableId: 'Shortcuts'
  });
  const [airtableRecords, setAirtableRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = () => {
    const configured = airtableService.isConfigured();
    setIsConfigured(configured);
  };

  const handleConnect = async () => {
    if (!config.apiKey || !config.baseId) {
      toast({
        title: "Configuration Required",
        description: "Please provide your Airtable API key and Base ID",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      airtableService.configure({
        apiKey: config.apiKey,
        baseId: config.baseId,
        tableId: config.tableId
      });

      // Test connection by fetching records
      await airtableService.getShortcutRecords();
      
      setIsConfigured(true);
      toast({
        title: "Connected Successfully",
        description: "Airtable integration is now active",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your Airtable credentials",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncToAirtable = async () => {
    if (!isConfigured) return;

    setIsLoading(true);
    try {
      for (const shortcut of shortcuts) {
        await airtableService.createShortcutRecord({
          title: shortcut.title,
          description: shortcut.description,
          category: shortcut.category || 'General',
          tags: shortcut.tags || [],
          actions: shortcut.actions || [],
          integrations: shortcut.integrations || {}
        });
      }

      toast({
        title: "Sync Complete",
        description: `Synced ${shortcuts.length} shortcuts to Airtable`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Error syncing shortcuts to Airtable",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromAirtable = async () => {
    if (!isConfigured) return;

    setIsLoading(true);
    try {
      const records = await airtableService.getShortcutRecords();
      setAirtableRecords(records);
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${records.length} shortcuts from Airtable`,
      });
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Error loading shortcuts from Airtable",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAirtable = async (query: string) => {
    if (!isConfigured || !query.trim()) return;

    setIsLoading(true);
    try {
      const records = await airtableService.searchShortcuts(query);
      setAirtableRecords(records);
      
      toast({
        title: "Search Complete",
        description: `Found ${records.length} matching shortcuts`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Error searching Airtable records",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Airtable Integration
          </CardTitle>
          <CardDescription>
            Connect your Airtable base to sync and manage shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Airtable API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="patXXXXXXXXXXXXXX..."
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="baseId">Base ID</Label>
            <Input
              id="baseId"
              placeholder="appXXXXXXXXXXXXXX"
              value={config.baseId}
              onChange={(e) => setConfig(prev => ({ ...prev, baseId: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tableId">Table Name</Label>
            <Input
              id="tableId"
              placeholder="Shortcuts"
              value={config.tableId}
              onChange={(e) => setConfig(prev => ({ ...prev, tableId: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect to Airtable'}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>To get your credentials:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>API Key: Visit <a href="https://airtable.com/create/tokens" target="_blank" className="text-blue-600 hover:underline">airtable.com/create/tokens</a></li>
              <li>Base ID: Found in your base's API documentation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Airtable Integration
          <Badge variant="default" className="ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your shortcuts database in Airtable
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sync" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sync">Sync</TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleSyncToAirtable}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Sync to Airtable
              </Button>
              
              <Button 
                onClick={handleLoadFromAirtable}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Load from Airtable
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-sync" 
                checked={syncEnabled}
                onCheckedChange={setSyncEnabled}
              />
              <Label htmlFor="auto-sync">Auto-sync on shortcut changes</Label>
            </div>

            <div className="text-sm text-muted-foreground">
              {shortcuts.length} local shortcuts • {airtableRecords.length} Airtable records
            </div>
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search Airtable shortcuts..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchAirtable(e.currentTarget.value);
                  }
                }}
              />
              <Button 
                variant="outline"
                onClick={() => handleSearchAirtable('')}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {airtableRecords.map((record, index) => (
                <div key={record.id || index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{record.fields.Title}</h4>
                      <p className="text-sm text-muted-foreground">{record.fields.Description}</p>
                      <div className="flex gap-1 mt-1">
                        {record.fields.Tags?.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant="secondary">{record.fields.Category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Connection Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Base: {config.baseId} • Table: {config.tableId}
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfigured(false);
                  setConfig({ apiKey: '', baseId: '', tableId: 'Shortcuts' });
                }}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Reconfigure Connection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}