import { Component, viewChildren } from '@angular/core';
import { Disk } from './disk/disk';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Component({
  selector: 'app-root',
  imports: [Disk],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // the parent componet has 5 disks. obtain them.
  disks = viewChildren(Disk);

  // runs after stuff have been initialized.
  ngAfterViewInit(): void {
    this.moveDisks(0, 2, 5);
  }

  /**
   * solve the puzzle. moves specified number of disks from FROM post
   * to TO post.
   *
   * @param from the originating post
   * @param to the destination post
   * @param count number of disks to move
   */
  async moveDisks(from: number, to: number, count: number) {
    if (count == 1) {
      // recursive base case.
      this.moveDisk(from, to);
      await delay(1000);
    } else {
      let other = this.computeOtherPost(from, to);
      await this.moveDisks(from, other, count - 1);
      await this.moveDisks(from, to, 1);
      await this.moveDisks(other, to, count - 1);
    }
  }

  /**
   * given any two posts compute the third post.
   */
  computeOtherPost(from: number, to: number) {
    // the posts values (0, 1, 2) to powers to 2.
    // 2 ^ 0 + 2 ^ 1 + 2 ^ 2 = 1 + 2 + 4 = 7
    // subtract any two posts from 7 to get the third post.
    let p = 7 - Math.pow(2, from) - Math.pow(2, to);
    let other = Math.log2(p);
    return other;
  }

  /**
   * move a disk on screen. the top disk on the originating post is always moved.
   *
   * @param from the originating post
   * @param to he destination post
   */
  moveDisk(from: number, to: number) {
    //console.log('disks array has ' + this.disks().length + ' disks');

    // obtain disks on both posts
    let fromDisks = this.disks().filter((disk) => disk.post() == from);
    let toDisks = this.disks().filter((disk) => disk.post() == to);
    //console.log(fromDisks.length + ' disks on from post');
    //console.log(toDisks.length + ' disks on to post');

    // obtain max level on each post
    const fromMax = Math.max(...fromDisks.map((disk) => disk.level()));
    const toMax = Math.max(-1, ...toDisks.map((disk) => disk.level()));
    //console.log('moving from level ' + fromMax + ' to level ' + (toMax + 1));

    // obtain disk and update post and level

    let movingDisk = fromDisks.filter((disk) => disk.level() == fromMax)[0];
    /*
    console.log(
      'the disk with radius of ' +
        movingDisk.radius +
        ' is going to post ' +
        to +
        ' level ' +
        (toMax + 1),
    );
    */
    movingDisk.post.set(to);
    movingDisk.level.set(toMax + 1);
  }
}
