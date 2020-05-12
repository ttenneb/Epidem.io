import {bullet, item, player, vector, equipment} from "./Entities";
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
    accuracy: number
    constructor(location: vector, p?: player) {
        if(p != undefined)
            super(1, location, p);
        else super(1, location);
        this.width = 4;
        this.height  =2;
        this.fireRate = 4;
        this.damage = 12;
        this.accuracy = 3;
    }
    use(b: number, p: player) {
        //AUTO
        if(b == 1){
            this.on = true
        }else if(b == -1){
            this.on = false;
        }
        if(this.on){
            if(this.onCount == this.fireRate) {
                this.onCount = 0;
                let rotaion = p.rotation;
                rotaion += Math.floor(Math.random() * this.accuracy*2) - this.accuracy;
                new bullet(p.location.x, p.location.y, rotaion, p, this.damage);
            }
            this.onCount++;
        }else{
            this.onCount = this.fireRate;
        }
    }
}
export class policeVest extends equipment{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(3, location, 2, 2, p);
        }else super(3, location,2,2);
    }
}
export class mask extends equipment{
    constructor(location: vector, p?: player) {
        if(p != undefined) {
            super(4, location, 1, 1, p);
        }else super(4, location,1,1);
    }
}