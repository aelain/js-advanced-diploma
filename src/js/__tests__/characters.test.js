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

test('Bowman has correct parameters', () => {
  const bowman = new Bowman(1);
  expect(bowman).toEqual({
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'bowman',
  });
});

test('Swordsman has correct parameters', () => {
  const swordsman = new Swordsman(1);
  expect(swordsman).toEqual({
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'swordsman',
  });
});

test('Magician has correct parameters', () => {
  const magician = new Magician(1);
  expect(magician).toEqual({
    level: 1,
    attack: 10,
    defence: 40,
    health: 50,
    type: 'magician',
  });
});

test('Vampire has correct parameters', () => {
  const vampire = new Vampire(1);
  expect(vampire).toEqual({
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'vampire',
  });
});

test('Undead has correct parameters', () => {
  const undead = new Undead(1);
  expect(undead).toEqual({
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'undead',
  });
});

test('Daemon has correct parameters', () => {
  const daemon = new Daemon(1);
  expect(daemon).toEqual({
    level: 1,
    attack: 10,
    defence: 10,
    health: 50,
    type: 'daemon',
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
