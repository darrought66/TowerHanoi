import { Component, numberAttribute, input, model } from '@angular/core';

@Component({
  selector: 'g[app-disk]',
  imports: [],
  templateUrl: './disk.html',
  styleUrl: './disk.css',
})
export class Disk {
  // the entire display can be moved about with these three constants.

  // vertical for the lowest center
  readonly MIN_VERT = 110;

  // height for a disk, must be even number
  readonly DISK_HIGH = 20;

  // center horizonals for disk columns. should be at least twice largest radius.
  readonly POST_HORZ = [80, 240, 400];

  // the width of the disk, center to edge
  readonly radius = input.required<number, unknown>({ transform: numberAttribute });

  color = input.required();

  // vertical position in column, 0 to 4, going up.
  level = model<number>(0);

  // column number, 0 to 2, going right.
  post = model<number>(0);

  // the left border of the disk
  get x(): number {
    return this.POST_HORZ[this.post()] - this.radius();
  }

  // the upper border of the disk
  get y(): number {
    return this.MIN_VERT - (0.5 + this.level()) * this.DISK_HIGH;
  }
}
