
// @ts-ignore
import * as PIXI from "../web_modules/pixi.js-legacy.js";
import {screenWidth, screenHeight, rotation, stage, im, getItem} from "../dist/index.js";
import {moveItem, rotateItem} from "../dist/Networking.js";

//import {getType} from "../dist/Items.js";


export class vector{
    x: number;
    y: number;
    constructor(x: number, y: number , copy?: vector) {
        this.x = x;
        this.y = y;
        if(copy != undefined){
            this.x = copy.x;
            this.y = copy.y;
        }
    }
    add(a: vector){
        this.x += a.x;
        this.y += a.y;
    }
    sub(a: vector){
        this.x -= a.x;
        this.y -= a.y;
    }
    mult(a: number){
        this.x *= a;
        this.y *= a;
    }
    div(a: number){
        this.x /= a;
        this.y /= a;
    }
    norm(){
        let mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.div(mag);
    }
}
class entityManager{
    gameObjects: Array<gameObject>;
    bullets: Array<bullet>;
    staticObjects: Array<staticObject>;
    groundItems: Array<item>;
    constructor() {
        this.gameObjects = [];
        this.bullets = [];
        this.staticObjects = [];
        this.groundItems = [];
    }
    update(playerData: Array<number>){
            for(let p of this.gameObjects){
                p.clear();
                stage.removeChild(p.image);
            }
            this.gameObjects = [];

            let i = 1;
            //TODO streamline and optimize player data format
            Player = new player(playerData[i], playerData[i + 1], playerData[i + 2], getItem(playerData[i+3]), playerData[i+4], playerData[i+5]);
            this.gameObjects.push(Player);
            i += 6;
            let breakpoint = playerData[i];
            if(playerData.length > 0) {
                while (breakpoint != -1) {
                    let p = new character(playerData[i + 1], playerData[i + 2], playerData[i + 3], getItem(playerData[i+4]));
                    this.gameObjects.push(p);
                    i += 5;
                    breakpoint = playerData[i];
                }
                i++;
                while(i < playerData.length){
                    //console.log("guh" + playerData[i + 1]);
                    //console.log(playerData[i], playerData[i+1]);
                    new bullet(playerData[i], playerData[i+1], playerData[i+2]);
                    i += 4;
                }
            }
        }
    draw(){
        for(let i of this.groundItems){
            i.drawGround()
        }
        for(let o of this.gameObjects){
            o.draw()
        }
        let i = 0;
        //tODO dont like this it might be slow
        while(i < this.bullets.length){
            let b = this.bullets[i];
            b.draw();
            if(b.alpha < 0){
                b.clear();
                stage.removeChild(b.image);
                this.bullets.splice(i, 1);
            }else{
                i++;
            }

        }
        for(let o of this.staticObjects){
            o.draw();
        }
    }
}
export let Manager: entityManager = new entityManager();
export let Player: player;


