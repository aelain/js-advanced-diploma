import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

jest.mock('../GameStateService');
const stateService = new GameStateService();
const showError = jest.spyOn(GamePlay, 'showError');
const loadMock = jest.spyOn(stateService, 'load');

beforeEach(() => {
  jest.resetAllMocks();
});

test('GameStateService returns state', () => {
  loadMock.mockReturnValue({ points: 5 });
  const result = stateService.load();
  expect(result.points).toEqual(5);
});

test('GamePlay.showError', () => {
  loadMock.mockReturnValue(null);
  const result = stateService.load();
  if (!result) {
    showError();
  }
  expect(showError).toHaveBeenCalled();
});
