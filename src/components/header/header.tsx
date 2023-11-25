import { 
  component$, 
  useSignal, 
  useTask$, 
  useVisibleTask$, 
  $
} from "@builder.io/qwik";
import type { QwikKeyboardEvent } from "@builder.io/qwik";
import { server$, useNavigate } from "@builder.io/qwik-city";

import { createClient } from '@supabase/supabase-js'

import styles from './header.module.css'
import AppIcon from '~/assets/favicon.svg'

type SearchResult = {
  name: string;
}

const getMatchingPhrases = server$(async function(searchText: string) {
  const supabaseClient = createClient(this.env.get('SUPABASE_URL') as string, this.env.get('SUPABASE_KEY') as string)
  const { data: phrases } = await supabaseClient
  .from('phrase')
  .select("name")
  .ilike('name', searchText+'%')
  .limit(10)
  .order('name', { ascending: true })
  
  return phrases
})

export default component$(() => {
  const navigateTo = useNavigate();
  const showResultsMenu = useSignal(false)
  const searchInputRef = useSignal<HTMLElement | undefined>()
  const searchInputText = useSignal('')
  const searchBtnFocused = useSignal(false)
  const searchBtnHovered = useSignal(false)
  const fillColor = useSignal('black')
  const matchedPhrases = useSignal<string[] | null>(null)
  const matchedPhrasesMenu = useSignal<HTMLElement | undefined>()
  const activePhraseIndex = useSignal(-1)
  const originalSearchText = useSignal('')

  useTask$(({ track }) => {
    const searchBtnHvred = track(() => searchBtnHovered.value);
    const searchBtnFcsed = track(() => searchBtnFocused.value);
    
    searchBtnHvred || searchBtnFcsed ? fillColor.value = 'white' : fillColor.value = 'black'
  });

  const searchPhrase = $(
    async function searchPhrase(searchText: string) {
      if (!searchText.length) {
        matchedPhrases.value = null
        showResultsMenu.value = false
        activePhraseIndex.value = -1
        originalSearchText.value = ""
      } else {
        // check the results are shown and no change in the search string
        // due to up and down keys
        if (showResultsMenu.value && 
          (searchText == originalSearchText.value || activePhraseIndex.value !== -1)) {
          return
        }
        // save the search Input Text
        originalSearchText.value = searchText
    
        // get the search results
        const matchedResults: SearchResult[] | null = await getMatchingPhrases(searchText)
        if (matchedResults?.length) {
          matchedPhrases.value = matchedResults.map((result)  => result.name)
          showResultsMenu.value = true
        } else {
          showResultsMenu.value = false
          matchedPhrases.value = null
        }
      }
    }
  )

  useTask$(({ track, cleanup }) => {
    track(() => searchInputText.value);
    const debounced = setTimeout(() => {
      searchPhrase(searchInputText.value)
    }, 500);
    cleanup(() => clearTimeout(debounced));
  });

  const onClickSearchInput = $(() => {
    if (matchedPhrases.value?.length && !showResultsMenu.value) {
      showResultsMenu.value = true
    } else {
      showResultsMenu.value = false
    }
  })

  const onKeyEnterSearchInput = $(() => {
    if (matchedPhrases.value?.includes(searchInputText.value)) {
      if (showResultsMenu.value) showResultsMenu.value = false
      matchedPhrases.value.length = 0
      navigateTo('/dictionary?search=' + searchInputText.value)
    }
  });

  const handleKeyEventOnActivePhrase = $((eventType: string, event: QwikKeyboardEvent) => {
    event.stopPropagation()
    if (!showResultsMenu.value) {
      return
    }
  
    if (eventType === "keydown") {
      const matchedPhrasesSize = matchedPhrases.value?.length
      if (matchedPhrasesSize &&
        (activePhraseIndex.value === matchedPhrasesSize)) {
        activePhraseIndex.value = -1
      } else {
        activePhraseIndex.value++
      }
    } else if (eventType == "keyup") {
      if (activePhraseIndex.value == -1 && matchedPhrases.value) {
        activePhraseIndex.value = matchedPhrases.value.length - 1
      } else {
        activePhraseIndex.value--
      }
    }
    
    if (activePhraseIndex.value == -1) {
      searchInputText.value = originalSearchText.value
    } else {
      if (matchedPhrases.value) {
        searchInputText.value = matchedPhrases.value[activePhraseIndex.value]
      }
    }
  })

  const onKeyDown = $((event: QwikKeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        handleKeyEventOnActivePhrase("keydown", event)
        break;
      case "ArrowUp":
        handleKeyEventOnActivePhrase("keyup", event)
        break;
      case "Enter":
        onKeyEnterSearchInput()
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }
  })

  const onClick = $((e: MouseEvent) => {
    const matchedPhrasesMenuDimentions: DOMRect | undefined = matchedPhrasesMenu.value?.getBoundingClientRect()
    let isClickOutsidePhrasesMenu = false;
    
    // if the click is outside the displayed phrases list container
    if (
      e.clientX < matchedPhrasesMenuDimentions!.left ||
      e.clientX > matchedPhrasesMenuDimentions!.right ||
      e.clientY < matchedPhrasesMenuDimentions!.top ||
      e.clientY > matchedPhrasesMenuDimentions!.bottom
    ) {
      isClickOutsidePhrasesMenu = true
    }
  
    // if the click is inside search input box
    const searchInputTextDimentions: DOMRect | undefined = searchInputRef.value?.getBoundingClientRect()
    let isClickInsideSeachInput = true
    if (
      e.clientX < searchInputTextDimentions!.left ||
      e.clientX > searchInputTextDimentions!.right ||
      e.clientY < searchInputTextDimentions!.top ||
      e.clientY > searchInputTextDimentions!.bottom
    ) {
      isClickInsideSeachInput = false
    }
  
    if (isClickOutsidePhrasesMenu) {
      if (isClickInsideSeachInput) {
        showResultsMenu.value = true
      } else {
        showResultsMenu.value = false
      }
    }
  })

  useVisibleTask$(({ track }) => {
    track(() => showResultsMenu.value);
    if (showResultsMenu.value) {
      window.addEventListener("click", onClick)
    } else {
      window.removeEventListener("click", onClick)
    }
  });

  const handleMouseEventOnActivePhrase = $(
    function handleMouseEventOnActivePhrase(index: number, eventType: string) {
      if (eventType == "mouseenter") {
        activePhraseIndex.value = index
      }
    }
  );

  return (
    <header class={["flex flex-col gap-1 p-1 py-2 sm:flex-row", styles.header]}>
      <section class="flex items-center gap-2 mr-4">
        <picture 
          class="cursor-pointer" 
          title="Click to home"
          onClick$={() => navigateTo('/')}
        >
          <img 
            src={AppIcon}
            alt="logo" 
            width="30" 
            height="30"
          />
        </picture>
        <p class="font-semibold text-white text-lg">
          Dictionary of Idioms/Phrasal Verbs
        </p>
      </section>
      <section 
        id="search-wrapper" 
        class={[`flex flex-col sm:w-2/5 shadow-md 
          shadow-gray-800 hover:shadow-xl hover:shadow-gray-700`,
          {'rounded-br-md rounded-bl-md': showResultsMenu.value} 
        ]}
      >
        <section class="flex h-10 sm:h-12">
          <input
            ref={searchInputRef}
            bind:value={searchInputText}
            placeholder="Search here"
            class={["w-full rounded-tl-md outline-none pl-2",
            {'rounded-bl-md': !showResultsMenu.value}]} 
            onClick$={onClickSearchInput}
            onKeyDown$={onKeyDown}
          />
          {
            searchInputText.value.length > 0 && (
              <section 
                class="grid items-center bg-white"
                onClick$={() => searchInputText.value = ""}
              >
                <button 
                  id="clear-query-button" 
                  class="grid items-center bg-gray-300 
                  hover:bg-sky-300 p-1 mr-[1px] rounded-md" 
                  aria-label="Clear"
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 14 14" 
                    fill="none" 
                    class=""
                    xmlns="http://www.w3.org/2000/svg"
                  >
                <path 
                  fill-rule="evenodd" 
                  clip-rule="evenodd" 
                  d="M2.06834 13.4173C1.68757 13.7981 1.07024 13.7981 0.689477 13.4173C0.308716 13.0365 0.308716 12.4192 0.689477 12.0384L5.67424 7.05368L0.688891 2.06833C0.30813 1.68757 0.30813 1.07023 0.688891 0.68947C1.06965 0.308709 1.68699 0.308709 2.06775 0.68947L7.0531 5.67482L12.0385 0.68938C12.4193 0.308618 13.0366 0.308618 13.4174 0.689379C13.7982 1.07014 13.7982 1.68748 13.4174 2.06824L8.43196 7.05368L13.4168 12.0385C13.7976 12.4193 13.7976 13.0366 13.4168 13.4174C13.0361 13.7982 12.4187 13.7982 12.038 13.4174L7.0531 8.43254L2.06834 13.4173Z" 
                  fill="black"
                />
                  </svg>
                </button>
              </section>
            )
          }
          <section class="h-full bg-white">
            <div 
              class="relative mt-1 w-3/4 h-3/4 border-solid border-r-2 border-gray-300 pr-1"
            />
          </section>
          <section 
            id="search-query-button-wrapper" 
            tabIndex={0}
            class={[`z-20 grid items-center bg-white px-4 
              rounded-tr-md cursor-pointer`,
              {'rounded-br-md': !showResultsMenu.value, 
              'bg-gradient-to-r from-yellow-500 to-pink-700': searchBtnFocused.value || searchBtnHovered.value
            }]}
            onClick$={onKeyEnterSearchInput}
            onFocusin$={() => searchBtnFocused.value = true}
            onFocusout$={() => searchBtnFocused.value = false}
            onMouseEnter$={() => searchBtnFocused.value = true}
            onMouseLeave$={() => searchBtnFocused.value = false}
          >
            <button 
              id="search-query-button" 
              aria-label="Search" 
              tabIndex={-1} 
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="17" 
                class="icon" 
                viewBox="0 0 18 17"
              >
                <path 
                  fill={fillColor.value} 
                  fill-rule="evenodd" 
                  d="M1.6 7.336a5.736 5.736 0 1 1 11.471 0 5.736 5.736 0 0 1-11.471 0ZM7.336 0a7.336 7.336 0 1 0 4.957 12.743l3.56 3.561a.8.8 0 0 0 1.132-1.131l-3.636-3.636A7.336 7.336 0 0 0 7.335 0Z" 
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </section>
        </section>
        { showResultsMenu.value && (
          <section
            ref={matchedPhrasesMenu}
            class="relative w-full z-10"
          >
            <section class="absolute flex flex-col bg-white  border-2 border-t-0 w-full rounded-b-md pb-1 shadow-2xl shadow-zinc-900/50">
              <section class="flex flex-col w-full before:border-t-[1px] before:border-gray-300 before:pb-2 before:mx-2">
                {
                  matchedPhrases.value?.map((word, index) => (
                    <a 
                      key={index}
                      href={'/dictionary?search='+word}
                      class={["pl-2 cursor-pointer",
                        {'bg-blue-100 cursor:pointer': index == activePhraseIndex.value}
                      ]}  
                      onClick$={() => searchInputText.value = word}
                      onMouseEnter$={() => handleMouseEventOnActivePhrase(index, 'mouseenter')}
                      onMouseLeave$={() => activePhraseIndex.value = -1}
                    >
                      { word }
                    </a>
                  ))
                }
              </section>
            </section>
          </section>
        )}
      </section>
      
    </header>
  );
});