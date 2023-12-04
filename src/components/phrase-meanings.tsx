import { component$, useSignal, $ } from "@builder.io/qwik";
import {
  useContext,
} from '@builder.io/qwik';

import { PhraseContext } from "~/utils/contextUtil";

const colors = [
  'rgb(30, 50, 100)', 'rgb(0, 100, 80)',
  'rgb(232, 17, 91)', 'rgb(194 0 23)',
  'rgb(30, 50, 100)', 'rgb(140, 25, 50)',
  'rgb(20, 138, 8)', 'rgb(235, 30, 50)'
]

const cancelButtonStyle = `my-1 px-1 bg-white text-pink-600 rounded-md 
  font-bold border-2 border-pink-600 
  hover:outline hover:outline-offset-1 hover:outline-sky-600`

const confirmButtonStyle = `my-1 px-1 bg-rose-600 
  text-white rounded-md font-md border-2 border-pink-600 
  hover:outline hover:outline-offset-1 hover:outline-sky-600`

export default component$(() => {
  const phraseDetails = useContext(PhraseContext);
  const activeMenuIndex = useSignal<number | undefined>(0);
  const editMeaning = useSignal(false);

  const onClickAddMeaning = $(() => {
    activeMenuIndex.value = phraseDetails.value?.meanings.length
    phraseDetails.value?.meanings.push({
      name: "",
      examples: [],
      media: []
    })
    
    editMeaning.value = true
  })

  const onClickConfirm = $(() => {
    if (phraseDetails.value && activeMenuIndex.value) {
      const clonedMeaning = structuredClone(phraseDetails.value.meanings[activeMenuIndex.value])
      phraseDetails.value.meanings[activeMenuIndex.value] = clonedMeaning
      editMeaning.value = false
    }
  })

  return (
    <section>
      <section class="realtive px-2 flex justify-between items-center flex-wrap bg-pink-100">
        <p class="mx-2 text-md font-bold bg-pink-100 rounded-md">
          Meanings
        </p>
        <menu class="flex gap-2">
        {
          editMeaning.value && (
            <button 
              class={cancelButtonStyle}
              onClick$={() => onClickConfirm()}
            >
              Delete
            </button>
          )
        }{
          editMeaning.value && (
            <button 
              class={confirmButtonStyle}
              onClick$={() => onClickConfirm()}
            >
              Save
            </button>
          )
        }{
          !editMeaning.value && (
            <p 
              class="text-white font-semibold bg-sky-900 p-2 rounded-md my-1 cursor-pointer
              hover:outline hover:outline-offset-1 hover:outline-yellow-600"
              onClick$={() => onClickAddMeaning()}
            >
              Add Meaning
            </p>
          )
        }
        </menu>
      </section>
      {
        (!editMeaning.value) && (
          <menu 
            class={{'flex flex-wrap gap-2 rounded-sm p-2 bg-black': phraseDetails.value?.meanings.length}}
          >
            {
              phraseDetails.value?.meanings.map((meaning) => (
                <li 
                  key={meaning.name}
                  class="p-2 rounded-md text-white w-32 h-32 text-ellipsis cursor-pointer"
                  style={ `background-color: ${colors[Math.floor(Math.random()*colors.length)]}` }  
                  onClick$={() => onClickAddMeaning()}
                >
                  <p class="text-ellipsis overflow-hidden whitespace-normal line-clamp-5">
                    { meaning.name }
                  </p>
                </li>
              ))
            }
          </menu>
        )
      }
    </section>
  )
})