export class gameObject{
    location: vector;
    image: PIXI.Graphics;
    drawn: boolean = true;
    anchored: boolean = false;
    rotation: number = 0;
    constructor(x: number, y: number, r: number) {
        this.location = new vector(x,y);
        this.image = new PIXI.Graphics();
        this.rotation = r;
        stage.addChild(this.image);
    }
    draw() {
        this.clear();
        this.image.zIndex = 50;
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        this.image.rotation = this.rotation * (Math.PI/180);
    }
    clear(){
        this.image.clear();
    }
}
export class hitBox{
    points: Array<vector>;
    length: number;
    width: number;
    constructor(width: number, length: number) {
        this.points = new Array<vector>();
            this.points.push(new vector(length, width));
            this.points.push(new vector(0, width));
            this.points.push(new vector(length, 0));
            this.points.push(new vector(0, 0));
            this.length = length;
            this.width = width;


    }
}
export class staticObject extends gameObject{
    hitbox: hitBox;
    length: number;
    width: number;
    constructor(x,y, l, w) {
        super(x,y,0);
        this.length = l;
        this.width = w;
        this.hitbox = new hitBox(w,l);
        Manager.staticObjects.push(this);
    }
    draw(){
        this.clear();
        this.image.beginFill(0x964b00);
        this.image.drawRect(this.location.x, this.location.y, this.length, this.width);
        this.image.endFill();
    }
}
export class character extends gameObject{
    inHand: item = new item(null);
    constructor(x: number, y: number, r: number, it: item) {
        super(x,y,r);
        this.inHand = it;

    }
    draw() {
        this.clear();
        this.image.beginFill(0x9b59b6);
        this.image.drawCircle(0, 0, 20);
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        if(this.inHand != null && this.inHand != undefined) this.inHand.draw(this.image);
        this.image.rotation = this.rotation * (Math.PI/180);
        this.image.endFill();
    }
    clear(){
        this.image.clear();
    }
}
export class player extends character{
    health: healthBar;
    hunger: healthBar;
    thirst: healthBar;
    armor: healthBar;
    shot: number;
    inventory: itemManager;
    constructor(x: number, y: number, health: number, it: item, hunger: number, thirst: number) {
        super(x,y, 0, it);
        //console.log(x + ", " + y);
        this.rotation = rotation;
        //console.log(this.rotation);
        this.health = new healthBar(health,0xff0000, 0);
        this.hunger = new healthBar(hunger, 0x008b00, 15);
        this.thirst = new healthBar(thirst, 0x0000ff, 30);
        this.armor = new healthBar(100, 0x808080, 45);
        this.shot = 0;
    }
    draw() {
        super.draw();
        this.health.draw();
        this.armor.draw();
        this.thirst.draw();
        this.hunger.draw();
        this.image.beginFill(0x9b59b6);
        this.image.endFill();
    }
    clear(){
        super.clear();
        this.health.clear();
    }
    useHand(){
        if(this.inHand == null){
        }else {
            this.inHand.use();
        }
    }
}
class healthBar extends gameObject{
    health: number;
    color: number;
    height: number;
    constructor(health: number, color: number, height: number) {
        super(0,0,0);
        this.health = health;
        this.color = color;
        this.height = height;
        Manager.gameObjects.push(this);
    }
    draw() {
        this.image.beginFill(this.color);
        this.image.drawRect(Player.location.x - (screenWidth/2), Player.location.y - screenHeight/2+this.height, this.health * 2, 15);
        this.image.endFill();
    }
}
export class bullet extends gameObject{
    length: number = 0;
    alpha: number = .7;
    drawCount: number = 0;
    hitbox: hitBox;
    velocity: vector;
    speed: number = 35;
    draw(){
        this.clear();
        this.location.add(this.velocity);
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        this.image.beginFill(0xffffff, this.alpha);
        this.alpha -= .02;
        this.image.drawRoundedRect(0, 0, 6, this.length, -3);
        this.length += this.speed;
        this.image.endFill();
        this.drawCount++;
    }
    constructor(x: number, y: number, r:number, id?: number) {
        super(x,y,r);
        let radians = (this.rotation - 90)*(Math.PI/180);
        this.image.rotation = r*(Math.PI/180);
        this.velocity = new vector(Math.cos(radians), Math.sin(radians));
        this.velocity.norm();
        this.velocity.mult(this.speed);
        let startoffset: vector = new vector(0, 0, this.velocity);
        startoffset.div(2);
        this.location.sub(startoffset);
        //console.log(this.location);
        //console.log("-----")
        Manager.bullets.push(this);
        this.hitbox = new hitBox(5,5);
    }
    isColliding(object: staticObject): boolean{
        let rect1: Array<vector> = new Array<vector>();
        for(let i = 0; i < this.hitbox.points.length; i++){
            rect1[i] = new vector(0,0, this.hitbox.points[i]);
            rect1[i].add(this.location);
        }
        let rect2: Array<vector> = new Array<vector>();
        for(let i = 0; i < object.hitbox.points.length; i++){
            rect2[i] = new vector(0,0,object.hitbox.points[i]);
            rect2[i].add(object.location);
        }
        if (rect1[3].x < rect2[2].x&&
            rect1[2].x  > rect2[3].x &&
            rect1[3].y < rect2[0].y &&
            rect1[0].y > rect2[3].y) {
            this.alpha = 0;
            return true;
        }
        return false;
    }
}
export class item{
    width: number;
    height: number;
    sprite: PIXI.Sprite;
    image: PIXI.Sprite;
    spot: vector;
    inMotion: vector;
    location: vector;
    rotated: boolean = false;
    container: number;
    use(): number{
        return 0;
    }
    draw(image: PIXI.Graphics){
        image.beginFill(0x000000);
        image.drawCircle(-15, -20, 8);
        image.drawCircle(+15, -20, 8);
        image.beginFill(0x9b59b6);
        image.drawCircle(-15, -20, 7);
        image.drawCircle(+15, -20, 7);

    }
    drawGround(){
        this.clearGround();
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        stage.addChild(this.image);
    }
    clearGround(){
        stage.removeChild(this.image);
    }
    constructor(texture: PIXI.Texture) {
        if(texture != null) {
            this.sprite = new PIXI.Sprite(texture);
            this.sprite.scale.set(1/3);
            this.sprite.zIndex = 101;
            this.image = new PIXI.Sprite(texture) ;
            this.image.scale.set(1/4);
        }
        this.inMotion = null;
    }
    toInventory(){
        //TODO request over network first
        stage.addChild(this.sprite);
        stage.removeChild(this.image);
    }
    toGround(){
        //TODO push to server
        stage.removeChild(this.sprite);
        stage.addChild(this.image);
        this.container = 1;
        //TODO remove this
        Manager.groundItems.push(this);
    }
    rotate(){
        let mem = this.width;
        this.width = this.height;
        this.height = mem;
        if(this.sprite.rotation == 0)this.sprite.rotation = Math.PI/2;
        else this.sprite.rotation = 0;
        rotateItem(this);
    }
}
export class itemManager{
  matrix: number[][] = [];
  items: item[];
  limit: number;
  //TODO change for ui ratio
  startx: number = 119/3;
  starty: number = -373/3;

