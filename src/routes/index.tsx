import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";

import { createClient } from '@supabase/supabase-js'

import RandomWord from "~/components/random-word";
import BrowseWords from "~/components/browse/browse-words";

export const useRandomPhrase = routeLoader$(async function(requestEvent) {
  const supabaseClient = createClient(requestEvent.env.get('SUPABASE_URL') as string, requestEvent.env.get('SUPABASE_KEY') as string)

  const { data: idList } = await supabaseClient
  .from('phrase')
  .select("id")
  
  let randomRowId = 1
  if (idList?.length) {
    randomRowId = Math.floor(Math.random()* idList.length)
    randomRowId = idList[randomRowId].id
  }

  const { data: phrase } = await supabaseClient
    .from('phrase')
    .select("name, meanings")
    .eq('id', randomRowId)
    .single()
  
  return phrase
})

export default component$(() => {
  return (
    <>
      <div class="flex h-12 shadow-lg shadow-gray-500 w-max">
        <div class="h-12 w-12 bg-yellow-400" />
        <p class="text-2xl text-white font:base sm:font-lg bg-[#1d2a57] w-max p-2 px-4">
          Phrase of the Moment
        </p>
      </div>
      <RandomWord />
      <BrowseWords />
    </>
  );
});

export const head: DocumentHead = {
  title: "Dictionary of Idioms and Phrasal verbs",
  meta: [
    {
      name: "description",
      content: "Find essential Idioms and Phrasal verbs on this app.",
    },
  ],
};
