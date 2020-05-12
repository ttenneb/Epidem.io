"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entities_1 = require("./Entities");
class gunSemi extends Entities_1.item {
    constructor(location, p) {
        if (p != undefined)
            super(2, location, p);
        else
            super(2, location);
        this.width = 2;
        this.height = 1;
        this.damage = 10;
        this.accuracy = 1;
    }
    use(b, p) {
        //SEMI AUTO
        if (b == 1) {
            let rotaion = p.rotation;
            rotaion += Math.floor(Math.random() * this.accuracy * 2) - this.accuracy;
            new Entities_1.bullet(p.location.x, p.location.y, rotaion, p, this.damage);
        }
    }
}
exports.gunSemi = gunSemi;
class gunAuto extends Entities_1.item {
    constructor(location, p) {
        if (p != undefined)
            super(1, location, p);
        else
            super(1, location);
        this.width = 4;
        this.height = 2;
        this.fireRate = 4;
        this.damage = 12;
        this.accuracy = 3;
    }
    use(b, p) {
        //AUTO
        if (b == 1) {
            this.on = true;
        }
        else if (b == -1) {
            this.on = false;
        }
        if (this.on) {
            if (this.onCount == this.fireRate) {
                this.onCount = 0;
                let rotaion = p.rotation;
                rotaion += Math.floor(Math.random() * this.accuracy * 2) - this.accuracy;
                new Entities_1.bullet(p.location.x, p.location.y, rotaion, p, this.damage);
            }
            this.onCount++;
        }
        else {
            this.onCount = this.fireRate;
        }
    }
}
exports.gunAuto = gunAuto;
class policeVest extends Entities_1.equipment {
    constructor(location, p) {
        if (p != undefined) {
            super(3, location, 2, 2, p);
        }
        else
            super(3, location, 2, 2);
    }
}
exports.policeVest = policeVest;
class mask extends Entities_1.equipment {
    constructor(location, p) {
        if (p != undefined) {
            super(4, location, 1, 1, p);
        }
        else
            super(4, location, 1, 1);
    }
}
exports.mask = mask;
//# sourceMappingURL=Items.js.map