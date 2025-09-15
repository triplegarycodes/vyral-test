import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RateLimitConfig {
  action: string;
  maxAttempts: number;
  windowMinutes: number;
}

export function useRateLimit() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = useCallback(async (config: RateLimitConfig): Promise<boolean> => {
    if (!user) return false;

    setIsChecking(true);
    try {
      const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);
      
      // Check current rate limit
      const { data: rateLimitData, error: fetchError } = await supabase
        .from('user_rate_limits')
        .select('count, window_start')
        .eq('user_id', user.id)
        .eq('action_type', config.action)
        .gte('window_start', windowStart.toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking rate limit:', fetchError);
        return false;
      }

      // If no existing rate limit or window expired, allow and create/update record
      if (!rateLimitData) {
        const { error: insertError } = await supabase
          .from('user_rate_limits')
          .upsert({
            user_id: user.id,
            action_type: config.action,
            count: 1,
            window_start: new Date().toISOString()
          }, {
            onConflict: 'user_id,action_type'
          });

        if (insertError) {
          console.error('Error creating rate limit record:', insertError);
        }
        return true;
      }

      // Check if within rate limit
      if (rateLimitData.count >= config.maxAttempts) {
        return false; // Rate limit exceeded
      }

      // Increment counter
      const { error: updateError } = await supabase
        .from('user_rate_limits')
        .update({ count: rateLimitData.count + 1 })
        .eq('user_id', user.id)
        .eq('action_type', config.action);

      if (updateError) {
        console.error('Error updating rate limit:', updateError);
      }

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  return { checkRateLimit, isChecking };
}