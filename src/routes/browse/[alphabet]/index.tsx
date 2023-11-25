import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import BrowseWords from "~/components/browse/browse-words";

import { createClient } from '@supabase/supabase-js'

export const usePhrasesStartsWithLetter = routeLoader$(async function(requestEvent) {
  const supabaseClient = createClient(requestEvent.env.get('SUPABASE_URL') as string, requestEvent.env.get('SUPABASE_KEY') as string)
  const { data: res } = await supabaseClient
  .from('phrase')
  .select("name")
  .ilike('name', requestEvent.params.alphabet+'%')
  .order('name', { ascending: true })

  const phrases = res?.map(phrase => phrase.name)

  // divide the phrases into groups of 10 
  // and get first and last phrases in each group
  const groupSize = 10
  let groupedPhrases: string[][] = []
  if (phrases) {
    groupedPhrases = new Array(Math.floor(phrases.length / groupSize))
    
    for (let i = 0; i < groupedPhrases.length; i++) {
      groupedPhrases[i] = [phrases[i*groupSize], phrases[((i+1)*groupSize)-1]]
    }
    if(phrases.length > (groupedPhrases.length)*groupSize) {
      groupedPhrases.push([phrases[(groupedPhrases.length)*groupSize], phrases.at(-1)])
    }
  }

  return groupedPhrases
})

const getHref = (phrase: string[], alphabet: string) =>{
  let href = ""
  if (phrase[0] === phrase[1]) {
    href = "/dictionary?search="+phrase[0]
  } else {
    href = "/browse/"+alphabet+"/from-to"
    +"?from="+phrase[0]+"&to="+phrase[1]
  }
  
  return href
}

export default component$(() => {
  const loc = useLocation();
  const phrases = usePhrasesStartsWithLetter()
  return (
    <section class="grid grid-cols-1 m-4 gap-4">
      <p class="text-3xl font-lg text-[#1d2a57] pb-4 border-dotted border-b-2">
        Words starting with 
        <span class="pl-2 font-extrabold text-sky-600">
          { loc.params.alphabet }
        </span>
      </p>
      <BrowseWords />
      <menu class="flex flex-wrap">
      {
        phrases.value.map((phrase, index) => (
          <a 
            key={index}
            class="m-4 p-2 rounded-md text-xl bg-sky-300 flex gap-2 shadow-md
            hover:bg-green-400 hover:outline 
            hover:outline-sky-600 hover:outline-offset-2
            w-full sm:w-max flex flex-col items-center sm:flex-row"
            href={getHref(phrase, loc.params.alphabet)}
          >
            <span class="">{ phrase[0] }</span> 
            { (phrase[0] !== phrase[1]) ? " ...... ": "" } 
            <span class=" ">
              { (phrase[0] !== phrase[1]) ? phrase[1]: "" }
            </span>
          </a>
        ))
      }
      </menu>
    </section>
  );
});

export const head: DocumentHead = ({ params }) => {
  return {
    title: "Phrases starting with: " + params.alphabet,
    meta: [
      {
        name: "description",
        content: "Find essential Idioms and Phrasal verbs on this app.",
      },
    ],
  }
  
};