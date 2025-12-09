import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Eye, Send, Sparkles, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Video {
  id: string;
  script: string;
  status: string;
  scheduled_for: string;
  platforms: string[];
  metadata?: any;
}

interface VideoPreviewProps {
  video: Video;
  projectTheme?: string;
  onVideoUpdated?: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VideoPreview = ({ video, projectTheme, onVideoUpdated }: VideoPreviewProps) => {
  const [open, setOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState(video.script);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage: Message = { role: "user", content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('adjust-video', {
        body: {
          videoId: video.id,
          currentScript: currentScript,
          userRequest: userInput,
          projectTheme: projectTheme,
          metadata: video.metadata
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.updatedScript) {
        setCurrentScript(data.updatedScript);
      }
    } catch (error: any) {
      console.error('Error adjusting video:', error);
      toast.error("Erreur lors de l'ajustement");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Veuillez réessayer."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('videos')
        .update({ 
          script: currentScript,
          metadata: {
            ...video.metadata,
            last_modified: new Date().toISOString(),
            ai_adjustments: messages.length > 0
          }
        })
        .eq('id', video.id);

      if (error) throw error;

      toast.success("Modifications enregistrées");
      onVideoUpdated?.();
      setOpen(false);
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleResetScript = () => {
    setCurrentScript(video.script);
    setMessages([]);
    toast.info("Script réinitialisé");
  };

  const parseScript = (script: string) => {
    const sections: { title: string; content: string }[] = [];
    const hookMatch = script.match(/\[HOOK[^\]]*\]:?\s*([^\[]+)/i);
    const bodyMatch = script.match(/\[BODY[^\]]*\]:?\s*([^\[]+)/i);
    const ctaMatch = script.match(/\[CTA[^\]]*\]:?\s*([^\[]+)/i);

    if (hookMatch) sections.push({ title: "HOOK", content: hookMatch[1].trim() });
    if (bodyMatch) sections.push({ title: "BODY", content: bodyMatch[1].trim() });
    if (ctaMatch) sections.push({ title: "CTA", content: ctaMatch[1].trim() });

    if (sections.length === 0) {
      sections.push({ title: "Script", content: script });
    }

    return sections;
  };

  const scriptSections = parseScript(currentScript);
  const hasChanges = currentScript !== video.script;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Prévisualiser
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Prévisualisation & Ajustement
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid md:grid-cols-2 gap-4 overflow-hidden">
          {/* Video Preview Section */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  Script de la vidéo
                  {hasChanges && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      Modifié
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px] pr-4">
                  <div className="space-y-4">
                    {scriptSections.map((section, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {section.title}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Video Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted rounded">
                <span className="text-muted-foreground">Statut:</span>
                <span className="ml-1 font-medium capitalize">{video.status}</span>
              </div>
              <div className="p-2 bg-muted rounded">
                <span className="text-muted-foreground">Plateformes:</span>
                <span className="ml-1 font-medium">{video.platforms?.join(', ')}</span>
              </div>
              <div className="p-2 bg-muted rounded col-span-2">
                <span className="text-muted-foreground">Programmée:</span>
                <span className="ml-1 font-medium">
                  {new Date(video.scheduled_for).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetScript}
                disabled={!hasChanges}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                onClick={handleSaveChanges}
                disabled={saving || !hasChanges}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Enregistrer
              </Button>
            </div>
          </div>

          {/* AI Chat Section */}
          <div className="flex flex-col gap-2 overflow-hidden">
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Assistant IA
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 h-[280px] pr-4 mb-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div className="text-muted-foreground text-sm">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                        <p>Décrivez les modifications que vous souhaitez</p>
                        <p className="text-xs mt-1">Ex: "Rends le hook plus accrocheur" ou "Ajoute plus d'humour"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground ml-8"
                              : "bg-muted mr-8"
                          }`}
                        >
                          {msg.content}
                        </div>
                      ))}
                      {loading && (
                        <div className="bg-muted p-3 rounded-lg mr-8 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">L'IA travaille...</span>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="flex gap-2">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Décrivez vos modifications..."
                    className="resize-none h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="hero"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={loading || !userInput.trim()}
                    className="h-[60px] w-[60px]"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreview;
