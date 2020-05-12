export declare class hashtable<T> {
    data: Array<linkedlist<T>>;
    size: number;
    constructor(size: number);
    insert(key: number, value: T): void;
}
export declare class linkedlist<T> {
    root: linkedlistNode<T>;
    pointer: linkedlistNode<T>;
    found: linkedlistNode<T>;
    constructor();
    insert(data: T): void;
    find(data: T): number;
    remove(index?: number): void;
}
declare class linkedlistNode<T> {
    next: linkedlistNode<T>;
    data: T;
    constructor(data: T);
}
export {};
