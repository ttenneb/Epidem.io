// @ts-ignore
import * as PIXI from "../web_modules/pixi.js-legacy.js";
import {stage} from "./index";
export class vector{
    x: number;
    y: number;
    constructor(x: number, y: number , copy?: vector) ;
    add(a: vector);
    sub(a: vector);
    mult(a: number);
    div(a: number);
    norm();
}
declare class entityManager {
    gameObjects: Array<gameObject>;
    bullets: Array<bullet>;
    staticObjects: Array<staticObject>;
    groundItems: Array<item>;
    constructor();
    update(playerData: Array<number>): void;
    draw(stage: any): void;
}

export declare let Manager: entityManager;
export declare let Player: player;
export declare class gameObject {
    location: vector;
    image: PIXI.Graphics;
    drawn: boolean;
    anchored: boolean;
    rotation: number;
    constructor(x: number, y: number, r: number);
    draw(): void;
    clear(): void;
}
export declare class staticObject extends gameObject {
    hitbox: hitBox;
    length: number;
    width: number;

    constructor(x: number, y: number, l: number, w: number);
}
export declare class hitBox{
    points: Array<vector>;
    length: number;
    width: number;
    constructor(width: number, length: number);
}
export declare class character extends gameObject {
    inHand: item;
    constructor(x: number, y: number, r: number);
    draw(): void;
    clear(): void;
}
export declare class player extends character {
    health: healthBar;
    shot: number;
    constructor(x: number, y: number, health: number, stage: any);
    draw(): void;
    clear(): void;
    useHand(): void;
    calculateRotation(): number;
}
declare class healthBar extends gameObject {
    health: number;
    constructor(health: number);
    draw(): void;
}
export declare class bullet extends gameObject {
    length: number;
    alpha: number;
    drawCount: number;
    draw(): void;
    constructor(x: number, y: number, r: number);
    isColliding(object: staticObject): boolean;
}
export declare class item {
    width: number;
    height: number;
    sprite: PIXI.Sprite;
    image: PIXI.Sprite;
    spot: vector;
    inMotion: vector;
    location: vector;
    rotated: boolean;
    container: number;
    use(): number;
    draw(image: PIXI.Graphics);
    drawGround();
    constructor(image: PIXI.Texture);
    clearGround();
    toInventory();
    toGround();
    rotate();
}
export declare class itemManager{
    matrix: number[][];
    items: Array<item>;
    limit: number;
    //TODO change for ui ratio
    startx: number;
    starty: number;

    image: PIXI.Graphics;
    constructor(width: number, height: number, wlimit: number, startx: number, starty: number);
    add(it: item);
    remove(it: item);
    insert(it: item, point: vector): boolean;
    draw();
    clear();
    checkSpot(it: item, x: number, y: number): boolean;
    getPoint(location: vector): vector;
    getItem(point: vector): item;
}
export declare class playerinventory{
    inv: itemManager;
    grd: itemManager;
    hnd: itemManager;
    cht: itemManager;
    bck: itemManager;
    hed: itemManager;
    fce: itemManager;
    containers: itemManager[];
    selected: item;
    constructor(stage: any);
    draw(stage: any);
    clear();
    getContainer(location: vector);
    select(location: vector): item
    drop(location: vector);
    add(it: item, num: number);
    remove(it: item, num: number);
    clearData();
}
export {};

