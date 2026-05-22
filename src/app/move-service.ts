import { Injectable } from '@angular/core';
import { Observable, range, concatMap, timer, delay, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MoveService {

  // there is a specific sequence of moves that solve the puzzle. one disk changes
  // for each consecutive member of the sequence. thus a single integer can represent
  // the position of each disk at a given step in the sequence. 0 is the initial state,
  // with all disks on post 0.
  private puzzleState: number = 0;

  // the sequence of moves from intial state to solution.
  moves = new Map<number, number[]>();

  constructor() {
    this.puzzleState = 0;
    this.moveDisks(0, 2, 5);
    console.log('number of moves = ' + this.moves.size);
  }

  /**
   * solve the puzzle. moves specified number of disks from FROM post
   * to destination post.
   *
   * @param from the originating post
   * @param destination the destination post
   * @param count number of disks to move
   */
  moveDisks(originating: number, destination: number, count: number) {
    if (count == 1) {
      // recursive base case.
      this.puzzleState = this.puzzleState + 1;
      this.moves.set(this.puzzleState, [originating, destination]);

    } else {
      let other = this.computeOtherPost(originating, destination);
      this.moveDisks(originating, other, count - 1);
      this.moveDisks(originating, destination, 1);
      this.moveDisks(other, destination, count - 1);
    }
  }

  /**
   * given any two posts compute the third post.
   */
  computeOtherPost(originating: number, destination: number) {
    // the posts values (0, 1, 2) to powers to 2.
    // 2 ^ 0 + 2 ^ 1 + 2 ^ 2 = 1 + 2 + 4 = 7
    // subtract any two posts from 7 to get the third post.
    let p = 7 - Math.pow(2, originating) - Math.pow(2, destination);
    let other = Math.log2(p);
    return other;
  }

  /*
   * for a given position, returns the seqeunce of moves to get to the starting position.
   * moves are specified as new position, originating and destination post numbers.
   */
  reverse(currentState: number): Observable<number[]> {
    if (currentState <= 0) throw Error('already at beginning, cannot go back any further.');

    const priorMove = (p: number) => {
      const move: number[] = this.moves.get(p - 1) ?? [0, 0];
      return [p - 1, ...move];
    };

    let totalCount: number = currentState;

    return range(0, totalCount).pipe(
      // timer create an Observable stream
      // timer emits 0, replace that with key
      // pipe processes each member of the stream
      concatMap((key) =>
        timer(1000)
          .pipe(map(() => key))
          // convert 0 to totalCount to currentState to 1
          .pipe(map((key) => currentState - key)),
      ),
      map((key) => priorMove(key)),
    );
  }

  /*
   * for a given position, returns what move to make to get to the prior position.
   * move is specified as new position, originating and destination post numbers.
   */
  prior(currentState: number): number[] {
    if (currentState <= 0) throw Error('already at beginning, cannot go back any further.');

    let move: number[] = this.moves.get(currentState) ?? [0, 0];

    return [currentState - 1, move[0], move[1]];
  }

  /*
   * for a given position, returns what move to make to get to the next position.
   * move is specified as new position, originating and destination post numbers.
   */
  next(currentState: number): number[] {
    if (currentState >= this.moves.size)
      throw Error('already at ending, cannot go forward any further.');

    let move: number[] = this.moves.get(currentState + 1) ?? [0, 0];

    return [currentState + 1, move[0], move[1]];
  }

  /*
   * for a given position, returns the seqeunce of moves to get to the ending position.
   * moves are specified as new position, originating and destination post numbers.
   */
  advance(currentState: number): Observable<number[]> {
    if (currentState >= this.moves.size)
      throw Error('already at ending, cannot go forward any further.');

    const nextMove = (p: number) => {
      const move: number[] = this.moves.get(p + 1) ?? [0, 0];
      return [p + 1, ...move];
    };

    let totalCount: number = this.moves.size - currentState - 1;

    return range(currentState, totalCount).pipe(
      // timer create an Observable stream
      // timer emits 0, replace that with key
      // pipe processes each member of the stream
      concatMap((key) => timer(1000).pipe(map(() => key))),
      map((key) => nextMove(key)),
    );
  }
}
