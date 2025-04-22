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
    this.allowableMovementCells = [];
    this.allowableAttackCells = [];
    this.state = {};
    this.userCharacters = [ 'bowman', 'swordsman', 'magician' ];
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.startGame();
  }

  startGame() {
    const { prairie } = themes;
    this.gamePlay.drawUi(prairie);
    this.state = GameState.from({
      level: 1,
      userTurn: true,
      allPositionedCharacters: [],
      points: 0,
      // maxPoints: this.stateService.load()?.maxPoints !== null ? this.stateService.load()?.maxPoints : 0,
      maxPoints: Number(this.stateService.load()?.maxPoints) || 0,
    });

    const { boardSize } = this.gamePlay;
    const userTypes = [ Bowman, Swordsman, Magician ];
    const computerTypes = [ Vampire, Undead, Daemon ];
    const userRemainderOfDivision = 0;
    const computerRemainderOfDivision = boardSize - 2;

    this.state.allPositionedCharacters = [
      ...this.drawTeam(userTypes, 1, 2, userRemainderOfDivision),
      ...this.drawTeam(computerTypes, 1, 2, computerRemainderOfDivision),
    ];
    this.gamePlay.redrawPositions(this.state.allPositionedCharacters);
  }

  onNewGameClick() {
    if (this.gamePlay.cellClickListeners.length === 0) {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
      this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    }
    this.startGame();
  }

  onSaveGameClick() {
    this.stateService.save(this.state);
    GamePlay.showMessage('The game is saved');
  }

  onLoadGameClick() {
    const savingGame = this.stateService.load();
    if (savingGame?.level) {
      this.state = savingGame;
      if (this.gamePlay.cellClickListeners.length === 0) {
        this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
        this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
        this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
        this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
      }

      const {
        prairie,
        desert,
        arctic,
        mountain,
      } = themes;

      if (this.state.level === 1) {
        this.gamePlay.drawUi(prairie);
      } else if (this.state.level === 2) {
        this.gamePlay.drawUi(desert);
      } else if (this.state.level === 3) {
        this.gamePlay.drawUi(arctic);
      } else if (this.state.level === 4) {
        this.gamePlay.drawUi(mountain);
      }

      this.gamePlay.redrawPositions(this.state.allPositionedCharacters);
      const selectedCharacterIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));
      if (selectedCharacterIndex !== -1) {
        this.gamePlay.deselectCell(selectedCharacterIndex);
      }
    } else {
      GamePlay.showError('The saved game was not found');
    }
  }

  onCellClick(index) {
    // TODO: react to click
    // выбор персонажа игрока
    const { auto } = cursors;
    const playerCharacters = this.state.userTurn ? [ 'bowman', 'swordsman', 'magician' ] : [ 'vampire', 'undead', 'daemon' ];
    const opponentCharacters = this.state.userTurn ? [ 'vampire', 'undead', 'daemon' ] : [ 'bowman', 'swordsman', 'magician' ];
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
        this.gamePlay.setCursor(auto);

        // расчет радиусов перемещения и атаки
        const characters = [ 'bowman', 'swordsman', 'magician', 'vampire', 'undead', 'daemon' ];
        const selectedCharacterType = characters.find((character) => thisCell.querySelector(`.${character}`));
        this.getRadiusesOfMovementAndAttack(index, selectedCharacterType);
      }
    }

    // атака и перемещение
    if (selectedCharacterIndex !== -1) {
      const attackIsPossible = this.allowableAttackCells.find((cell) => cell === index);
      const movementIsPossible = this.allowableMovementCells.find((cell) => cell === index);

      if (characterFound) {
        const opponentCharacterFound = opponentCharacters.find((character) => characterFound.classList.contains(character));

        // атака
        if (opponentCharacterFound) {
          if (typeof attackIsPossible !== 'undefined') {
            const selectedCharacterInArr = this.state.allPositionedCharacters.find((character) => character.position === selectedCharacterIndex);
            const targetCharacterInArr = this.state.allPositionedCharacters.find((character) => character.position === index);
            const targetCharacterIndexInArr = this.state.allPositionedCharacters.findIndex((character) => character.position === index);
            const { attack } = selectedCharacterInArr.character;
            const { defence } = targetCharacterInArr.character;
            let damage = Math.max(attack - defence, attack * 0.1);
            if (damage % 1 !== 0) {
              damage = Number(damage.toFixed(2));
            }
            const { userTurn } = this.state;

            this.gamePlay.showDamage(index, damage).then(
              () => {
                this.state.userTurn = userTurn;
                let newHealth = this.state.allPositionedCharacters[targetCharacterIndexInArr].character.health;
                newHealth -= damage;
                if (newHealth % 1 !== 0) {
                  newHealth = Number(newHealth.toFixed(2));
                }
                this.state.allPositionedCharacters[targetCharacterIndexInArr].character.health = newHealth;

                if (newHealth <= 0) {
                  this.gamePlay.deselectCell(index);
                  this.state.allPositionedCharacters.splice(targetCharacterIndexInArr, 1);
                  this.gamePlay.hideCellTooltip(index);
                  if (this.state.userTurn) {
                    this.state.points += 100;
                  } else {
                    this.state.points -= 100;
                  }
                }

                // поражение, конец игры
                const userCharactersInGame = this.state.allPositionedCharacters.find((character) => this.userCharacters.find((type) => character.character.type === type));
                if (!userCharactersInGame) {
                  GamePlay.showMessage('You lost!');
                  this.gamePlay.cellClickListeners = [];
                  this.gamePlay.cellEnterListeners = [];
                  this.gamePlay.cellLeaveListeners = [];
                  this.gamePlay.saveGameListeners = [];
                  this.gamePlay.setCursor(auto);
                  this.gamePlay.deselectCell(index);
                }

                // победа: повышение уровня персонажа и поднятие уровня игры
                const computerCharacters = [ 'vampire', 'undead', 'daemon' ];
                const computerCharactersInGame = this.state.allPositionedCharacters.find((character) => computerCharacters.find((type) => character.character.type === type));
                let endGame;

                if (!computerCharactersInGame) {
                  if (this.state.level < 4) {
                    this.state.level += 1;
                    this.state.allPositionedCharacters.forEach((character, indexInArr) => {
                      const { attack: attackBefore, defence: defenceBefore, health } = character.character;
                      this.state.allPositionedCharacters[indexInArr].character.attack = Math.max(attackBefore, (attackBefore * (80 + health)) / 100);
                      this.state.allPositionedCharacters[indexInArr].character.defence = Math.max(defenceBefore, (defenceBefore * (80 + health)) / 100);
                      this.state.allPositionedCharacters[indexInArr].character.health += 80;

                      if (this.state.allPositionedCharacters[indexInArr].character.attack % 1 !== 0) {
                        this.state.allPositionedCharacters[indexInArr].character.attack = Number(this.state.allPositionedCharacters[indexInArr].character.attack.toFixed(2));
                      }

                      if (this.state.allPositionedCharacters[indexInArr].character.defence % 1 !== 0) {
                        this.state.allPositionedCharacters[indexInArr].character.defence = Number(this.state.allPositionedCharacters[indexInArr].character.defence.toFixed(2));
                      }

                      if (this.state.allPositionedCharacters[indexInArr].character.health > 100) {
                        this.state.allPositionedCharacters[indexInArr].character.health = 100;
                      }
                      this.state.allPositionedCharacters[indexInArr].character.level += 1;
                    });

                    // смена локации
                    const { desert, arctic, mountain } = themes;
                    if (this.state.level === 2) {
                      this.gamePlay.drawUi(desert);
                    } else if (this.state.level === 3) {
                      this.gamePlay.drawUi(arctic);
                    } else if (this.state.level === 4) {
                      this.gamePlay.drawUi(mountain);
                    }

                    // добавление персонажей на новом уровне
                    const { boardSize } = this.gamePlay;
                    const userTypes = [ Bowman, Swordsman, Magician ];
                    const computerTypes = [ Vampire, Undead, Daemon ];
                    const userRemainderOfDivision = 0;
                    const computerRemainderOfDivision = boardSize - 2;
                    const newCharacterCount = this.state.level + 1;
                    const newUserCharacterCount = newCharacterCount - this.state.allPositionedCharacters.length;

                    this.state.allPositionedCharacters.push(
                      ...this.drawTeam(userTypes, this.state.level, newUserCharacterCount, userRemainderOfDivision),
                      ...this.drawTeam(computerTypes, this.state.level, newCharacterCount, computerRemainderOfDivision),
                    );
                  } else {
                    // окончательная победа, конец игры
                    this.gamePlay.cellClickListeners = [];
                    this.gamePlay.cellEnterListeners = [];
                    this.gamePlay.cellLeaveListeners = [];
                    this.gamePlay.saveGameListeners = [];
                    this.gamePlay.setCursor(auto);
                    this.gamePlay.deselectCell(index);
                    this.gamePlay.deselectCell(selectedCharacterIndex);
                    endGame = true;

                    // начисление очков
                    const savedState = this.stateService.load();
                    if (savedState) {
                      savedState.maxPoints = Math.max(savedState.maxPoints, this.state.points);
                      this.stateService.save(savedState);
                    } else {
                      this.stateService.save({ maxPoints: this.state.points });
                    }

                    GamePlay.showMessage(`You win! Points scored: ${this.state.points}. Maximum number of points: ${savedState?.maxPoints || this.state.points}`);
                  }
                }

                const selectedIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-green'));
                if (selectedIndex !== -1) {
                  this.gamePlay.deselectCell(selectedIndex);
                }
                this.gamePlay.redrawPositions(this.state.allPositionedCharacters);
                this.state.userTurn = !endGame ? !this.state.userTurn : true;
                if (!this.state.userTurn) {
                  this.doComputerActions();
                }
              },
              (error) => GamePlay.showError(error),
            );
          } else {
            GamePlay.showError('Unacceptable action');
          }
        }
      } else if (typeof movementIsPossible !== 'undefined') {
        // перемещение
        const thisCharacterIndex = this.state.allPositionedCharacters.findIndex((character) => character.position === selectedCharacterIndex);
        this.state.allPositionedCharacters[thisCharacterIndex].position = index;
        this.gamePlay.redrawPositions(this.state.allPositionedCharacters);
        this.allowableMovementCells = [];
        this.allowableAttackCells = [];
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.state.userTurn = !this.state.userTurn;

        if (!this.state.userTurn && this.state.level <= 4) {
          this.doComputerActions();
        }
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

    // наведение при выбранном персонаже игрока (else - не выбранном)
    const selectedCharacterIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));

    if (selectedCharacterIndex !== -1) {
      if (characterFound) {
        const userCharacterFound = this.userCharacters.some((character) => characterFound.classList.contains(character));
        if (userCharacterFound) {
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
    } else if (characterFound) {
      const userCharacterFound = this.userCharacters.some((character) => characterFound.classList.contains(character));
      if (userCharacterFound) {
        this.gamePlay.setCursor(pointer);
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

    // при выбранном персонаже игрока (else - не выбранном)
    const selectedCharacterIndex = this.gamePlay.cells.findIndex((cell) => cell.classList.contains('selected-yellow'));

    if (selectedCharacterIndex !== -1) {
      if (characterFound) {
        const userCharacterFound = this.userCharacters.some((character) => characterFound.classList.contains(character));
        if (userCharacterFound) {
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
    } else if (characterFound) {
      const userCharacterFound = this.userCharacters.some((character) => characterFound.classList.contains(character));
      if (userCharacterFound) {
        this.gamePlay.setCursor(auto);
      }
    }
  }

  drawTeam(types, maxLevel, characterCount, remainderOfDivision) {
    const { boardSize } = this.gamePlay;
    const lastCell = boardSize ** 2 - 1;
    const team = generateTeam(types, maxLevel, characterCount);

    // повышение характеристик персонажей для уровня выше 1
    team.characters.forEach((character, index) => {
      if (character.level > 1) {
        for (let i = 2; i <= character.level; i += 1) {
          const { attack: attackBefore, defence: defenceBefore, health } = character;
          team.characters[index].attack = Math.max(attackBefore, (attackBefore * (80 + health)) / 100);
          team.characters[index].defence = Math.max(defenceBefore, (defenceBefore * (80 + health)) / 100);
          team.characters[index].health += 80;

          if (team.characters[index].attack % 1 !== 0) {
            team.characters[index].attack = Number(team.characters[index].attack.toFixed(2));
          }

          if (team.characters[index].defence % 1 !== 0) {
            team.characters[index].defence = Number(team.characters[index].defence.toFixed(2));
          }

          if (team.characters[index].health > 100) {
            team.characters[index].health = 100;
          }
        }
      }
    });

    const availableCells = [];
    for (let i = 0; i <= lastCell; i += 1) {
      if (i % boardSize === remainderOfDivision || i % boardSize === remainderOfDivision + 1) {
        const freeCell = !(this.state.allPositionedCharacters.find((character) => character.position === i));
        if (freeCell) {
          availableCells.push(i);
        }
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
  }

  getTooltipMessage(index) {
    const character = this.state.allPositionedCharacters.find((item) => item.position === index);
    const {
      level, attack, defence, health,
    } = character.character;
    return `\u{1F396}${level} \u2694${attack} \u{1F6E1}${defence} \u2764${health}`;
  }

  getRadiusesOfMovementAndAttack(index, selectedCharacterType) {
    // расчет радиуса перемещения
    const allowableMovementDistances = {
      bowman: 2,
      swordsman: 4,
      magician: 1,
      vampire: 2,
      undead: 4,
      daemon: 1,
    };

    const coordinates = this.getXYOfCell(index);
    const { boardSize } = this.gamePlay;
    const movementDistance = allowableMovementDistances[selectedCharacterType];
    this.allowableMovementCells = [];

    for (let i = 1; i <= movementDistance; i += 1) {
      const topLimit = coordinates.y - i < 0;
      const rightLimit = coordinates.x + i >= boardSize;
      const bottomLimit = coordinates.y + i >= boardSize;
      const leftLimit = coordinates.x - i < 0;

      if (!topLimit) {
        this.allowableMovementCells.push(index - boardSize * i);
      }

      if (!rightLimit) {
        this.allowableMovementCells.push(index + i);
      }

      if (!bottomLimit) {
        this.allowableMovementCells.push(index + boardSize * i);
      }

      if (!leftLimit) {
        this.allowableMovementCells.push(index - i);
      }

      if (!topLimit && !rightLimit) {
        this.allowableMovementCells.push(index - (boardSize - 1) * i);
      }

      if (!bottomLimit && !rightLimit) {
        this.allowableMovementCells.push(index + (boardSize + 1) * i);
      }

      if (!bottomLimit && !leftLimit) {
        this.allowableMovementCells.push(index + (boardSize - 1) * i);
      }

      if (!topLimit && !leftLimit) {
        this.allowableMovementCells.push(index - (boardSize + 1) * i);
      }
    }

    // учет занятых клеток для перемещения
    this.allowableMovementCells.forEach((cell, cellIndex) => {
      const occupiedCell = this.gamePlay.cells[cell]?.querySelector('.character');
      if (occupiedCell) {
        this.allowableMovementCells.splice(cellIndex, 1);
      }
    });

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

    // расчет допустимого поля радиуса атаки
    const distanceToTopEdge = coordinates.y;
    const distanceToRightEdge = boardSize - 1 - coordinates.x;
    const distanceToBottomEdge = boardSize - 1 - coordinates.y;
    const distanceToLeftEdge = coordinates.x;
    const distanceToTop = distanceToTopEdge < attackDistance ? distanceToTopEdge : attackDistance;
    const distanceToRight = distanceToRightEdge < attackDistance ? distanceToRightEdge : attackDistance;
    const distanceToBottom = distanceToBottomEdge < attackDistance ? distanceToBottomEdge : attackDistance;
    const distanceToLeft = distanceToLeftEdge < attackDistance ? distanceToLeftEdge : attackDistance;
    const startCell = index - boardSize * distanceToTop - distanceToLeft;

    for (let i = 1; i <= (distanceToTop + distanceToBottom) + 1; i += 1) {
      for (let j = 0; j <= distanceToLeft + distanceToRight; j += 1) {
        this.allowableAttackCells.push(startCell + (boardSize * i - boardSize) + j);
      }
    }

    // удаление клетки с персонажем из радиуса атаки
    const selectedCharacterIndexInArr = this.allowableAttackCells.indexOf(index);
    this.allowableAttackCells.splice(selectedCharacterIndexInArr, 1);
  }

  getXYOfCell(index) {
    const { boardSize } = this.gamePlay;
    const x = index % boardSize;
    const y = (index - x) / boardSize;
    return { x, y };
  }

  doComputerActions() {
    const { boardSize } = this.gamePlay;
    const computerTypes = [ 'vampire', 'undead', 'daemon' ];
    const userCharacters = this.state.allPositionedCharacters.filter((character) => this.userCharacters.find((type) => character.character.type === type));
    const computerCharacters = this.state.allPositionedCharacters.filter((character) => computerTypes.find((type) => character.character.type === type));

    // расчет целей для атаки компьютера
    const foundTargets = [];
    computerCharacters.forEach((character) => {
      this.onCellClick(character.position);
      this.getRadiusesOfMovementAndAttack(character.position, character.character.type);
      const targets = userCharacters.filter((userCharacter) => +this.allowableAttackCells.find((cell) => userCharacter.position === cell) >= 0);
      const result = [];

      if (targets.length > 0) {
        targets.forEach((target) => {
          result.push({
            attacker: character,
            target,
          });
        });
        foundTargets.push(...result);
      }
    });

    // атака компьютера
    if (foundTargets.length > 0) {
      let maxDamage = 0;
      let relevantIndex;
      foundTargets.forEach((opponentsItem, index) => {
        const { attack } = opponentsItem.attacker.character;
        const { defence } = opponentsItem.target.character;
        const damage = Math.max(attack - defence, attack * 0.1);
        if (damage > maxDamage) {
          maxDamage = damage;
          relevantIndex = index;
        }
      });
      this.onCellClick(foundTargets[relevantIndex].attacker.position);
      this.onCellClick(foundTargets[relevantIndex].target.position);
      this.gamePlay.deselectCell(foundTargets[relevantIndex].attacker.position);
      this.gamePlay.deselectCell(foundTargets[relevantIndex].target.position);
    } else {
      // перемещение компьютера
      const undeadFound = computerCharacters.find((character) => character.character.type === 'undead');
      const vampireFound = computerCharacters.find((character) => character.character.type === 'vampire');
      const daemonFound = computerCharacters.find((character) => character.character.type === 'daemon');
      let activeCharacter;

      // поиск подходящего персонажа компьютера для перемещения
      if (undeadFound) {
        activeCharacter = undeadFound;
      } else if (vampireFound) {
        activeCharacter = vampireFound;
      } else if (daemonFound) {
        activeCharacter = daemonFound;
      }

      this.onCellClick(activeCharacter.position);
      this.getRadiusesOfMovementAndAttack(activeCharacter.position, activeCharacter.character.type);
      const allowableComputerMovementDistances = {
        vampire: 2,
        undead: 4,
        daemon: 1,
      };

      // расчет клетки для перемещения
      const activeCharacterXY = this.getXYOfCell(activeCharacter.position);
      const userCharactersXY = userCharacters.map((character) => this.getXYOfCell(character.position));
      const relevantUserCharacterX = userCharactersXY.find((characterXY) => activeCharacterXY.x === characterXY.x);
      const relevantUserCharacterY = userCharactersXY.find((characterXY) => activeCharacterXY.y === characterXY.y);
      let xDirection;
      let yDirection;
      let relevantCell;
      const maxDistance = allowableComputerMovementDistances[activeCharacter.character.type];

      if (relevantUserCharacterX) {
        yDirection = activeCharacterXY.y - relevantUserCharacterX.y;
        if (yDirection > 0) {
          relevantCell = activeCharacter.position - (yDirection > maxDistance ? maxDistance * boardSize : (yDirection - 1) * boardSize);
        } else {
          relevantCell = activeCharacter.position + (Math.abs(yDirection) > maxDistance ? maxDistance * boardSize : (Math.abs(yDirection) - 1) * boardSize);
        }
      } else if (relevantUserCharacterY) {
        xDirection = activeCharacterXY.x - relevantUserCharacterY.x;
        if (xDirection > 0) {
          relevantCell = activeCharacter.position - (xDirection > maxDistance ? maxDistance : xDirection - 1);
        } else {
          relevantCell = activeCharacter.position + (Math.abs(xDirection) > maxDistance ? maxDistance : Math.abs(xDirection) - 1);
        }
      } else {
        const randomIndex = Math.floor(Math.random() * this.allowableMovementCells.length);
        relevantCell = this.allowableMovementCells[randomIndex];
      }

      const occupiedCell = this.gamePlay.cells[relevantCell].querySelector('.character');
      if (relevantCell === activeCharacter.position || occupiedCell) {
        const randomIndex = Math.floor(Math.random() * this.allowableMovementCells.length);
        relevantCell = this.allowableMovementCells[randomIndex];
      }

      this.onCellClick(relevantCell);
    }
  }
}
