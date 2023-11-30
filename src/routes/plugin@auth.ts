import { serverAuth$ } from '@builder.io/qwik-auth';
import { server$ } from "@builder.io/qwik-city";
import Credentials from "@auth/core/providers/credentials";
import GitHub from '@auth/core/providers/github';
import type { Provider } from '@auth/core/providers';
import type { User } from '@auth/core/types';

import { createClient } from '@supabase/supabase-js'

const getUser = server$(async function(username: string, password: string, supaBaseUrl: string, supaBaseKey: string) {
  const supabaseClient = createClient(supaBaseUrl, supaBaseKey)
  const { data } = await supabaseClient
  .from('user')
  .select("id, name, email")
  .eq('name', username)
  .eq('secret', password)
  .limit(1)
  .single()

  return data
})


export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } = serverAuth$(
  ({ env }) => ({
    secret: env.get("AUTH_SECRET"),
    trustHost: true,
    providers: [
      GitHub({
        clientId: env.get("GITHUB_ID"),
        clientSecret: env.get("GITHUB_SECRET"),
      }),
      Credentials({
        credentials: {
          username: { 
            label: 'Username', 
            type: 'text',
            placeholder: '(hint: john)', 
            required: true,
            minLength: 4
          },
          password: { 
            label: 'Password', 
            type: 'password', 
            placeholder: '(hint: doe)',
            required: true,
            minLength: 4
          }
        },
        async authorize(credentials) {
          if (!credentials.username || !credentials.password) {
            return null;
          }
          const userDetails = await getUser(credentials.username as string , credentials.password as string, env.get("SUPABASE_URL") as string, env.get("SUPABASE_KEY") as string)
          const user: User = {
            id: userDetails?.id,
            name: userDetails?.name,
            email: userDetails?.email
          };
 
          return user;
        },
      }),
    ] as Provider[],
  })
);
