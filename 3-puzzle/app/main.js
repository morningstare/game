const $app = document.querySelector("#app");
const $board = document.querySelector("#board");
const $puzzles = document.querySelector("#puzzles");
const $initialScreen = document.querySelector("#initial-screen");
const $fileInput = $initialScreen.querySelector("input[type=file]");
const $image = document.querySelector("#sample-image");
const $slots = Array.from(document.querySelectorAll(".slot"));
const puzzleLength = 4;
let imageURL = null;
let draggingPuzzle = null;
let puzzles = [];

function append(parent, child) {
  parent.append(child);
  const puzzle = puzzles.find((p) => p.dom.el === child);
  if (puzzle) {
    puzzle.dom.parent = parent;
  }
}

function handleImageUpload(e) {
  e.preventDefault();
  if (imageURL) {
    URL.revokeObjectURL(imageURL);
  }
  if (e.target.files.length === 0) {
    alert("please, choose an image");
    return;
  }
  const file = e.target.files[0];
  imageURL = URL.createObjectURL(file);
  e.target.value = "";
  $image.onload = () => {
    createPuzzles();
  };
  $image.src = imageURL;
}

function main() {
  $fileInput.addEventListener("change", handleImageUpload);

  if ($image) {
    imageURL = $image.src;
    createPuzzles();
  }

  $slots.forEach((slot) => {
    slot.addEventListener("mouseup", () => {
      if (draggingPuzzle) {
        append(draggingPuzzle.parentNode, slot.firstChild);
        append(slot, draggingPuzzle);
        draggingPuzzle = null;
        console.log(puzzles.find((item) => !item.correct));
      }
    });
  });
}

const WIDTH = 400;
function createPuzzles() {
  $app.style.display = "block";

  puzzles.forEach((p) => {
    p.el.remove();
  });

  puzzles = [];
  let height = $image.height;
  let width = $image.width;

  if (width < WIDTH) {
    width = WIDTH;
    height = WIDTH * (width / height);
  }
  if (height < WIDTH) {
    width = WIDTH * (height / width);
    height = WIDTH;
  }

  let id = 0;
  for (let y = 0; y < puzzleLength; y++) {
    for (let x = 0; x < puzzleLength; x++) {
      id++;
      puzzles.push(new PuzzleCard({ x, y, height, width, id }));
    }
  }
}

const rotates = [0, 90, 180, 270];

class PuzzleCard {
  dom = {
    originalParent: null,
    parent: null,
    el: null,
    bg: null,
  };

  constructor({ x, y, height, width, id }) {
    this.id = id;

    this.rotate = 0 * Math.floor(rotates.length * Math.random());
    this.dom.originalParent = $slots[id - 1];

    const $freeSlots = $slots.filter(
      (slot) => !puzzles.some((p) => p.dom.parent === slot)
    );

    this.dom.parent = $freeSlots[Math.floor($freeSlots.length * Math.random())];

    this.dom.el = document.createElement("div");
    this.dom.el.className = "puzzle dis";

    const bgX = (x / puzzleLength) * -width;
    const bgY = (y / puzzleLength) * -height;

    this.dom.bg = document.createElement("span");

    this.dom.bg.style.backgroundSize = `${width}px ${height}px`;
    this.dom.bg.style.backgroundPosition = `${bgX}px ${bgY}px`;
    this.dom.bg.style.backgroundImage = `url(${imageURL})`;

    this.dom.el.append(this.dom.bg);
    this.dom.originalParent.append(this.dom.el);

    setTimeout(() => {
      this.dom.el.classList.remove("dis");
      this.load();
    }, 500);
  }

  load() {
    this.dom.bg.style.rotate = rotates[this.rotate] + "deg";
    this.dom.parent.append(this.dom.el);

    const dragStart = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      const x = e.pageX - dragStart.x;
      const y = e.pageY - dragStart.y;
      this.dom.el.style.translate = `${x}px ${y}px`;
      this.dom.el.classList.add("drag");
    };

    const onMouseUp = () => {
      this.dom.el.classList.remove("drag");
      this.dom.el.style.translate = null;
      removeEventListener("mousemove", onMouseMove);
    };

    this.dom.el.addEventListener("click", (e) => {
      if (e.ctrlKey) {
        this.rotate -= 1;
      } else {
        this.rotate += 1;
      }
      if (this.rotate < 0) {
        this.rotate = rotates.length - 1;
      }
      this.rotate %= rotates.length;
      this.dom.bg.style.rotate = rotates[this.rotate] + "deg";
    });

    this.dom.el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      draggingPuzzle = this.dom.el;
      dragStart.x = e.pageX;
      dragStart.y = e.pageY;

      addEventListener("mouseup", onMouseUp, { once: true });
      addEventListener("mousemove", onMouseMove);
    });
  }
  get correct() {
    return this.rotate === 0 && this.dom.parent === this.dom.originalParent;
  }
}

main();
