'use client';

import { useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 前端專用的 Supabase 客戶端 hook
export function useSupabaseClient(): SupabaseClient {
  const client = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      }
    );
  }, []);

  return client;
}
