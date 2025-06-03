import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OAuthCallback() {
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlParams(params);
    
    // Determine success based on common OAuth patterns
    const hasCode = params.has('code');
    const hasToken = params.has('access_token');
    const hasError = params.has('error');
    
    setIsSuccess(!hasError && (hasCode || hasToken));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Parameter value copied successfully",
    });
  };

  const copyAllParams = () => {
    if (!urlParams) return;
    
    const paramString = Array.from(urlParams.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(paramString);
    toast({
      title: "All parameters copied",
      description: "All OAuth parameters copied to clipboard",
    });
  };

  const getParamType = (key: string): string => {
    const tokenTypes = ['access_token', 'id_token', 'refresh_token'];
    const codeTypes = ['code', 'authorization_code'];
    const errorTypes = ['error', 'error_description', 'error_code'];
    const stateTypes = ['state', 'csrf_token'];
    
    if (tokenTypes.includes(key.toLowerCase())) return 'token';
    if (codeTypes.includes(key.toLowerCase())) return 'code';
    if (errorTypes.includes(key.toLowerCase())) return 'error';
    if (stateTypes.includes(key.toLowerCase())) return 'state';
    return 'info';
  };

  const getParamBadgeColor = (type: string): string => {
    switch (type) {
      case 'token': return 'bg-green-100 text-green-800 border-green-200';
      case 'code': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'state': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Status Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {isSuccess ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : isSuccess === false ? (
                <XCircle className="h-16 w-16 text-red-500" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse" />
              )}
            </div>
            
            <CardTitle className="text-2xl">
              {isSuccess ? 'OAuth Success' : isSuccess === false ? 'OAuth Error' : 'Processing OAuth...'}
            </CardTitle>
            
            <p className="text-gray-600">
              {isSuccess 
                ? 'Authentication completed successfully'
                : isSuccess === false 
                ? 'Authentication failed or was cancelled'
                : 'Processing OAuth callback parameters...'
              }
            </p>
          </CardHeader>
        </Card>

        {/* Parameters Display */}
        {urlParams && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>OAuth Parameters</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAllParams}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {Array.from(urlParams.entries()).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No parameters received in the callback URL
                </p>
              ) : (
                <div className="space-y-3">
                  {Array.from(urlParams.entries()).map(([key, value]) => {
                    const type = getParamType(key);
                    const badgeColor = getParamBadgeColor(type);
                    
                    return (
                      <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{key}</span>
                            <Badge className={`text-xs ${badgeColor}`}>
                              {type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700 break-all font-mono bg-white p-2 rounded border">
                            {value}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(value)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Redirect URI Info */}
        <Card>
          <CardHeader>
            <CardTitle>Universal Redirect URI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Use this URI for OAuth apps:</span>
              </div>
              <code className="text-sm bg-white p-2 rounded border block">
                https://app.oneseco.com/oauth-callback
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('https://app.oneseco.com/oauth-callback')}
                className="mt-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URI
              </Button>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Supported services:</strong> GitHub, Google, Discord, Spotify, Twitch, LinkedIn, etc.</p>
              <p><strong>Handles:</strong> Authorization codes, access tokens, error responses, and state parameters</p>
              <p><strong>Development:</strong> Perfect for testing OAuth flows during app development</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Return to App
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}