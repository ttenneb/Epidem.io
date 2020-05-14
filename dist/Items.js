"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entities_1 = require("./Entities");
class item {
    constructor(type, location, p) {
        this.type = type;
        if (p == undefined && location != null) {
            this.location = location;
            Entities_1.Manager.groundItems.push(this);
        }
        else if (p != undefined) {
            p.im.add(this, 0);
        }
        this.rotated = false;
        this.justrotated = false;
        this.on = false;
    }
    use(b, p) {
    }
}
exports.item = item;
class equipment extends item {
    constructor(type, location, width, height, p) {
        if (p != undefined) {
            super(type, location, p);
        }
        else
            super(type, location);
        this.width = width;
        this.height = height;
    }
}
exports.equipment = equipment;
class vest extends equipment {
    constructor(type, location, dR, p) {
        if (p != undefined) {
            super(type, location, 2, 2, p);
        }
        else
            super(type, location, 2, 2);
        this.damageReduction = dR;
        this.armor = 100;
    }
}
exports.vest = vest;
class consumable extends item {
    constructor(type, width, height, location, p) {
        if (p != undefined) {
            super(type, location, p);
        }
        else
            super(type, location);
        this.width = width;
        this.height = height;
    }
    use(b, p) {
        p.im.remove(this);
    }
}
exports.consumable = consumable;
class stackable extends item {
    constructor(type, width, height, amount, location, p) {
        if (p != undefined) {
            super(type, location, p);
        }
        else
            super(type, location);
        this.width = width;
        this.height = height;
        this.amount = amount;
    }
    use(b, p) {
    }
}
exports.stackable = stackable;
class itembullet extends stackable {
    constructor(amount, location, p) {
        if (p != undefined)
            super(11, 1, 1, amount, location, p);
        else
            super(11, 1, 1, amount, location);
    }
}
exports.itembullet = itembullet;
class gunSemi extends item {
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
class gunAuto extends item {
    constructor(type, location, width, height, firerate, damage, size, accuracy, p) {
        if (p != undefined)
            super(type, location, p);
        else
            super(type, location);
        this.width = width;
        this.height = height;
        this.fireRate = firerate;
        this.damage = damage;
        this.accuracy = accuracy;
        this.ammoSize = size;
        this.ammo = 0;
    }
    use(b, p) {
        //AUTO
        if (b == 1) {
            this.on = true;
        }
        else if (b == -1) {
            this.on = false;
        }
        if (this.on && this.ammo > 0 && p.countdown == 0) {
            if (this.onCount == this.fireRate) {
                this.onCount = 0;
                let rotaion = p.rotation;
                rotaion += Math.floor(Math.random() * this.accuracy * 2) - this.accuracy;
                new Entities_1.bullet(p.location.x, p.location.y, rotaion, p, this.damage);
                this.ammo--;
            }
            this.onCount++;
        }
        else {
            this.onCount = this.fireRate;
        }
    }
    reload(p) {
        let take = this.ammoSize - this.ammo;
        if (p.bullets[0] != undefined) {
            if (p.bullets[0].amount >= take) {
                p.bullets[0].amount -= take;
                this.ammo = this.ammoSize;
            }
            else {
                this.ammo += p.bullets[0].amount;
                p.bullets[0].amount = 0;
            }
            this.ammo = Math.trunc(this.ammo);
            p.countdown = 400;
            p.playerSpeed = .5;
        }
    }
}
exports.gunAuto = gunAuto;
class Assualt extends gunAuto {
    constructor(location, p) {
        if (p != undefined) {
            super(1, location, 4, 2, 5, 25, 30, 3, p);
        }
        else {
            super(1, location, 4, 2, 5, 25, 30, 3);
        }
    }
}
exports.Assualt = Assualt;
class supersub extends gunAuto {
    constructor(location, p) {
        if (p != undefined) {
            super(8, location, 3, 2, 2, 13, 30, 6, p);
        }
        else {
            super(8, location, 3, 2, 2, 13, 30, 6);
        }
    }
}
exports.supersub = supersub;
class machine extends gunAuto {
    constructor(location, p) {
        if (p != undefined) {
            super(10, location, 4, 2, 3, 25, 75, 4.5, p);
        }
        else {
            super(10, location, 4, 2, 3, 25, 75, 4.5);
        }
    }
}
exports.machine = machine;
class policeVest extends vest {
    constructor(location, p) {
        if (p != undefined) {
            super(3, location, .5, p);
        }
        else
            super(3, location, .5);
    }
}
exports.policeVest = policeVest;
class mask extends equipment {
    constructor(location, p) {
        if (p != undefined) {
            super(4, location, 1, 1, p);
        }
        else
            super(4, location, 1, 1);
    }
}
exports.mask = mask;
class grizzly extends consumable {
    constructor(location, p) {
        super(5, 2, 2, location, p);
        this.used = false;
    }
    use(b, p) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 500;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.health += 75;
            if (p.health > 100)
                p.health = 100;
            //remove item
            super.use(b, p);
        }
    }
}
exports.grizzly = grizzly;
class chips extends consumable {
    constructor(location, p) {
        super(6, 1, 1, location, p);
        this.used = false;
    }
    use(b, p) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 250;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.hunger += 30;
            if (p.hunger > 100)
                p.hunger = 100;
            //remove item
            super.use(b, p);
        }
    }
}
exports.chips = chips;
class water extends consumable {
    constructor(location, p) {
        super(7, 1, 2, location, p);
        this.used = false;
    }
    use(b, p) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 300;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.thirst += 75;
            if (p.thirst > 100)
                p.thirst = 100;
            //remove item
            super.use(b, p);
        }
    }
}
exports.water = water;
class bread extends consumable {
    constructor(location, p) {
        super(9, 1, 2, location, p);
        this.used = false;
    }
    use(b, p) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 500;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.hunger += 75;
            if (p.hunger > 100)
                p.hunger = 100;
            //remove item
            super.use(b, p);
        }
    }
}
exports.bread = bread;
//# sourceMappingURL=Items.js.map