  image: PIXI.Graphics;
  constructor(width: number, height: number, wlimit: number, startx: number, starty: number) {
        for(let i = 0; i < width; i++){
            this.matrix[i]=[];
            for(let j = 0; j < height; j++){
                this.matrix[i][j] = 0;
            }
        }

        this.startx = startx;
        this.starty = starty;

        this.items = [];

        this.image = new PIXI.Graphics();
        this.image.position.x = this.startx;
        this.image.position.y = this.starty;
        this.image.zIndex = 100;
        stage.addChild(this.image);
  }
  add(it: item){
      for(let i = 0; i < this.matrix.length; i++){
          for(let j = 0; j < this.matrix[i].length; j++){
             if(this.checkSpot(it, i, j)){
                 //console.log(i + ", " + j);
                 for(let h = i; h < i+ it.height; h++) {
                     for (let k = j; k < j+ it.width; k++) {
                        this.matrix[h][k] = 1;
                     }
                 }
                 //TODo change for ui ratio resize
                 this.items.push(it);
                 it.spot = new vector(j*(-115/3), i*(-115/3));
                 return;
             }
          }
      }
  }
  remove(it: item){
      if(it.spot != undefined) {
          let spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
          spot = new vector(Math.trunc(spot.x + .5), Math.trunc(spot.y + .5));
          if (it.rotated == true) {
              for (let h = spot.x; h < spot.x + it.width; h++) {
                  for (let k = spot.y; k < spot.y + it.height; k++) {
                      this.matrix[h][k] = 0;
                  }
              }
          } else {
              for (let h = spot.x; h < spot.x + it.height; h++) {
                  for (let k = spot.y; k < spot.y + it.width; k++) {
                      this.matrix[h][k] = 0;
                  }
              }
          }
          let element = this.items.indexOf(it);
          this.items.splice(element, 1);
      }
  }
  insert(it: item, point: vector): boolean{
      if(this.checkSpot(it, point.x, point.y)){
          for(let h = point.x; h < point.x + it.height; h++) {
              for (let k = point.y; k < point.y + it.width; k++) {
                  this.matrix[h][k] = 1;
              }
          }
          this.items.push(it);
          it.spot = new vector(point.y*-115/3,point.x*-115/3);
          return true;
      }else{
          return false;
      }
  }
  draw(){
      stage.removeChild(this.image);
      this.clear();
      //TODO might be causing some issues with memory leak
      for(let i of this.items){
          if(i.inMotion == null) {
              i.sprite.position.x =  Player.location.x - i.spot.x;
              i.sprite.position.y = Player.location.y - i.spot.y;
          }else{
              i.sprite.position.x = i.inMotion.x;
              i.sprite.position.y = i.inMotion.y;
          }
          if(i.sprite.rotation != 0) i.sprite.position.x += (115/3)*i.width;
          if(i != undefined && i.sprite != undefined && this.image != undefined)
            this.image.addChild(i.sprite);
      }
      stage.addChild(this.image);
  }
  clear(){
      for(let i = this.image.children.length-1; i >= 0; i--){
          this.image.removeChildAt(i);
      }
      for(let i of this.items){
          stage.removeChild(i.image);
          stage.removeChild(i.sprite);
      }
      stage.removeChild(this.image);
  }
  checkSpot(it: item, x: number, y: number): boolean{
      if(x >= 0 && x < this.matrix.length && y >= 0 && y < this.matrix[x].length &&this.matrix[x][y] == 0){
          for(let h = x; h < x + it.height; h++) {
              for (let k = y; k < y + it.width; k++) {

                  if(h >= this.matrix.length || k >= this.matrix[h].length || this.matrix[h][k] != 0){
                      return false;
                  }
              }
          }
          return true;
      }
      return false;
  }
  getPoint(location: vector): vector{
      let x = location.x-this.startx;
      let y = location.y-this.starty;
      //console.log(x + ", " + y);
      let point: vector = new vector(Math.trunc((y)/(115/3)),Math.trunc((x)/(115/3)));
      //TODO could have issues with none square inventories, x and y might be mixed up
      //TODO this must be changed bc it might have issues with non rectangular inventories
      if(point.x >= 0 && point.y >= 0 && point.x <= this.matrix.length && point.y <= this.matrix[0].length){
          return point
      }else{
          return new vector(-1,-1);
      }
  }
  getItem(point: vector): item{
      //console.log(point);
      for(let it of this.items){
          let spot = new vector((it.spot.y/(-115/3)), (it.spot.x/(-115/3)));
          //console.log(spot);

          if(point.x >= spot.x && point.x < spot.x + it.height
          && point.y >= spot.y && point.y < spot.y + it.width ){
              return it;
          }
      }
      return null;
  }
}
export class playerinventory{
    inv: itemManager;
    grd: itemManager;
    hnd: itemManager;
    cht: itemManager;
    bck: itemManager;
    hed: itemManager;
    fce: itemManager;
    containers: itemManager[] = [];
    selected: item;
    constructor(stage: any) {
        //TODO width and height are flip flopped
        this.inv = new itemManager(6,6,100, 119/3, -373/3);
        this.grd = new itemManager(12,6,100, 357, -373/3 - 102);
        this.hnd = new itemManager(4,2,100, -846/3, -229/3);
        this.cht = new itemManager(2,2,100, (-846 +260)/3, (-229+37)/3);
        this.bck = new itemManager(2,2,100, (-846 +524)/3, (-229+37)/3);
        this.hed = new itemManager(1,1,100, (-846 +315)/3, (-229-109)/3);
        this.fce = new itemManager(1,1,100, (-846 +466)/3, (-229-109)/3);
        this.containers.push(this.inv);
        this.containers.push(this.grd);
        this.containers.push(this.hnd);
        this.containers.push(this.cht);
        this.containers.push(this.bck);
        this.containers.push(this.hed);
        this.containers.push(this.fce);
    }
    draw(stage: any){
        this.inv.draw();
        this.hnd.draw();
        this.grd.draw();
        this.cht.draw();
        this.bck.draw();
        this.hed.draw();
        this.fce.draw();
    }
    clear(){
        this.inv.clear();
        this.hnd.clear();
        this.grd.clear();
        this.cht.clear();
        this.bck.clear();
        this.hed.clear();
        this.fce.clear();
    }
    add(it: item, num: number){
        if(this.containers[num] != undefined) {
            this.containers[num].add(it);
            it.container = num;
        }
    }
    remove(it: item, num: number){
        if(this.containers[num] != undefined) {
            this.containers[num].remove(it);
            it.container = -1;
        }
    }
    getContainer(location: vector): number{
        let count = 0;
        for(let c of this.containers){
            if(location.x > c.startx && location.x < c.startx + c.matrix[0].length*(115/3)
            && location.y > c.starty && location.y < c.starty + c.matrix.length*(115/3)){
                console.log(c.startx + c.matrix[0].length*(115/3) + ", " + count);
                return count;
            }
            count++;
        }
        return -1;
    }
    select(location: vector): item{
        let container = this.getContainer(location);
        if(container != -1){
            let point = this.containers[container].getPoint(location);
            if(point.x != -1 && point.y != -1) {
                let it = this.containers[container].getItem(point);
                if (it != null) {
                    this.selected = it;
                    //console.log(it);
                    return it;
                }
            }
        }
        return null;
    }
    drop(location: vector) {
        let container = this.getContainer(location);
        if(this.selected != null) {
            let point = this.containers[container].getPoint(location);
            if (point.x != -1 && point.y != -1) {
                moveItem(this.selected, point, container, this.selected.rotated);
            }
        }
            this.selected.rotated = false;
            this.selected.inMotion = null;
            this.selected = null;
    }
    clearData(){
        this.clear();
        this.inv = new itemManager(6,6,100, 119/3, -373/3);
        this.grd = new itemManager(12,6,100, 357, -373/3 - 102);
        this.hnd = new itemManager(4,2,100, -846/3, -229/3);
        this.cht = new itemManager(2,2,100, (-846 +260)/3, (-229+37)/3);
        this.bck = new itemManager(2,2,100, (-846 +524)/3, (-229+37)/3);
        this.hed = new itemManager(1,1,100, (-846 +315)/3, (-229-109)/3);
        this.fce = new itemManager(1,1,100, (-846 +466)/3, (-229-109)/3);
        this.containers = [];
        this.containers.push(this.inv);
        this.containers.push(this.grd);
        this.containers.push(this.hnd);
        this.containers.push(this.cht);
        this.containers.push(this.bck);
        this.containers.push(this.hed);
        this.containers.push(this.fce);
    }
}
