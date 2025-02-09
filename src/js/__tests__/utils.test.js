import { calcTileType, calcHealthLevel } from '../utils';

const boardSize = 8;

test('if index = 0, result should be top-left', () => {
  const result = calcTileType(0, boardSize);
  expect(result).toBe('top-left');
});

test('if index = 4, result should be top', () => {
  const result = calcTileType(4, boardSize);
  expect(result).toBe('top');
});

test('if index = 7, result should be left', () => {
  const result = calcTileType(7, boardSize);
  expect(result).toBe('top-right');
});

test('if index = 56, result should be bottom-left', () => {
  const result = calcTileType(56, boardSize);
  expect(result).toBe('bottom-left');
});

test('if index = 60, result should be bottom', () => {
  const result = calcTileType(60, boardSize);
  expect(result).toBe('bottom');
});

test('if index = 63, result should be bottom-left', () => {
  const result = calcTileType(63, boardSize);
  expect(result).toBe('bottom-right');
});

test('if index = 8, result should be left', () => {
  const result = calcTileType(8, boardSize);
  expect(result).toBe('left');
});

test('if index = 15, result should be left', () => {
  const result = calcTileType(15, boardSize);
  expect(result).toBe('right');
});

test('if index = 49, result should be center', () => {
  const result = calcTileType(49, boardSize);
  expect(result).toBe('center');
});

test('if health = 5, result should be critical', () => {
  const result = calcHealthLevel(5);
  expect(result).toBe('critical');
});

test('if health = 49, result should be normal', () => {
  const result = calcHealthLevel(49);
  expect(result).toBe('normal');
});

test('if health = 56, result should be high', () => {
  const result = calcHealthLevel(56);
  expect(result).toBe('high');
});
