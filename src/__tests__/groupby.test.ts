import { groupBy } from '../utils';

const original = [
  {
    sortingKey: 'sorted1',
    otherKey1: 'test1-1',
    otherKey2: 'test1-2',
  },
  {
    sortingKey: 'sorted2',
    otherKey1: 'test3-1',
    otherKey2: 'test3-2',
  },
  {
    sortingKey: 'sorted3',
    otherKey1: 'test4-1',
    otherKey2: 'test4-2',
  },
  {
    sortingKey: 'sorted3',
    otherKey1: 'test5-1',
    otherKey2: 'test5-2',
  },
  {
    sortingKey: 'sorted1',
    otherKey1: 'test2-1',
    otherKey2: 'test2-2',
  },
];

describe('array of objects sorting by key behavior', () => {
  it('should group the array by the provided key and keep the order', () => {
    const expected = [
      {
        title: 'sorted1',
        items: [
          {
            sortingKey: 'sorted1',
            otherKey1: 'test1-1',
            otherKey2: 'test1-2',
          },
          {
            sortingKey: 'sorted1',
            otherKey1: 'test2-1',
            otherKey2: 'test2-2',
          },
        ],
      },
      {
        title: 'sorted2',
        items: [
          {
            sortingKey: 'sorted2',
            otherKey1: 'test3-1',
            otherKey2: 'test3-2',
          },
        ],
      },
      {
        title: 'sorted3',
        items: [
          {
            sortingKey: 'sorted3',
            otherKey1: 'test4-1',
            otherKey2: 'test4-2',
          },
          {
            sortingKey: 'sorted3',
            otherKey1: 'test5-1',
            otherKey2: 'test5-2',
          },
        ],
      },
    ];

    expect(groupBy(original, 'sortingKey')).toEqual(expected);
  });
});
