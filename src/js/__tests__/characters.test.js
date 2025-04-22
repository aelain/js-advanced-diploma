import Character from '../Character';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import { characterGenerator, generateTeam } from '../generators';

test('Creating Character causes throw', () => {
  const result = () => {
    const character = new Character(1);
  };
  expect(result).toThrow(new Error('Character cannot be created'));
});

test('Creating Character\'s children does not cause throw', () => {
  const result = () => {
    const character = new Bowman(1);
  };
  expect(result).not.toThrow(new Error('Character cannot be created'));
});

test.each([
  [ Bowman, 1, 25, 25, 50, 'bowman' ],
  [ Swordsman, 1, 40, 10, 50, 'swordsman' ],
  [ Magician, 1, 10, 40, 50, 'magician' ],
  [ Vampire, 1, 25, 25, 50, 'vampire' ],
  [ Undead, 1, 40, 10, 50, 'undead' ],
  [ Daemon, 1, 10, 10, 50, 'daemon' ],
])(('Character has correct parameters'), (Type, level, attack, defence, health, type) => {
  const character = new Type(level);
  expect(character).toEqual({
    level,
    attack,
    defence,
    health,
    type,
  });
});

test('Created characters matches to the list', () => {
  const list = [ Bowman, Swordsman, Magician ];
  const character = characterGenerator(list, 1);
  const result = list.some((element) => character.type === element.type);
  expect(result).toBe(true);
});

test('Count of characters in a team is correct', () => {
  const count = 2;
  const team = generateTeam([ Bowman, Swordsman, Magician ], 1, count);
  expect(team.characters).toHaveLength(2);
});

test('Levels of characters in a team is correct', () => {
  const level = 1;
  const team = generateTeam([ Bowman, Swordsman, Magician ], level, 2);
  const result = team.characters.every((character) => character.level === 1);
  expect(result).toBe(true);
});
