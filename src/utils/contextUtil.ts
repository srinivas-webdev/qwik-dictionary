import {
  type Signal,
  createContextId,
} from '@builder.io/qwik';

export const PhraseContext = createContextId<Signal<PhraseDetails | undefined>>(
  'phrase-context'
);