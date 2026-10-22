import test from 'node:test';
import assert from 'node:assert/strict';
import {makeHomeBands, moveHomeFocus} from '../src/lib/homeNavigation.ts';

const bands = makeHomeBands([
  {id: 'apps', items: Array(8).fill(null)},
  {id: 'empty', items: []},
  {id: 'sources', items: Array(5).fill(null)}
], 6);

test('wraps apps into spatial rows and skips empty groups', () => {
  assert.deepEqual(bands, [
    {groupId: 'apps', start: 0, count: 6},
    {groupId: 'apps', start: 6, count: 2},
    {groupId: 'sources', start: 0, count: 5}
  ]);
});

test('preserves the column across short rows and source boundaries', () => {
  let focus = {band: 0, column: 4, preferredColumn: 4};
  focus = moveHomeFocus(bands, focus, 'down');
  assert.equal(focus.column, 1);
  focus = moveHomeFocus(bands, focus, 'down');
  assert.deepEqual(focus, {band: 2, column: 4, preferredColumn: 4});
  focus = moveHomeFocus(bands, focus, 'up');
  focus = moveHomeFocus(bands, focus, 'up');
  assert.equal(focus.column, 4);
});

test('horizontal movement changes the preferred column without crossing rows', () => {
  const focus = moveHomeFocus(bands, {band: 1, column: 1, preferredColumn: 5}, 'left');
  assert.deepEqual(focus, {band: 1, column: 0, preferredColumn: 0});
  assert.equal(moveHomeFocus(bands, focus, 'left').column, 0);
});

test('handles removal of focused rows and an entirely empty launcher', () => {
  assert.deepEqual(moveHomeFocus([], {band: 7, column: 5, preferredColumn: 5}, 'down'), {band: 0, column: 0, preferredColumn: 0});
  assert.equal(moveHomeFocus(bands, {band: 99, column: 99, preferredColumn: 5}, 'right').column, 4);
});
