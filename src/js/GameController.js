import { generateTeam } from './generators';
import themes from './themes';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import PositionedCharacter from './PositionedCharacter';
import GamePlay from './GamePlay';
import cursors from './cursors';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.allPositionedCharacters = [];
    this.allowableMovementCells = [];
    this.allowableAttackCells = [];
    this.turn = GameState.from({ turn: [ 'player', 'opponent' ] }); // временно. переделать
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    const { prairie } = themes;
    this.gamePlay.drawUi(prairie);

    const { boardSize } = this.gamePlay;
    const lastCell = boardSize ** 2 - 1;
    const playerTypes = [ Bowman, Swordsman, Magician ];
    const opponentTypes = [ Vampire, Undead, Daemon ];
    const playerRemainderOfDivision = 0;
    const opponentRemainderOfDivision = boardSize - 2;

    const drawTeam = (types, remainderOfDivision) => {
      const team = generateTeam(types, 1, 2);
      const availableCells = [];

      for (let i = 0; i <= lastCell; i += 1) {
        if (i % boardSize === remainderOfDivision || i % boardSize === remainderOfDivision + 1) {
          availableCells.push(i);
        }
      }

      const positionedCharacters = [];
      team.characters.forEach((character) => {
        const position = availableCells[Math.floor(Math.random() * availableCells.length)];
        const positionIndex = availableCells.indexOf(position);
        const positionedCharacter = new PositionedCharacter(character, position);
        positionedCharacters.push(positionedCharacter);
        availableCells.splice(positionIndex, 1);
      });

      return positionedCharacters;
    };

    this.allPositionedCharacters = [
      ...drawTeam(playerTypes, playerRemainderOfDivision),
      ...drawTeam(opponentTypes, opponentRemainderOfDivision),
    ];
    this.gamePlay.redrawPositions(this.allPositionedCharacters);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    // выбор персонажа игрока
    const playerCharacters = [ 'bowman', 'swordsman', 'magician' ];
    const opponentCharacters = [ 'vampire', 'undead', 'daemon' ];
    const thisCell = this.gamePlay.cells[index];
    const characterFound = thisCell.querySelector('.character');
    const selectedCharacterIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));

    if (characterFound) {
      const playerCharacterFound = playerCharacters.some((character) => characterFound.classList.contains(character));

      if (playerCharacterFound) {
        if (selectedCharacterIndex !== -1) {
          this.gamePlay.deselectCell(selectedCharacterIndex);
        }

        this.gamePlay.selectCell(index);
        const { auto } = cursors;
        this.gamePlay.setCursor(auto);

        // расчет радиуса перемещения
        const characters = [ 'bowman', 'swordsman', 'magician', 'vampire', 'undead', 'daemon' ];
        const selectedCharacterType = characters.find((character) => thisCell.querySelector(`.${character}`));
        const allowableMovementDistances = {
          bowman: 2,
          swordsman: 4,
          magician: 1,
          vampire: 2,
          undead: 4,
          daemon: 1,
        };

        const movementDistance = allowableMovementDistances[selectedCharacterType];
        this.allowableMovementCells = [];
        for (let i = 1; i <= movementDistance; i += 1) {
          this.allowableMovementCells = this.allowableMovementCells.filter((cell) => cell >= 0 && cell <= 63);
          const lastTopCells = this.allowableMovementCells.filter((cell) => this.gamePlay.cells[cell].classList.value.includes('top'));
          if (!thisCell.classList.value.includes('top') || lastTopCells.length === 0) {
            this.allowableMovementCells.push(
              index - 7 * i,
              index - 8 * i,
              index - 9 * i,
            );
          }

          this.allowableMovementCells = this.allowableMovementCells.filter((cell) => cell >= 0 && cell <= 63);
          const lastRightCells = this.allowableMovementCells.filter((cell) => this.gamePlay.cells[cell].classList.value.includes('right'));
          if (!thisCell.classList.value.includes('right') || lastRightCells.length === 0) {
            this.allowableMovementCells.push(
              index - 9 * i,
              index + i,
              index + 9 * i,
            );
          }

          this.allowableMovementCells = this.allowableMovementCells.filter((cell) => cell >= 0 && cell <= 63);
          const lastBottomCells = this.allowableMovementCells.filter((cell) => this.gamePlay.cells[cell].classList.value.includes('bottom'));
          if (!thisCell.classList.value.includes('bottom') || lastBottomCells.length === 0) {
            this.allowableMovementCells.push(
              index + 7 * i,
              index + 8 * i,
              index + 9 * i,
            );
          }

          this.allowableMovementCells = this.allowableMovementCells.filter((cell) => cell >= 0 && cell <= 63);
          const lastLeftCells = this.allowableMovementCells.filter((cell) => this.gamePlay.cells[cell].classList.value.includes('left'));
          if (!thisCell.classList.value.includes('left') || lastLeftCells.length === 0) {
            this.allowableMovementCells.push(
              index - i,
              index - 7 * i,
              index + 7 * i,
            );
          }
        }

        // расчет радиуса атаки
        const allowableAttackDistances = {
          bowman: 2,
          swordsman: 1,
          magician: 4,
          vampire: 2,
          undead: 1,
          daemon: 4,
        };

        const attackDistance = allowableAttackDistances[selectedCharacterType];
        this.allowableAttackCells = [];
        const startCell = index - 8 * attackDistance - attackDistance;
        for (let i = 1; i <= attackDistance * 2; i += 1) {
          for (let j = 0; j <= attackDistance * 2; j += 1) {
            this.allowableAttackCells.push(startCell + (8 * i - 8) + j);
          }
        }
      }
    }

    if (selectedCharacterIndex !== -1) {
      const attackIsPossible = this.allowableAttackCells.find((cell) => cell === index);
      const movementIsPossible = this.allowableMovementCells.find((cell) => cell === index);

      if (characterFound) {
        const opponentCharacterFound = opponentCharacters.some((character) => characterFound.classList.contains(character));

        if (opponentCharacterFound) {
          if (attackIsPossible) {
            console.log('Attack'); // дописать логику
          } else {
            GamePlay.showError('Unacceptable action');
          }
        }
      } else if (movementIsPossible) {
        const thisCharacterIndex = this.allPositionedCharacters.findIndex((character) => character.position === selectedCharacterIndex);
        this.allPositionedCharacters[thisCharacterIndex].position = index;
        this.gamePlay.redrawPositions(this.allPositionedCharacters);
        this.allowableMovementCells = [];
        this.allowableAttackCells = [];
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
      } else {
        GamePlay.showError('Unacceptable action');
      }
    } else if (characterFound) {
      const opponentCharacterFound = opponentCharacters.some((character) => characterFound.classList.contains(character));
      if (opponentCharacterFound) {
        GamePlay.showError('You cannot select an opponent\'s character');
      }
    } else {
      GamePlay.showError('The character was not found');
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const { pointer, crosshair, notallowed } = cursors;

    // показ подсказки
    const characterFound = this.gamePlay.cells[index].querySelector('.character');
    if (characterFound) {
      this.gamePlay.showCellTooltip(this.getTooltipMessage(index), index);
    }

    // наведение при выбранном персонаже игрока
    const playerCharacters = [ 'bowman', 'swordsman', 'magician' ];

    const selectedCharacterIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));
    if (selectedCharacterIndex !== -1) {
      if (characterFound) {
        const playerCharacterFound = playerCharacters.some((character) => characterFound.classList.contains(character));
        if (playerCharacterFound) {
          if (!characterFound.closest('.selected-yellow')) {
            this.gamePlay.setCursor(pointer);
          }
        } else if (this.allowableAttackCells.includes(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(crosshair);
        } else {
          this.gamePlay.setCursor(notallowed);
        }
      } else if (this.allowableMovementCells.includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(pointer);
      } else {
        this.gamePlay.setCursor(notallowed);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    const { auto } = cursors;

    // скрытие подсказки
    const characterFound = this.gamePlay.cells[index].querySelector('.character');
    if (characterFound) {
      this.gamePlay.hideCellTooltip(index);
    }

    // при выбранном персонаже игрока
    const playerCharacters = [ 'bowman', 'swordsman', 'magician' ];
    const selectedCharacterIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));
    if (selectedCharacterIndex !== -1) {
      if (characterFound) {
        const playerCharacterFound = playerCharacters.some((character) => characterFound.classList.contains(character));
        if (playerCharacterFound) {
          if (!characterFound.closest('.selected-yellow')) {
            this.gamePlay.setCursor(auto);
          }
        } else {
          this.gamePlay.deselectCell(index);
          this.gamePlay.setCursor(auto);
        }
      } else if (index !== selectedCharacterIndex) {
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(auto);
      } else {
        this.gamePlay.setCursor(auto);
      }
    }
  }

  getTooltipMessage(index) {
    const character = this.allPositionedCharacters.find((item) => item.position === index);
    const {
      level, attack, defence, health,
    } = character.character;
    return `\u{1F396}${level} \u2694${attack} \u{1F6E1}${defence} \u2764${health}`;
  }
}
