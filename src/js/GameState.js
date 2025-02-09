export default class GameState {
  static from(object) {
    // TODO: create object
    const { turn } = object;
    return turn[0]; // временно. переделать
  }
}
