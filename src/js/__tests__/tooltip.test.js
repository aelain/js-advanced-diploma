import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';

test('Bowman\'s tooltip gives the correct data', () => {
  const gameController = new GameController();
  const bowman = new Bowman(1);
  const character = new PositionedCharacter(bowman, 8);
  gameController.allPositionedCharacters.push(character);
  const tooltip = gameController.getTooltipMessage(8);
  expect(tooltip).toEqual('\u{1F396}1 \u269425 \u{1F6E1}25 \u276450');
});

test('Swordsman\'s tooltip gives the correct data', () => {
  const gameController = new GameController();
  const swordsman = new Swordsman(1);
  const character = new PositionedCharacter(swordsman, 8);
  gameController.allPositionedCharacters.push(character);
  const tooltip = gameController.getTooltipMessage(8);
  expect(tooltip).toEqual('\u{1F396}1 \u269440 \u{1F6E1}10 \u276450');
});

test('Magician\'s tooltip gives the correct data', () => {
  const gameController = new GameController();
  const magician = new Magician(1);
  const character = new PositionedCharacter(magician, 8);
  gameController.allPositionedCharacters.push(character);
  const tooltip = gameController.getTooltipMessage(8);
  expect(tooltip).toEqual('\u{1F396}1 \u269410 \u{1F6E1}40 \u276450');
});

test('Vampire\'s tooltip gives the correct data', () => {
  const gameController = new GameController();
  const vampire = new Vampire(1);
  const character = new PositionedCharacter(vampire, 8);
  gameController.allPositionedCharacters.push(character);
  const tooltip = gameController.getTooltipMessage(8);
  expect(tooltip).toEqual('\u{1F396}1 \u269425 \u{1F6E1}25 \u276450');
});

test('Undead\'s tooltip gives the correct data', () => {
  const gameController = new GameController();
  const undead = new Undead(1);
  const character = new PositionedCharacter(undead, 8);
  gameController.allPositionedCharacters.push(character);
  const tooltip = gameController.getTooltipMessage(8);
  expect(tooltip).toEqual('\u{1F396}1 \u269440 \u{1F6E1}10 \u276450');
});

test('Daemon\'s tooltip gives the correct data', () => {
  const gameController = new GameController();
  const daemon = new Daemon(1);
  const character = new PositionedCharacter(daemon, 8);
  gameController.allPositionedCharacters.push(character);
  const tooltip = gameController.getTooltipMessage(8);
  expect(tooltip).toEqual('\u{1F396}1 \u269410 \u{1F6E1}10 \u276450');
});
