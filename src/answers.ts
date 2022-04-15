import type { FindAnswersOptions, SearchOptions } from '@algolia/client-search';
import type { SearchIndex } from 'algoliasearch/lite';

import type { FederatedHits, HitWithAnswer, SourceId } from './types';

interface FindAnswersParams {
  index: SearchIndex;
  query: string;
  lang?: string;
  searchParams?: SearchOptions;
  answerParams?: FindAnswersOptions & {
    EXPERIMENTAL_illuminate?: number;
  };
  sourceId: SourceId;
}

export const customFindAnswers = ({
  index,
  query,
  lang = 'en',
  searchParams,
  answerParams,
  sourceId,
}: FindAnswersParams): Promise<
  HitWithAnswer<FederatedHits> & { sourceId: SourceId }
> =>
  index
    .findAnswers<FederatedHits>(query, [lang], {
      threshold: 90,
      nbHits: 1,
      // EXPERIMENTAL_illuminate: 1,
      params: {
        ...searchParams,
        optionalWords: query,
        highlightPreTag: '<mark>',
       highlightPostTag: '</mark>',
      },
      ...answerParams,
    })
    .then(({ hits }) =>
      hits.map((hit) => ({
        url: ((): string => {
          switch (sourceId) {
            case 'help center':
              return `/${hit.locale ? hit.locale.locale : ''}/articles/${
                hit.id
              }`;
            case 'academy':
              return `/training/${hit.id}`;
            default:
              return '';
          }
        })(),
        ...hit,
        sourceId,
      }))
    )
    .catch((err) => err);
