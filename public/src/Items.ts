import * as PIXI from "../web_modules/pixi.js-legacy.js";
import {item, vector} from "../dist/Entities.js";
export function getType(type: number): item{
    switch (type) {
        case 0:{
            return new item(null);
            break;
        }
        case 1: {
            return new assualt();
            break;
        }
        case 2:{
            return new pistol();
            break;
        }
        case 3:{
            return new policeVest();
            break;
        }
        case 4:{
            return new mask();
            break;
        }
    }
    return null;
}
let Assualt = PIXI.Texture.from("../dist/Assualt.png");
let Pistol = PIXI.Texture.from("../dist/Pistol.png");
let PoliceVest = new PIXI.Texture.from("../dist/policeVest.png");
let Mask = new PIXI.Texture.from("../dist/mask.png");
class gun extends item{
    constructor(texture: PIXI.Texture, width: number, height: number, location?: vector) {
        super(texture);
        this.width = width;
        this.height = height;
        if(location != undefined){
            this.location = new vector(0,0, location);
        }
    }
    use(): number {
        return 1;
    }
    draw(image: PIXI.Graphics) {
    }

}
class assualt extends gun{
    constructor() {
        super(Assualt, 4, 2);
    }
    draw(image: PIXI.Graphics) {
        image.beginFill(0x000000);
        image.drawCircle(-0, -20, 8);
        image.drawCircle(5, -50, 8);
        image.endFill();
        image.beginFill(0x9b59b6);
        image.drawCircle(0, -20, 7);
        image.drawCircle(5, -50, 7);
        image.endFill();
        image.beginFill(0x000000);
        image.drawRect(-2, -20, 6, -60);
        image.endFill();
    }
}
class pistol extends gun{
    constructor() {
        super(Pistol, 2, 1);
    }
    draw(image: PIXI.Graphics) {
        image.beginFill(0x000000);
        image.drawCircle(-0, -20, 8);
        image.endFill();
        image.beginFill(0x9b59b6);
        image.drawCircle(-0, -20, 7);
        image.endFill();
        image.beginFill(0x000000);
        image.drawRect(-3, -21, 6, -20);
        image.endFill();
    }
}
class policeVest extends item{
    constructor() {
        super(PoliceVest);
        this.height = 2;
        this.width = 2;
    }
    draw(image: PIXI.Graphics) {
    }
}
class mask extends item{
    constructor() {
        super(Mask);
        this.height = 1;
        this.width = 1;
    }
    draw(image: PIXI.Graphics) {
    }
}