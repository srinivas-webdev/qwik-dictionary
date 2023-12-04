import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  useContextProvider,
} from '@builder.io/qwik';
import type { Session } from "@auth/core/types";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { isServer } from '@builder.io/qwik/build';

import { PhraseContext } from "~/utils/contextUtil";

import PhraseMeanings from "~/components/phrase-meanings";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get('session');
  if (!session || 
    new Date(session.expires) < new Date() ||
    session.user?.email !== event.env.get("ADMIN_EMAIL")) {
    throw event.redirect(302, `/api/auth/signin?callbackUrl=${event.url.pathname}`);
  }
};

export default component$(() => {
  const phrase = useSignal<PhraseDetails>() 
  const phraseName = useSignal<string>()

  useTask$(() => {
    if (isServer) {
      return; // Server guard
    }
    const phraseDetails = localStorage.getItem("phraseDetails")
    if (phraseDetails) {
      phrase.value = JSON.parse(phraseDetails)
      phraseName.value = phrase.value?.name
    }
    
  });

  useContextProvider(PhraseContext, phrase);

  return (
    <>
      <header class="flex justify-between items-center bg-gray-300 px-2 py-2 gap-4"> 
        <section class="flex gap-1 items-center">
        {
          phrase.value == undefined ? (
            <h3 
              class="text-xl font-extrabold"
            >
              New Phrase
            </h3>
          ) : (
            <h3 
              class="text-xl font-extrabold"
            >
              Update Phrase
            </h3>
          ) 
        }
        
        </section>
        <menu class="flex gap-2">
          <button 
            value="confirm"
            class="px-2 py-1 bg-yellow-400 hover:bg-green-600 rounded-md 
            font-bold hover:outline hover:outline-offset-2 hover:outline-sky-600"
          >
            Confirm
          </button>
        </menu>
      </header>
      <section class="relative mx-2 my-1">
        <input 
          id="new_phrase" 
          bind:value={phraseName}
          type="text" 
          class="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-lg
            text-gray-900 bg-gray-50 dark:bg-gray-700 
            border-0 border-b-2 border-gray-300 appearance-none 
            dark:text-white dark:border-gray-600 dark:focus:border-blue-500 
            focus:outline-none focus:ring-0 focus:border-blue-600 peer" 
          placeholder=" " 
        />
        <label 
          for="new_phrase" 
          class="absolute text-lg text-gray-500 dark:text-gray-400 
          duration-300 transform -translate-y-4 scale-75 top-4 z-10 
          origin-[0] left-2.5 peer-focus:text-blue-600
          peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 peer-focus:scale-75 
          peer-focus:-translate-y-4"
        >
          Phrase Name
        </label>
      </section>
      <PhraseMeanings />
    </>
  )
})

export const head: DocumentHead = () => {
  return {
    title: "Create/Update Phrase"
  }
};
