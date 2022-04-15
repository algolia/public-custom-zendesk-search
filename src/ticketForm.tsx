import { Link, ContentTabs, stl } from '@algolia/satellite';
import { h, Fragment, render } from 'preact';
import { useState } from 'preact/hooks';
import { ArrowRight } from 'react-feather';
import 'preact/debug';

import {
  BASE_URLS,
  contentAttribute,
  REQUEST_INPUT_SELECTOR,
  SOURCES,
  titleAttribute,
} from './constants';
import type { FederatedHits, HitWithAnswer, SourceId } from './types';
import type { GroupedArrayObject } from './utils';
import { capitalizeFirst, getSortedHits, groupBy } from './utils';

const AnswerHitWithTitle = ({
  hit: answerHit,
  showExtract,
}: {
  hit: HitWithAnswer<FederatedHits> & { sourceId: SourceId };
  showExtract: boolean;
}): JSX.Element => {
  const _titleAttribute = titleAttribute(answerHit);
  const formattedTitleAttribute = Array.isArray(_titleAttribute)
    ? _titleAttribute.join('.')
    : _titleAttribute;
  const title = Array.isArray(_titleAttribute)
    ? _titleAttribute.reduce((acc, attr) => acc[attr], answerHit)
    : answerHit[_titleAttribute];
  const _conAttr = contentAttribute(answerHit);
  const formattedConAttribute = Array.isArray(_conAttr)
    ? _conAttr.join('.')
    : _conAttr;
  const content = Array.isArray(_conAttr)
    ? _conAttr.reduce((acc, attr) => acc[attr], answerHit)
    : answerHit[_conAttr];
    const regex1 = new RegExp('<em>', 'g')
    const regex2 = new RegExp('</em>', 'g')
  return (
    <div
      style={{ maxWidth: 600 }}
      className={stl`p-4 bg-grey-100 rounded`}
      key={answerHit.objectID}
    >
      <h4 className={stl`font-bold text-lg text-grey-900`}
      dangerouslySetInnerHTML={{
        __html: `${
          answerHit._answer.extractAttribute === "title" && (answerHit._answer.score>190)
            ? answerHit._answer.extract
            : capitalizeFirst(title)
        }`,
      }}>
      </h4>
      {showExtract ? (
        <p
          className={stl`text-grey-900`}
          dangerouslySetInnerHTML={{
            __html: `...${
              answerHit._answer.extractAttribute !== "title" && (answerHit._answer.score>190)
                ? answerHit._answer.extract
                : content
            }...`,
          }}
        />
      ) : (
        ''
      )}
      <Link href={`${BASE_URLS[answerHit.sourceId]}${answerHit.url}`}>
        Read More
      </Link>
    </div>
  );
};

export const TicketFormApp = (): JSX.Element => {
  const [query, setQuery] = useState<string>('');

  const instantSources = SOURCES;

  const mappedSearchUrls: Record<SourceId, string> = instantSources.reduce(
    (prev, next) => ({ ...prev, [next.sourceId]: next.searchUrl }),
    {} as Record<SourceId, string>
  );

  const [groupedHits, setGroupedHits] = useState<
    Array<
      GroupedArrayObject<HitWithAnswer<FederatedHits> & { sourceId: SourceId }>
    >
  >([]);

  const onInput = async (e): Promise<void> => {
    setQuery(e.target.value);

    const { hits } = await getSortedHits(instantSources, e.target.value, {
      nbHits: 3,
      // EXPERIMENTAL_illuminate: 1,
    });

    setGroupedHits(
      groupBy<
        HitWithAnswer<FederatedHits> & {
          sourceId: SourceId;
        },
        'sourceId'
      >(hits, 'sourceId')
    );
  };

  return (
    <Fragment>
      <input
        data-testid="input-element"
        id={REQUEST_INPUT_SELECTOR.replace('#', '')}
        type="search"
        className={stl`mb-4`}
        onInput={onInput}
      />
      {groupedHits.length ? (
        <div
          style={{ maxWidth: 600 }}
          className="tw-based"
          data-testid="results-container"
        >
          <p className={stl`text-md mb-4 text-nebula-900 font-bold`}>
            These resources might help:
          </p>
          <ContentTabs
            tabs={groupedHits.map((group) => ({
              id: group.title,
              label: capitalizeFirst(group.title),
              content: (
                <div key={group.title} className={stl`flex flex-col space-y-2`}>
                  {group.items.map((hit, i) => (
                    <AnswerHitWithTitle
                      key={hit.objectID}
                      showExtract={true}
                      hit={hit}
                    />
                  ))}
                  {group.items.length > 2 ? (
                    <a
                      className={stl`flex space-x-2 ml-auto`}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${
                        mappedSearchUrls[group.title]
                      }${encodeURIComponent(query)}`}
                    >
                      See all {group.title} results
                      <ArrowRight />
                    </a>
                  ) : (
                    ''
                  )}
                </div>
              ),
            }))}
            className={stl`mb-2`}
          />
        </div>
      ) : (
        ''
      )}
    </Fragment>
  );
};

const ticketForm = ({ input }: { input: HTMLInputElement }): void => {
  render(h(TicketFormApp, {}), input.parentElement, input);
};

export const startTicketForm = (input: HTMLInputElement): void => {
  ticketForm({
    input,
  });
};
