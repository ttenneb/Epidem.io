import {bullet, player, vector, Manager} from "./Entities";
export class item{
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
    constructor(type: number, location: vector, p?: player) {
        this.type = type;
        if(p == undefined && location != null){
            this.location = location;
            Manager.groundItems.push(this);
        }else if(p!= undefined){
            p.im.add(this, 0);
        }
        this.rotated = false;
        this.justrotated = false;
        this.on = false;
    }
    use(b: number, p: player){
    }
}
export class equipment extends item{
    constructor(type: number, location: vector, width: number, height: number, p?: player) {
        if(p != undefined){
            super(type, location, p);
        }else super(type, location);
        this.width =width;
        this.height = height;
    }
}
export class vest extends equipment{
    armor: number;
    damageReduction: number;
    constructor(type: number, location: vector, dR: number, p?: player) {
        if(p != undefined) {
            super(type, location, 2, 2, p);
        }else super(type, location,2,2);
        this.damageReduction = dR;
        this.armor = 100;
    }
}
export class consumable extends item{
    used: boolean;
    constructor(type: number, width: number, height: number, location: vector, p?: player) {
        if(p != undefined){
            super(type, location, p);
        }else super(type, location);
        this.width =width;
        this.height = height;
    }
    use(b: number, p: player) {
        p.im.remove(this);
    }
}
export class stackable extends item{
    amount: number;
    constructor(type: number, width: number, height: number, amount: number, location: vector, p?: player) {
        if(p != undefined){
            super(type, location, p);
        }else super(type, location);
        this.width =width;
        this.height = height;
        this.amount = amount;
    }
    use(b: number, p: player) {
    }
}
export class itembullet extends stackable{
    constructor(amount: number, location: vector, p?: player) {
        if(p != undefined)
            super(11, 1, 1, amount, location, p);
        else super(11, 1, 1, amount, location);
    }
}

export class gunSemi extends item{
    damage: number;
    accuracy: number;
    constructor(location: vector, p?: player) {
        if(p != undefined)
        super(2, location, p);
        else super(2, location);
        this.width = 2;
        this.height  =1;
        this.damage = 10;
        this.accuracy = 1;
    }
    use(b: number, p: player) {
        //SEMI AUTO
        if(b == 1) {
            let rotaion = p.rotation;
            rotaion += Math.floor(Math.random() * this.accuracy*2) - this.accuracy;
            new bullet(p.location.x, p.location.y, rotaion, p, this.damage);
        }
    }
}
export class gunAuto extends item{
    fireRate: number;
    damage: number;
    accuracy: number;
    ammoSize: number;
    ammo: number;
    constructor(type: number, location: vector, width: number, height: number, firerate: number, damage: number, size: number, accuracy: number, p?: player) {
        if(p != undefined)
            super(type, location, p);
        else super(type, location);
        this.width = width;
        this.height  =height;
        this.fireRate = firerate;
        this.damage = damage;
        this.accuracy = accuracy;
        this.ammoSize = size;
        this.ammo = 0;
    }
    use(b: number, p: player) {
        //AUTO
        if(b == 1){
            this.on = true
        }else if(b == -1){
            this.on = false;
        }
        if(this.on && this.ammo > 0 && p.countdown == 0){
            if(this.onCount == this.fireRate) {
                this.onCount = 0;
                let rotaion = p.rotation;
                rotaion += Math.floor(Math.random() * this.accuracy*2) - this.accuracy;
                new bullet(p.location.x, p.location.y, rotaion, p, this.damage);
                this.ammo--;
            }
            this.onCount++;
        }else{
            this.onCount = this.fireRate;
        }
    }
    reload(p: player){
        let take = this.ammoSize - this.ammo;
        if(p.bullets[0] != undefined) {
            if (p.bullets[0].amount >= take) {
                p.bullets[0].amount -= take;
                this.ammo = this.ammoSize;
            } else {
                this.ammo += p.bullets[0].amount;
                p.bullets[0].amount = 0;
            }
            this.ammo = Math.trunc(this.ammo);
            p.countdown = 400;
            p.playerSpeed = .5;
        }
    }
}

export class Assualt extends gunAuto{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(1, location, 4, 2, 5, 25, 30, 3, p);
        }else{
            super(1, location, 4, 2, 5, 25, 30, 3);
        }
    }
}
export class supersub extends gunAuto{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(8, location, 3, 2, 2, 13, 30, 6, p);
        }else{
            super(8, location, 3, 2, 2, 13, 30, 6);
        }
    }
}
export class machine extends gunAuto{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(10, location, 4, 2, 3, 25, 75, 4.5, p);
        }else{
            super(10, location, 4, 2, 3, 25, 75, 4.5);
        }
    }
}

export class policeVest extends vest{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(3, location, .5,  p);
        }else super(3, location, .5);
    }
}
export class mask extends equipment{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(4, location, 1, 1, p);
        }else super(4, location,1,1);
    }
}

export class grizzly extends consumable{
    constructor(location: vector, p?: player) {
        super(5, 2, 2, location, p);
        this.used = false;
    }
    use(b: number, p: player) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 500;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.health += 75;
            if (p.health > 100) p.health = 100;
            //remove item
            super.use(b, p);
        }

    }
}
export class chips extends consumable{
    constructor(location: vector, p?: player) {
        super(6, 1, 1, location, p);
        this.used = false;
    }
    use(b: number, p: player) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 250;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.hunger += 30;
            if (p.hunger > 100) p.hunger = 100;
            //remove item
            super.use(b, p);
        }

    }
}
export class water extends consumable{
    constructor(location: vector, p?: player) {
        super(7, 1, 2 , location, p);
        this.used = false;
    }
    use(b: number, p: player) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 300;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.thirst += 75;
            if (p.thirst > 100) p.thirst = 100;
            //remove item
            super.use(b, p);
        }

    }
}
export class bread extends consumable{
    constructor(location: vector, p?: player) {
        super(9, 1, 2, location, p);
        this.used = false;
    }
    use(b: number, p: player) {
        if (b == 1 && this.used == false) {
            //speed during cooldown, and cooldown tick time
            p.playerSpeed = .5;
            p.countdown = 500;
            this.used = true;
        }
        if (p.countdown == 0 && this.used == true) {
            //heal
            p.hunger += 75;
            if (p.hunger > 100) p.hunger = 100;
            //remove item
            super.use(b, p);
        }

    }
}