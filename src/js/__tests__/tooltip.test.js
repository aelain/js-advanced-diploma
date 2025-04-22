import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';

const getTooltip = (Type) => {
  const gameController = new GameController();
  gameController.state.allPositionedCharacters = [];
  const character = new Type(1);
  const positionedCharacter = new PositionedCharacter(character, 8);
  gameController.state.allPositionedCharacters.push(positionedCharacter);
  return gameController.getTooltipMessage(8);
};

test.each([
  [ Bowman, 1, 25, 25, 50 ],
  [ Swordsman, 1, 40, 10, 50 ],
  [ Magician, 1, 10, 40, 50 ],
  [ Vampire, 1, 25, 25, 50 ],
  [ Undead, 1, 40, 10, 50 ],
  [ Daemon, 1, 10, 10, 50 ],
])(('Tooltip gives the correct data'), (Type, level, attack, defence, health) => {
  const tooltip = getTooltip(Type);
  expect(tooltip).toEqual(`\u{1F396}${level} \u2694${attack} \u{1F6E1}${defence} \u2764${health}`);
});
