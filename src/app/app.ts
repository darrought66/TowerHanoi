import { Component, viewChildren, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Disk } from './disk/disk';
import { MoveService } from './move-service';

@Component({
  selector: 'app-root',
  imports: [Disk],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private cancel$ = new Subject<void>();

  // provides sequences of moves from the puzzles solution.
  private moveService = inject(MoveService);

  // the posts are numbered
  //    0: left
  //    1: middle
  //    2: right

  // the levels are 0 bottom to 4 top.

  // there is a specific sequence of moves that solve the puzzle. one disk changes
  // for each consecutive member of the sequence. thus a single integer can
  // represent the position of each disk at a given step in the sequence. 0 is the
  // initial state, with all disks on post 0.
  private currentState: number = 0;

  // the parent componet has 5 disks. obtain them.
  disks = viewChildren(Disk);

  /**
   * move a disk on screen. the top disk on the originating post is always moved.
   * since the top disk on the originating post is always the disk being moved, a
   * move can be represented with just two post numbers.
   * @param originating the originating post
   * @param destination the destination post
   */
  moveDisk(originating: number, destination: number) {
    // obtain disks on both posts
    let originatingDisks = this.disks().filter((disk) => disk.post() == originating);
    let destinationDisks = this.disks().filter((disk) => disk.post() == destination);

    // obtain max level on each post
    const originatingMax = Math.max(...originatingDisks.map((disk) => disk.level()));
    const destinationMax = Math.max(-1, ...destinationDisks.map((disk) => disk.level()));

    // obtain disk and update post and level
    let movingDisk = originatingDisks.filter((disk) => disk.level() == originatingMax)[0];
    movingDisk.post.set(destination);
    movingDisk.level.set(destinationMax + 1);
  }

  /*
   * the service provides a sequence of moves from the current state to the initial
   * state.
   */
  reverse() {
    this.cancel$.next();
    this.moveService
      .reverse(this.currentState)
      .pipe(takeUntil(this.cancel$))
      .subscribe((move) => {
        this.currentState = move[0];
        this.moveDisk(move[2], move[1]); // reverse the direction of the move.
      });
  }

  /*
   * the service provides the last move leading to the current state.
   */
  prior() {
    this.cancel$.next();
    let move = this.moveService.prior(this.currentState);
    this.currentState = move[0];
    this.moveDisk(move[2], move[1]); // reverse the direction of the move.
  }

  /*
   * the disks are put back to the original state.
   */
  reset() {
    this.cancel$.next();
    // sort the disks largest to smallest
    const sortedDisks = [...this.disks()].sort((a, b) => b.radius() - a.radius());
    // assign levels in reverse order
    sortedDisks.map((disk, index) => disk.level.set(index));
    // set alll posts to 0.
    this.disks().map((disk) => disk.post.set(0));
    this.currentState = 0;
  }

  /*
   * the service provides the next move in the sequence leading to the solution.
   */
  next() {
    this.cancel$.next();
    let move = this.moveService.next(this.currentState);
    this.currentState = move[0];
    this.moveDisk(move[1], move[2]);
  }

  /*
   * the service provides a sequence of moves from the current state to the
   * solution.
   */
  advance() {
    this.cancel$.next();
    this.moveService
      .advance(this.currentState)
      .pipe(takeUntil(this.cancel$))
      .subscribe((move) => {
        this.currentState = move[0];
        this.moveDisk(move[1], move[2]);
      });
  }
}
