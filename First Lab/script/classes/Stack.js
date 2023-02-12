class Stack {
  #value = null;
  #prev = null;
  #tale = null;
  #length = 0;

  get length() {
    return this.#length;
  }

  push(value) {
    const newItem = new Stack();

    newItem.#value = value;
    newItem.#prev = this.#tale;
    this.#tale = newItem;
    this.#length++;
  }

  pop() {
    if (this.#tale === null) return null;

    const resValue = this.#tale.#value;
    this.#tale = this.#tale.#prev;
    this.#length--;

    return resValue;
  }

  get() {
    if (this.#tale === null) return null;
    return this.#tale.#value;
  }
}