import { calcTileType, calcHealthLevel } from '../utils';

const boardSize = 8;

test.each([
  [ 0, 'top-left' ],
  [ 4, 'top' ],
  [ 7, 'top-right' ],
  [ 56, 'bottom-left' ],
  [ 60, 'bottom' ],
  [ 63, 'bottom-right' ],
  [ 8, 'left' ],
  [ 15, 'right' ],
  [ 49, 'center' ],
])(('Indexes have correct parameters'), (index, parameter) => {
  const result = calcTileType(index, boardSize);
  expect(result).toBe(parameter);
});

test.each([
  [ 5, 'critical' ],
  [ 49, 'normal' ],
  [ 56, 'high' ],
])(('Health has correct parameters'), (health, parameter) => {
  const result = calcHealthLevel(health);
  expect(result).toBe(parameter);
});
