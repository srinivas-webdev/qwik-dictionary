import { component$, useSignal, $ } from "@builder.io/qwik";
import type { QwikMouseEvent } from "@builder.io/qwik";

import styles from './media-container.module.css'

interface MediaListProps {
  mediaList: Media[]
}

interface ActiveMediaType {
  url: string,
  type: string
}

export default component$<MediaListProps>(({mediaList}) => {
  const videoRef = useSignal<HTMLVideoElement>()
  const mediaDialog = useSignal<HTMLDialogElement>()
  const activeMedia = useSignal<ActiveMediaType>()

  const onClickMedia = $(
    (url: string, mediaType: string) => {
       activeMedia.value = {
         url: url,
         type: mediaType
       }
       mediaDialog.value?.showModal()
     }
  );

  const onClickDialog = $((e: QwikMouseEvent) => {
    const dialogDimensions = mediaDialog.value?.getBoundingClientRect()
    if (dialogDimensions) {
      if ( 
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
      if (activeMedia.value?.type == 'video')
        videoRef.value?.pause();
        mediaDialog.value?.close()
      }
    }
  })
 
  return (
    <>
      <menu class="flex flex-wrap gap-2">
        {
          mediaList.map((media) => (
            <li 
              key={media.url}
              class="italic rounded-md p-1" 
            >
              <section 
                class="bg-gray-800 hover:bg-gray-600 
                rounded-md p-2 cursor-pointer
                transition duration-300 ease-in-out hover:ease-in"
              >
                <video 
                  src={media.url} 
                  class="w-32 h-32 rounded-md"
                  onClick$={() => onClickMedia(media.url, media.type)}
                />
              </section>
            </li>
          ))
        }
      </menu>
      <dialog 
        ref={mediaDialog}
        class={["rounded-lg grid items-center max-w-2xl",
          styles.dialog
        ]}
        onClick$={onClickDialog} 
      >
        <video 
          key={activeMedia.value?.url}
          ref={videoRef}
          controls 
          autoPlay
        >
          <source 
            src={activeMedia.value?.url}
            type="video/mp4" 
          />
        </video>
      </dialog>
    </>
  );
  
});
