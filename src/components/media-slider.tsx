import { 
  component$, 
  useSignal,
  useVisibleTask$,
  $,
  useId,
} from "@builder.io/qwik";
import type { QwikTouchEvent } from "@builder.io/qwik";
import gsap from "gsap";

import LeftArrowImg from '~/assets/chevron-left.svg'
import RightArrowImg from '~/assets/chevron-right.svg'

interface MediaListProps {
  mediaList: Media[]
}

export default component$<MediaListProps>(({mediaList}) => {
  const container = useSignal<HTMLElement>()
  const disableLeftArrow = useSignal<boolean>(true)
  const disableRightArrow = useSignal<boolean>(false)
  const id = useId();
  const sliderId = `slider-${id}`;
  
  const index = useSignal(0)
  const slideAmount = 248
  const startPosX = useSignal(0)

  useVisibleTask$(async () => {
    const containerWidth = container.value?.offsetWidth
    const mediaWidth = mediaList.length * slideAmount
    disableLeftArrow.value = true

    if (mediaList.length === 1) {
      disableRightArrow.value = true
    }
    
    if (containerWidth && mediaWidth && containerWidth > mediaWidth) {
      disableRightArrow.value = true
    }
  });

  const onClickLeft = $(() => {
    if (index.value > 0) {
      index.value -= 1
      gsap.to("#"+sliderId+" .slide", {
        x: Number(`${-index.value * slideAmount}`),
        duration: 0.5,
        onComplete: () => {
          disableRightArrow.value = false
          if (index.value === 0) 
            disableLeftArrow.value = true
        }
      })
    }
  })

  const onClickRight = $(() => {
    if (index.value < mediaList.length - 1) {
      index.value += 1
      gsap.to("#"+sliderId+" .slide", {
        x: Number(`-${index.value * slideAmount}`),
        duration: 0.5,
        onComplete: () => {
          disableLeftArrow.value = false
          if (index.value === mediaList.length - 1) 
              disableRightArrow.value = true
        }
      })
    }
  })

  const onTouchStart = $((ev: QwikTouchEvent) => {
    const posX = ev.touches[0].clientX
    startPosX.value = posX
  })

  const onTouchEnd = $((ev: QwikTouchEvent) => {
    const deltaX = ev.changedTouches[0].clientX - startPosX.value
    if (deltaX > 0) {
      onClickLeft()
    } else if (deltaX < 0) {
      onClickRight()
    }
  })

  
  return (
    <div 
      ref={container} 
      class="flex gap-2 overflow-hidden p-1"
    >
      <section class="grid place-items-center">
        <button 
          disabled={disableLeftArrow.value}
          class={[`bg-purple-500 w-8 h-8 grid place-items-center 
          disabled:bg-gray-400 p-2 rounded-full hover:scale-125
          hover:bg-orange-600`]}
          onClick$={onClickLeft}
        >
          <img 
            src={LeftArrowImg}
            alt="left" 
            width={10}
            height={10}
          />
        </button>
      </section>
      <section
        id={sliderId}
        class="flex gap-[8px] overflow-hidden"
        onTouchStart$={onTouchStart}
        onTouchEnd$={onTouchEnd}
      >
        {
          mediaList.map((media: Media) => (
            <div key={media.url} class="shrink-0 w-[240px] cursor-pointer slide">
              <video 
                src={media.url}
                controls
                class="rounded-md"
              />
            </div>
          ))
        }
      </section>
      <section class="grid place-items-center">
        <button 
          disabled={disableRightArrow.value}
          class="bg-purple-500 w-8 h-8 grid place-items-center disabled:bg-gray-400
          p-2 rounded-full hover:scale-125 hover:bg-orange-600"
          onClick$={onClickRight}
        >
          <img 
            src={RightArrowImg}
            alt="left" 
            width={10}
            height={10}
          />
        </button>
      </section>
    </div>
  );
  
});
