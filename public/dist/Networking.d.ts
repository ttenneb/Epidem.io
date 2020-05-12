import {item, vector} from "./Entities.js";

export declare let playerData: Array<number>;
export declare function Connect(): void;
export declare function update(): void;
export declare function getItems(): void;
export declare function moveItem(it: item, spot: vector, container: number, r: boolean): void;
export function rotateItem(it: item);