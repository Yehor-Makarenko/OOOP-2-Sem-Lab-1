export default class Queue {  
  value = null; 
  next = null;
  head = null;
  tale = null;
  length = 0;

  get length() {
    return this.length;
  }  

  push(value) {
    const newItem = new Queue;
    newItem.value = value;
    this.length++;

    if (this.head === null) {
      this.head = newItem;
      this.tale = newItem;
      return;
    }

    this.tale.next = newItem;
    this.tale = newItem;
  }

  shift() {
    if (this.head === null) return null;
    
    const resValue = this.head.value;
    this.length--;
    this.head = this.head.next;
    return resValue;
  }

  get() {
    if (this.head === null) return null;
    return this.head.value;
  }

  static copy(queue) {
    const queueCopy = new Queue();
    let currItem = queue.head;
  
    while (currItem !== null) {
      queueCopy.push(currItem.value);
      currItem = currItem.next;
    }

    return queueCopy;
  }

  static concat(...queues) {
    const resultQueue = new Queue();
    let currItem;

    for (let queue of queues) {
      const queueCopy = Queue.copy(queue);
      currItem = queueCopy.head;

      while (currItem !== null) {
        resultQueue.push(currItem.value);
        currItem = currItem.next;
      }
    }

    return resultQueue;
  }
}