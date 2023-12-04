import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";

import { createClient } from '@supabase/supabase-js'

import MediaContainer from "~/components/media-container/media-container";
import styles from './dictionary.module.css'

import { useAuthSession } from '~/routes/plugin@auth';

const colors = [
  'rgb(30, 50, 100)', 'rgb(0, 100, 80)',
  'rgb(232, 17, 91)', 'rgb(194 0 23)',
  'rgb(30, 50, 100)', 'rgb(140, 25, 50)',
  'rgb(20, 138, 8)', 'rgb(235, 30, 50)'
]

export const usePhraseDetails = routeLoader$(async function(requestEvent) {
  const supabaseClient = createClient(requestEvent.env.get('SUPABASE_URL') as string, requestEvent.env.get('SUPABASE_KEY') as string)
  const { data: phrase } = await supabaseClient
    .from('phrase')
    .select("id, name, meanings")
    .eq('name', requestEvent.url.searchParams.get("search"))
    .single()

  return phrase
})

export default component$(() => {
  const loc = useLocation();
  const phraseDetails = usePhraseDetails()
  const session = useAuthSession();
  const navigateTo = useNavigate();

  return (
    <>
      <menu class="flex justify-between items-center mt-2 p-1">
        <p class="text-blue-900 italic">
          Meaning(s) of <span class="font-extrabold text-xl">
            {loc.url.searchParams.get("search")}</span> in English
        </p>
        {
          (session.value?.user !== undefined) && (
            <button 
              class="flex items-center justify-center space-x-2 bg-blue-900 text-white rounded-lg 
              py-2 px-4 text-lg shadow-2xl" 
              onClick$={() => {
                localStorage.setItem("phraseDetails", JSON.stringify(phraseDetails.value));
                navigateTo('/admin/phrase/create')
              }}
            >
              <p>Update Phrase</p>
            </button>
          )
        }
      </menu>
      { phraseDetails.value?.name && (
        <menu class={styles.container}>
          { 
            phraseDetails.value.meanings?.map((meaning: Meaning) => (
              <section 
                key={meaning.name}
                class={[`m-1 mr-2 rounded-md p-1 rounded-md 
                  text-white flex flex-col gap-2 custom-shadow`,
                  styles.shadow
                ]} 
                style={ `background-color: ${colors[Math.floor(Math.random()*colors.length)]}` }
              >
                <p class="text-xl font-normal">
                  { meaning.name }
                </p>
                <p class="border border-b-2  border-green-500" />
                <p class="text-lg font-semibold">
                  Example Sentences:
                </p>
                {
                  meaning.examples?.map((example, index) => (
                    <li 
                      key={index}
                      class="italic flex flex-col gap-2 text-xl font-normal  leading-4" 
                    >
                      { index+1 }. { example } 
                    </li>
                  ))
                }
                <p class="border border-b-2 border-gray-400" />
                {
                  (meaning.media !== undefined && meaning.media.length > 0)  && (
                    <MediaContainer mediaList={meaning.media} />
                  )
                }
              </section>
            ))
            
          }
        </menu>
      )}
    </>
  );
});

export const head: DocumentHead = ({ url }) => {
  return {
    title: "Meaning of: " + url.searchParams.get("search"),
    meta: [
      {
        name: "description",
        content: "Find essential Idioms and Phrasal verbs on this app.",
      },
    ],
  }
};
