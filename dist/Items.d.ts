import { player, vector } from "./Entities";
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
export declare class vest extends equipment {
    armor: number;
    damageReduction: number;
    constructor(type: number, location: vector, dR: number, p?: player);
}
export declare class consumable extends item {
    used: boolean;
    constructor(type: number, width: number, height: number, location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class stackable extends item {
    amount: number;
    constructor(type: number, width: number, height: number, amount: number, location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class itembullet extends stackable {
    constructor(amount: number, location: vector, p?: player);
}
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
    ammoSize: number;
    ammo: number;
    constructor(type: number, location: vector, width: number, height: number, firerate: number, damage: number, size: number, accuracy: number, p?: player);
    use(b: number, p: player): void;
    reload(p: player): void;
}
export declare class Assualt extends gunAuto {
    constructor(location: vector, p?: player);
}
export declare class supersub extends gunAuto {
    constructor(location: vector, p?: player);
}
export declare class machine extends gunAuto {
    constructor(location: vector, p?: player);
}
export declare class policeVest extends vest {
    constructor(location: vector, p?: player);
}
export declare class mask extends equipment {
    constructor(location: vector, p?: player);
}
export declare class grizzly extends consumable {
    constructor(location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class chips extends consumable {
    constructor(location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class water extends consumable {
    constructor(location: vector, p?: player);
    use(b: number, p: player): void;
}
export declare class bread extends consumable {
    constructor(location: vector, p?: player);
    use(b: number, p: player): void;
}
