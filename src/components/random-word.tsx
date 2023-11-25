import { component$ } from "@builder.io/qwik";

import { useRandomPhrase } from '~/routes/index'
import MediaSlider from "./media-slider";

export default component$(() => {
  const phrase = useRandomPhrase()

  return (
    <section class="grid grid-cols-1 md:grid-cols-[1fr_2fr]">
      <section 
        class="grid place-items-center bg-gradient-to-r from-orange-500 to-orange-600 shadow-2xl
        rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
      >
        <p class="text-2xl text-white font-semibold p-2">
          { phrase.value?.name}
        </p>
      </section>
      <section class="bg-gray-100 shadow-2xl rounded-b-2xl sm:rounded-r-2xl sm:rounded-bl-none">
        {
          phrase.value?.meanings?.map((meaning: Meaning, index: number) => (
            <section 
              key={index} 
              class="py-2 px-4 flex flex-col gap-2 text-[#1d2a57]"
            >
              <p class="text-xl font-semibold italic">
                { index + 1 }.  { meaning.name }
              </p>
              {
                meaning.examples?.map((example: string, index: number) => (
                  <p 
                    key={example}
                    class="pl-4 text-md font-medium"
                  >
                    { index+1 }. { example }
                  </p>
                ))
              }
              {
                (meaning.media !== undefined && meaning.media.length > 0)  && (
                  <MediaSlider mediaList={meaning.media} />
                )
              }
            </section>
          ))
        }
      </section>
    </section>
  )
})

