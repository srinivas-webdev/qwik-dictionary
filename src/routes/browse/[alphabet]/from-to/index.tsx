import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, useLocation, useNavigate } from '@builder.io/qwik-city';
import BrowseWords from "~/components/browse/browse-words";

import { createClient } from '@supabase/supabase-js'

export const usePhrasesFromTo = routeLoader$(async function(requestEvent) {
  const supabaseClient = createClient(requestEvent.env.get('SUPABASE_URL') as string, requestEvent.env.get('SUPABASE_KEY') as string)
  const { data: res } = await supabaseClient
  .from('phrase')
  .select("name")
  .ilike('name', requestEvent.params.alphabet+'%')
  .order('name', { ascending: true })
  .gte('name', requestEvent.url.searchParams.get("from"))
  .lte('name', requestEvent.url.searchParams.get("to"))

  const phrases = res?.map(phrase => phrase.name)
  return phrases
})

export default component$(() => {
  const loc = useLocation();
  const phrases = usePhrasesFromTo()
  const navigateTo = useNavigate()
  return (
    <section class="grid grid-cols-1 m-4 gap-4">
      <p class="text-3xl font-lg text-[#1d2a57] pb-4 border-dotted border-b-2">
        Words starting from 
        <span class="font-extrabold text-sky-600 px-2">
          { loc.url.searchParams.get("from") } 
        </span>
        to
        <span class="font-extrabold text-sky-600 px-2">
        { loc.url.searchParams.get("to") }
        </span>
      </p>
      <BrowseWords />
      <section class="flex flex-wrap">
        {
          phrases.value?.map(phrase => (
            <button 
              key={phrase}
              class="m-4 p-2 rounded-md text-xl bg-sky-300 flex gap-2 shadow-md
              hover:bg-green-400 hover:outline 
              hover:outline-sky-600 hover:outline-offset-2
              w-full sm:w-max flex flex-col items-center sm:flex-row"
              onClick$={() => navigateTo(`/dictionary?search=${phrase}`)}
            >
              { phrase }
            </button>
          ))
        }
      </section>
    </section>
  );
});

export const head: DocumentHead = ({ url }) => {
  return {
    title: "Phrases: " + url.searchParams.get("from") + " - " + url.searchParams.get("to"),
    meta: [
      {
        name: "description",
        content: "Find essential Idioms and Phrasal verbs on this app.",
      },
    ],
  }
  
};