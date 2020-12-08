import { invariant, MaybePromise } from '@algolia/autocomplete-shared';

import {
  AutocompleteSource,
  BaseItem,
  GetSourcesParams,
  InternalAutocompleteSource,
} from '../types';

import { noop } from './noop';

export function getNormalizedSources<TItem extends BaseItem>(
  getSources: (
    params: GetSourcesParams<TItem>
  ) => MaybePromise<Array<AutocompleteSource<TItem>>>,
  options: GetSourcesParams<TItem>
): Promise<Array<InternalAutocompleteSource<TItem>>> {
  return Promise.resolve(getSources(options)).then((sources) => {
    invariant(
      Array.isArray(sources),
      `The \`getSources\` function must return an array of sources but returned type ${JSON.stringify(
        typeof sources
      )}:\n\n${JSON.stringify(sources, null, 2)}`
    );

    return Promise.all(
      sources.filter(Boolean).map((source) => {
        const normalizedSource: InternalAutocompleteSource<TItem> = {
          getItemInputValue({ state }) {
            return state.query;
          },
          getItemUrl() {
            return undefined;
          },
          onSelect({ setIsOpen }) {
            setIsOpen(false);
          },
          onHighlight: noop,
          ...source,
        };

        return Promise.resolve(normalizedSource);
      })
    );
  });
}
