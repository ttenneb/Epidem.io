import { item, player, vector, equipment } from "./Entities";
export declare class gunSemi extends item {
    damage: number;
    accuracy: number;
    constructor(location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class gunAuto extends item {
    fireRate: number;
    damage: number;
    accuracy: number;
    constructor(location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class policeVest extends equipment {
    constructor(location: vector, p?: player);
}
export declare class mask extends equipment {
    constructor(location: vector, p?: player);
}
