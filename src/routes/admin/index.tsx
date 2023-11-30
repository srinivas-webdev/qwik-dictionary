import { component$ } from "@builder.io/qwik";
import { Form, useLocation } from '@builder.io/qwik-city';
import type { DocumentHead } from "@builder.io/qwik-city";
import { 
  useAuthSession, 
  useAuthSignin, 
  useAuthSignout 
} from '~/routes/plugin@auth';


export default component$(() => {
  const location = useLocation();
  const session = useAuthSession();
  const signIn = useAuthSignin();
  const signOut = useAuthSignout();

  return (
    <section class="w-full mx-auto bg-white dark:bg-gray-800 px-5 py-4 rounded-md shadow-xl">
      <section class="flex items-center justify-between">
        {
        session.value?.user?.name && (
          <h1 
            class="[clip-path:polygon(0%_15%,0%_100%,100%_85%,100%_0%)] bg-yellow-500 p-2 capitalize text-2xl italic"
          >
            Hello {session.value.user.name }
          </h1>
        )
        }
        <section class="flex items-center space-x-2">
        {
          (session.value?.user !== undefined) ? (
            <button 
              class="flex items-center justify-center space-x-2 bg-blue-500 text-white rounded-lg py-2 px-3 text-lg" 
            >
              <span>Add New Phrase</span>
            </button>
          ) : (
            <h1 class="text-lg  dark:text-white">
              Not logged in
            </h1>
          )
        }
        </section>
        {
          (session.value?.user !== undefined) ? (
            <button 
              class="flex items-center justify-center space-x-2 bg-red-500 text-white rounded-lg py-2 px-3 text-lg" 
              onClick$={() => signOut.submit({ callbackUrl: '/admin' })}
            >
              <span>Logout</span>
            </button>
          ) : (
            <Form action={signIn}>
              <input type="hidden" name="providerId" value="Credentials" />
              <input type="hidden" name="options.callbackUrl" value={location.url.pathname} />
              <button
                class="flex items-center justify-center space-x-2 bg-green-700 text-white rounded-lg py-2 px-3 text-lg" 
              >
                Log In
              </button>
            </Form>
          )
        }
      </section>
    </section>
  )
})

export const head: DocumentHead = () => {
  return {
    title: "Admin Page"
  }
};