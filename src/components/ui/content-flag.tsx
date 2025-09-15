import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ContentFlagProps {
  contentType: 'post' | 'comment' | 'creative_post';
  contentId: string;
  size?: 'sm' | 'md';
}

export function ContentFlag({ contentType, contentId, size = 'sm' }: ContentFlagProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flagReasons = [
    'spam',
    'harassment',
    'hate_speech',
    'inappropriate_content',
    'violence',
    'misinformation',
    'other'
  ];

  const handleSubmit = async () => {
    if (!user || !reason) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('content_flags')
        .insert({
          content_type: contentType,
          content_id: contentId,
          reporter_id: user.id,
          flag_reason: reason,
          flag_description: description || null
        });

      if (error) throw error;

      toast({
        title: "Content Flagged",
        description: "Thank you for reporting this content. Our team will review it shortly.",
      });

      setIsOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error flagging content:', error);
      toast({
        title: "Error",
        description: "Failed to report content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={size === 'md' ? 'default' : 'sm'}
          className="text-muted-foreground hover:text-destructive"
        >
          <Flag className="h-4 w-4" />
          {size === 'md' && <span className="ml-2">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Content
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Reason for reporting</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {flagReasons.map((flagReason) => (
                  <SelectItem key={flagReason} value={flagReason}>
                    {flagReason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Additional details (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about why you're reporting this content..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason || isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? "Reporting..." : "Report Content"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}