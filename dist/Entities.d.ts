import ndarray from "ndarray";
import PriorityQueue from "ts-priority-queue/src/PriorityQueue";
export declare class vector {
    x: number;
    y: number;
    constructor(x: number, y: number, copy?: vector);
    add(a: vector): void;
    sub(a: vector): void;
    mult(a: number): void;
    div(a: number): void;
    norm(): void;
    mag(): number;
    equals(a: vector): boolean;
}
export interface HashTable<T> {
    [key: string]: T;
}
export declare class gameObject {
    location: vector;
    rotation: number;
    hitbox: hitBox;
    constructor(x?: number, y?: number);
    isColliding(object: gameObject): boolean;
}
declare class hitBox {
    radius: number;
    points: Array<vector>;
    l: number;
    w: number;
    constructor(r: number, rect: boolean, width?: number, length?: number);
}
export declare class bullet extends gameObject {
    velocity: vector;
    distance: number;
    removable: boolean;
    id: number;
    speed: number;
    parent: gameObject;
    damage: number;
    constructor(x: number, y: number, r: number, p: gameObject, damage: number);
}
export declare class player extends gameObject {
    ID: string;
    Input: Array<boolean>;
    health: number;
    hunger: number;
    thirst: number;
    keyMem: Array<boolean>;
    im: InventoryManager;
    constructor(ID: string);
    getHealth(): number;
}
declare class entityManager {
    gameObjects: Array<gameObject>;
    players: Array<player>;
    playerByID: HashTable<player>;
    bullets: Array<bullet>;
    bulletstoSend: Array<bullet>;
    spatialMap: spatialHashMap;
    staticObjects: Array<staticObject>;
    groundItems: Array<item>;
    bots: Array<bot>;
    destinations: Array<destination>;
    matrix: ndarray<number>;
    mapSize: number;
    tileRadius: number;
    botupdate: number;
    botupdatecount: number;
    constructor();
    bakeGraph(): void;
    checkPoint(location: vector): boolean;
}
declare class spatialHashMap {
    buckets: Array<Array<gameObject>>;
    savedBuckets: Array<Array<staticObject>>;
    cellsize: number;
    constructor();
    clear(): void;
    insert(object: gameObject): void;
}
export declare class staticObject extends gameObject {
    constructor(x: number, y: number);
}
export declare class bot extends gameObject {
    health: number;
    money: number;
    hungery: boolean;
    thirsty: boolean;
    scared: boolean;
    injured: boolean;
    sick: boolean;
    currentState: state;
    path: vector[];
    current: vector;
    pathPriority: number;
    destination: vector;
    pastlocation: vector;
    removable: boolean;
    vis: vision;
    constructor(x: number, y: number);
    moveState(): void;
    action(): void;
    getPathPriority(): void;
}
export declare class vision extends gameObject {
    threat: gameObject;
    constructor(parent: bot);
}
declare class state {
    constructor();
    update(parent: bot): void;
    action(parent: bot): void;
}
export declare class pathFinder {
    count: number;
    queue: PriorityQueue<bot>;
    constructor();
    push(b: bot): void;
    pop(): void;
    findpath(location: vector, pathto: vector): vector[];
    finddestination(name: string): vector;
}
export declare class raycast {
    increment: number;
    coverCast(start: vector, direction: number, distance: number): void;
    aimCast(start: vector, end: vector): boolean;
    checkPoint(x: number, y: number): boolean;
}
export declare let raycaster: raycast;
export declare let pathfinder: pathFinder;
export declare class destination {
    location: vector;
    name: string;
    constructor(location: vector, name: string);
}
export declare class item {
    location: vector;
    spot: vector;
    type: number;
    width: number;
    height: number;
    container: number;
    rotated: boolean;
    justrotated: boolean;
    on: boolean;
    onCount: number;
    constructor(type: number, location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class equipment extends item {
    constructor(type: number, location: vector, width: number, height: number, p?: player);
}
export declare class wall extends staticObject {
    color: number;
    constructor(x: number, y: number, l: number, w: number);
}
export declare let Manager: entityManager;
export declare function buildPlayerPayload(id: string): Array<number>;
export declare class InventoryManager {
    inventory: item[];
    inventoryMatrix: number[][];
    hands: item[];
    handsMatrix: number[][];
    ground: item[];
    groundMatrix: number[][];
    chest: item[];
    chestdMatrix: number[][];
    back: item[];
    backMatrix: number[][];
    head: item[];
    headMatrix: number[][];
    face: item[];
    faceMatrix: number[][];
    height: number;
    width: number;
    space: number;
    selected: item;
    pickUp: number;
    constructor(height: number, width: number);
    add(it: item, container: number): boolean;
    rotate(it: item): void;
    get(x: number, y: number, container: number): item;
    remove(it: item): boolean;
    move(it: item, container: number, x: number, y: number, p: player): void;
    put(it: item, container: number, x: number, y: number): void;
    checkSpot(it: item, container: number, x: number, y: number): boolean;
    print(): void;
    getGround(p: player): void;
}
export {};
