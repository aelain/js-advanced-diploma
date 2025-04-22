import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import PositionedCharacter from '../PositionedCharacter';

const gamePlay = new GamePlay();
const gameController = new GameController(gamePlay);
gameController.state = {
  level: 1,
  userTurn: true,
  allPositionedCharacters: [],
};

test.each([
  [ Bowman, 'bowman', 16 ],
  [ Swordsman, 'swordsman', 27 ],
  [ Magician, 'magician', 8 ],
  [ Vampire, 'vampire', 16 ],
  [ Undead, 'undead', 27 ],
  [ Daemon, 'daemon', 8 ],
])(('Characters have correct radius of movement'), (Type, type, radiusOfMovement) => {
  const character = new Type(1);
  const positionedBowman = new PositionedCharacter(character, 27);
  gameController.state.allPositionedCharacters.push(positionedBowman);
  gameController.getRadiusesOfMovementAndAttack(27, type);
  const result = gameController.allowableMovementCells;
  expect(result).toHaveLength(radiusOfMovement);
});

test.each([
  [ Bowman, 'bowman', 24 ],
  [ Swordsman, 'swordsman', 8 ],
  [ Magician, 'magician', 63 ],
  [ Vampire, 'vampire', 24 ],
  [ Undead, 'undead', 8 ],
  [ Daemon, 'daemon', 63 ],
])(('Characters have correct radius of attack'), (Type, type, radiusOfAttack) => {
  const character = new Type(1);
  const positionedBowman = new PositionedCharacter(character, 27);
  gameController.state.allPositionedCharacters.push(positionedBowman);
  gameController.getRadiusesOfMovementAndAttack(27, type);
  const result = gameController.allowableAttackCells;
  expect(result).toHaveLength(radiusOfAttack);
});
