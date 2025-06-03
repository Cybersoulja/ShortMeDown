import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, FileText, Search, Download, ExternalLink, Tag } from 'lucide-react';
import { bearService } from '@/lib/bear';
import { useToast } from '@/hooks/use-toast';

interface BearIntegrationProps {
  shortcuts: any[];
  onNoteCreated?: (noteId: string) => void;
}

export function BearIntegration({ shortcuts, onNoteCreated }: BearIntegrationProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: '',
    pin: false
  });
  const { toast } = useToast();

  useEffect(() => {
    checkBearAvailability();
  }, []);

  const checkBearAvailability = () => {
    const available = bearService.isAvailable();
    setIsAvailable(available);
  };

  const handleCreateNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for the note",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const tags = noteForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const result = await bearService.createNote({
        title: noteForm.title,
        text: noteForm.content,
        tags,
        pin: noteForm.pin
      });

      if (result.success) {
        toast({
          title: "Note Created",
          description: "Successfully created note in Bear",
        });
        
        // Reset form
        setNoteForm({ title: '', content: '', tags: '', pin: false });
        
        if (onNoteCreated && result.noteId) {
          onNoteCreated(result.noteId);
        }
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Could not create note in Bear",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveShortcutToBear = async (shortcut: any) => {
    setIsCreating(true);
    try {
      const result = await bearService.createShortcutNote({
        title: shortcut.title,
        description: shortcut.description,
        actions: shortcut.actions || [],
        tags: shortcut.tags || [],
        category: shortcut.category || 'General'
      });

      if (result.success) {
        toast({
          title: "Shortcut Saved",
          description: `Saved "${shortcut.title}" to Bear`,
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save shortcut to Bear",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearchBear = async () => {
    if (!searchQuery.trim()) return;

    try {
      const result = await bearService.searchNotes(searchQuery);
      if (result.success) {
        toast({
          title: "Search Initiated",
          description: "Bear search opened with your query",
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Could not search Bear notes",
        variant: "destructive"
      });
    }
  };

  const handleOpenShortcutsTag = async () => {
    try {
      const result = await bearService.openTag('shortcuts');
      if (result.success) {
        toast({
          title: "Tag Opened",
          description: "Opened shortcuts tag in Bear",
        });
      }
    } catch (error) {
      toast({
        title: "Open Failed",
        description: "Could not open shortcuts tag",
        variant: "destructive"
      });
    }
  };

  const quickActions = bearService.getQuickActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Bear Integration
          {isAvailable ? (
            <Badge variant="default">Available</Badge>
          ) : (
            <Badge variant="secondary">Web Mode</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Save shortcuts and notes to Bear for better organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="quick">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Note Title</Label>
                <Input
                  id="note-title"
                  placeholder="Enter note title..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your note content here..."
                  rows={6}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note-tags">Tags (comma-separated)</Label>
                <Input
                  id="note-tags"
                  placeholder="shortcuts, automation, ios"
                  value={noteForm.tags}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="pin-note" 
                  checked={noteForm.pin}
                  onCheckedChange={(checked) => setNoteForm(prev => ({ ...prev, pin: checked }))}
                />
                <Label htmlFor="pin-note">Pin note</Label>
              </div>

              <Button 
                onClick={handleCreateNote} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Note in Bear'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Save Shortcuts to Bear</h4>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-save" 
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
                <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h5 className="font-medium">{shortcut.title}</h5>
                    <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                    <div className="flex gap-1 mt-1">
                      {shortcut.tags?.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSaveShortcutToBear(shortcut)}
                    disabled={isCreating}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ))}
            </div>

            {shortcuts.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No shortcuts available to save
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search Bear notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchBear();
                    }
                  }}
                />
                <Button 
                  onClick={handleSearchBear}
                  disabled={!searchQuery.trim()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleOpenShortcutsTag}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Shortcuts Tag
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => bearService.openTag('automation')}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Automation Tag
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => {
                    if (typeof action.action === 'function') {
                      action.action();
                    } else {
                      toast({
                        title: action.name,
                        description: "Action triggered",
                      });
                    }
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">{action.name}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              {isAvailable ? (
                <p>Bear app detected. Actions will open directly in Bear.</p>
              ) : (
                <p>Bear app not detected. Notes will be downloaded as Markdown files.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}