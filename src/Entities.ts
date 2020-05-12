import * as PF from "pathfinding"
import ndarray from "ndarray";
import PriorityQueue from "ts-priority-queue/src/PriorityQueue";
// @ts-ignore
import createPlanner from 'l1-path-finder';


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
    mag(): number{
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    equals(a: vector): boolean{
        return this.x == a.x && this.y == a.y
    }
}
export interface HashTable<T> {
    [key: string]: T;
}

export class gameObject{
    location: vector;
    rotation: number;
    hitbox: hitBox;
    constructor(x?: number, y?: number) {
        this.location = new vector(x || 0, y || 0);
        Manager.gameObjects.push(this);
    }
    isColliding(object: gameObject): boolean{
        if(this.hitbox.radius != 0 && object.hitbox.radius != 0) {
            let dx = this.location.x - object.location.x;
            let dy = this.location.y - object.location.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.hitbox.radius + object.hitbox.radius) {
                return true;
            }
            return false;
        }else if(object instanceof  staticObject){
            let rect1: Array<vector> = new Array<vector>();
            for(let i = 0; i < this.hitbox.points.length; i++){
                rect1[i] = new vector(0,0,this.hitbox.points[i]);
                rect1[i].add(this.location);
            }
            let rect2: Array<vector> = new Array<vector>();
            for(let i = 0; i < object.hitbox.points.length; i++){
                rect2[i] = new vector(0,0,object.hitbox.points[i]);
                rect2[i].add(object.location);
            }

            if (rect1[3].x <= rect2[2].x&&
                rect1[2].x  >= rect2[3].x &&
                rect1[3].y <= rect2[0].y &&
                rect1[0].y >= rect2[3].y) {
                    if(this instanceof bullet){
                        this.removable =true;
                    }
                    if(this instanceof player){
                        if(rect1[3].y == rect2[0].y){
                            this.location.y+=1;
                        }
                        if(rect1[0].y == rect2[3].y){
                            this.location.y-=1;
                        }
                        if(rect1[0].x == rect2[3].x){
                            this.location.x-=1;
                        }
                        if(rect1[3].x == rect2[0].x){
                            this.location.x+=1;
                        }
                    }
                    return true;
            }
        }
        return false;
    }
}
class hitBox{
    radius: number;
    points: Array<vector>;
    l: number;
    w: number;
    constructor(r: number, rect: boolean, width?: number, length?: number) {
        this.points = new Array<vector>();
        if(rect == false) {
            this.radius = r;
            this.points.push(new vector(this.radius, this.radius));
            this.points.push(new vector(-this.radius, this.radius));
            this.points.push(new vector(this.radius, -this.radius));
            this.points.push(new vector(-this.radius, -this.radius));
        }else if(width != undefined && length != undefined){
            this.radius = 0;
            this.points.push(new vector(length, width));
            this.points.push(new vector(0, width));
            this.points.push(new vector(length, 0));
            this.points.push(new vector(0, 0));
            this.l = length;
            this.w = width;
        }


    }
}
export class bullet extends gameObject{
    velocity: vector;
    distance: number;
    removable: boolean = false;
    id: number;
    speed: number = 7;
    parent: gameObject;
    damage: number;
    constructor(x: number, y: number, r: number, p: gameObject, damage: number) {
        super(x,y);
        let radians = (r - 90)*(Math.PI/180)
        this.velocity = new vector(Math.cos(radians), Math.sin(radians));
        this.velocity.norm();
        this.velocity.mult(this.speed);
        let startBuffer = new vector(0, 0);
        startBuffer.add(this.velocity);
        startBuffer.mult(4);
        this.damage = damage;

        this.parent = p;
        //stops bullet from spawning on player and causing damage
        this.location.add(startBuffer);

        this.rotation = r;
        Manager.bulletstoSend.push(this);

        this.distance = 0;
        this.hitbox = new hitBox(1, false);
    }
}
export class player extends gameObject{
    ID: string;
    Input: Array<boolean>;
    health: number;
    hunger: number;
    thirst: number;
    keyMem: Array<boolean>;
    im: InventoryManager;
    constructor(ID: string) {
        super();
        this.Input = [];
        this.ID = ID;
        this.im = new InventoryManager(6,6);
        this.health = 100;
        this.hunger = 100;
        this.thirst = 100;
        Manager.players.push(this);
        this.hitbox = new hitBox(20, false);
        this.keyMem = new Array<boolean>(4);
    }

    getHealth(): number{
        return this.health;
    }
}

class entityManager{
    gameObjects: Array<gameObject>;
    players: Array<player>;
    playerByID: HashTable<player>;
    bullets: Array<bullet>;
    bulletstoSend: Array<bullet>;
    spatialMap: spatialHashMap;
    staticObjects: Array<staticObject>;
    groundItems: Array<item>;
    bots: Array<bot>;
    //TODO split into different lists for each type if time consuming
    destinations: Array<destination>;
    matrix: ndarray<number>;

    mapSize: number = 2000;
    tileRadius: number = 40;

    botupdate = 3;
    botupdatecount = this.botupdate;
    constructor() {
        this.playerByID = {};
        this.gameObjects = [];
        this.players = [];
        this.bullets = [];
        this.bulletstoSend = [];
        this.spatialMap = new spatialHashMap()
        this.staticObjects = [];
        this.bots = [];
        this.destinations = [];
        this.groundItems = [];
    }

    bakeGraph(){
        this.matrix = ndarray([], [this.mapSize/this.tileRadius, this.mapSize/this.tileRadius]);
        for(let i = 0; i < this.mapSize/this.tileRadius; i+=1){
            for(let j = 0; j < this.mapSize/this.tileRadius; j+=1) {
                if (this.checkPoint(new vector(j * this.tileRadius, i * this.tileRadius))) {
                    this.matrix.set(i, j, 0);
                }else{
                    this.matrix.set(i, j, 1);
                }
            }
        }
        for(let i = 0; i < Manager.matrix.shape[0]; i++){
            for(let j = 0; j < Manager.matrix.shape[1]; j++){
                process.stdout.write(""+ Manager.matrix.get(i,j));
            }
            console.log()
        }
    }
    checkPoint(location: vector){
        //TODO idk might be problem here with only checkig point not hitbox of a bot
        location.sub(new vector(this.mapSize/2,this.mapSize/2));
        let rect1: Array<vector> = [
            //these are all off

             new vector(location.x+this.tileRadius/2, location.y+this.tileRadius/2),
            new vector(location.x-this.tileRadius/2, location.y+this.tileRadius/2),
            new vector(location.x+this.tileRadius/2, location.y-this.tileRadius/2),
            new vector(location.x-this.tileRadius/2, location.y-this.tileRadius/2),];

        for(let s of Manager.staticObjects) {
            let rect2: Array<vector> = new Array<vector>();
            for (let i = 0; i < s.hitbox.points.length; i++) {
                rect2[i] = new vector(0, 0, s.hitbox.points[i]);
                rect2[i].add(s.location);
            }
            if (rect1[3].x <= rect2[2].x&&
                rect1[2].x  >= rect2[3].x &&
                rect1[3].y <= rect2[0].y &&
                rect1[0].y >= rect2[3].y) {
                return false;
            }
        }
        return true;
    }
}
class spatialHashMap{
    buckets: Array<Array<gameObject>>;
    savedBuckets: Array<Array<staticObject>>;
    cellsize: number = 500;
    constructor() {
        this.clear();
        this.savedBuckets = new Array<Array<gameObject>>(100);
        for(let i = 0; i < 100; i ++){
            this.savedBuckets[i] = new Array<gameObject>();
        }
    }
    clear(){
        this.buckets = new Array<Array<gameObject>>(100);
        for(let i = 0; i < 100; i ++){
            this.buckets[i] = new Array<gameObject>();
        }
    }
    //TODO if an object is bigger then a hashmap sector it can extend through out the whole sector and not be included in it becuase it's points are only on edges
    insert(object: gameObject){
        let indexes: Array<number> = [];
        for(let p of object.hitbox.points){
            let location = new vector(0,0);
            location.add(p);
            location.add(object.location);
            let index = (Math.trunc((location.x+Manager.mapSize/2) / this.cellsize)) + (Math.trunc((location.y+Manager.mapSize/2) / this.cellsize) * 10);
            if(indexes.find(element => element == index) == undefined){
                if(index >= 0 && index < 100) {
                    if(object instanceof staticObject){
                        this.savedBuckets[index].push(object)
                    }else  this.buckets[index].push(object);
                    indexes.push(index);
                }else {
                    //console.log(index + ", " + object.location);
                }
            }

        }

    }

}

export class staticObject extends gameObject{
    constructor(x: number, y: number) {
        super(x,y);
        Manager.staticObjects.push(this);
    }
}

export class bot extends gameObject{
    health: number;
    money: number;
    hungery: boolean;
    thirsty: boolean
    scared: boolean;
    injured: boolean;
    sick: boolean;
    currentState: state;
    path: vector[];
    current: vector;
    pathPriority: number;
    destination: vector;
    pastlocation: vector;
    removable: boolean = false;
    vis: vision;
    constructor(x: number,y: number) {
        super(x,y);
        this.vis = new vision(this);
        this.hitbox = new hitBox(20, false);
        this.health = 100;
        Manager.bots.push(this);
        this.currentState = Start;
    }
    moveState(){
        this.currentState.update(this);
    }
    action(){
        if(this.path != undefined){
            //make bot go to actual destination not final path instructions
            if(!this.pastlocation.equals(this.location)){
                this.path = [];
                this.current = new vector(0,0, this.location);
                pathfinder.push(this);
            }
            for(let i = 0; i < Manager.botupdate; i++) {
                if (this.current != undefined && !this.current.equals(this.location)) {
                    if (this.current.x > this.location.x) {
                        this.location.x++;
                        this.rotation = 90;
                    } else if (this.current.x < this.location.x) {
                        this.location.x--;
                        this.rotation = 270;
                    }
                    if (this.current.y > this.location.y) {
                        this.location.y++;
                        this.rotation = 180;
                    } else if (this.current.y < this.location.y) {
                        this.location.y--;
                        this.rotation = 0;
                    }
                } else {
                    //gets netxt instruction in the path
                    let next = this.path.pop();
                    if (next != undefined) {
                        this.current = next;
                        //if the path is done and the bot hasnt reached destination it recalculates
                    } else if (this.path.length > 0 && !this.location.equals(this.destination)) {
                        pathfinder.push(this);
                    }
                }
            }
        }
        this.pastlocation = this.location;
        this.vis.location = this.location;

        this.currentState.action(this);
    }
    getPathPriority(): void{
        this.pathPriority = 1;
    }
}
export class vision extends gameObject{
    threat: gameObject;
       constructor(parent: bot) {
           super();
           this.hitbox = new hitBox(250, false);
           this.location = parent.location;
       }
}
class state{
    constructor() {
    }
    update(parent: bot){
    }
    action(parent: bot){

    }
}
class start extends state{
    constructor() {
        super();
    }
    update(parent:bot ){
        if(parent.vis.threat != undefined && parent.vis.threat != null){
            parent.currentState = new attack(parent.vis.threat);
        }
        else if(parent.injured){
            parent.destination = pathfinder.finddestination("hospital");
            //TODO fix this taveling state thing seems redudent
            parent.currentState = new traveling();
            pathfinder.push(parent);
        }
        else if(parent.hungery){
            parent.destination=pathfinder.finddestination("store");
            parent.currentState = new traveling();
            pathfinder.push(parent);
        }
        else if(parent.money < moneyThreshold){
            parent.destination = pathfinder.finddestination("bank");
            parent.currentState = new traveling();
            pathfinder.push(parent);
        }else if(!(parent.currentState instanceof wandering) && !(parent.currentState instanceof traveling)){
            parent.currentState = new wandering(parent);
        }
    }
}
class traveling extends state{
    constructor() {
        super();
    }
    update(parent: bot) {
        if(parent.vis.threat != undefined && parent.vis.threat != null){
            parent.currentState = new attack(parent.vis.threat);
        }
    }
    action(parent: bot) {
    }
}

export class pathFinder{
    count: number = 0;
    queue: PriorityQueue<bot>;
    //Creates a path for the bot to travel along, needs optimization (takes ~ 1 sec for every 10 paths genereated), also can get stuck easily!!
    constructor() {
        //TODO check to make sure this is a min PQ not max
        this.queue = new PriorityQueue<bot>({ comparator: function(a, b) { return b.pathPriority - a.pathPriority; }})
    }
    push(b: bot){
        //TODO add calculation for pathPriority
        b.getPathPriority();
        this.queue.queue(b);
    }
    pop(){
        if(this.queue.length > 0) {
            let bnext = this.queue.dequeue();
            bnext.path = this.findpath(bnext.location, bnext.destination);
        }

    }
    findpath(location: vector, pathto: vector): vector[]{
        let path: vector[] = [];
        let currentLocation = new vector(0,0, location);
        let destination = new vector(0,0, pathto)
        let offset = new vector(Manager.mapSize/2, Manager.mapSize/2);
        destination.add(offset);
        destination.div(Manager.tileRadius);
        currentLocation.add(offset);
        currentLocation.div(Manager.tileRadius);
        currentLocation.x = Math.trunc(currentLocation.x);
        currentLocation.y = Math.trunc(currentLocation.y);
        destination.x = Math.trunc(destination.x);
        destination.y = Math.trunc(destination.y);

        //finds path
        //TODO limit destination distance for optmization
        let spot: number[] = [];
        let planner = createPlanner(Manager.matrix);
        let dist = planner.search(currentLocation.y, currentLocation.x, destination.y, destination.x, spot);
        let directions: vector[] = [];
        //converts simplified collision mesh to actual game path directions
        for(let i = 0; i < spot.length; i+=2){
            let x: number = spot[i+1]
            let y: number = spot[i];
           // Manager.matrix.set(y,x,3);
            directions.push(new vector((x*Manager.tileRadius)-Manager.mapSize/2, (y*Manager.tileRadius)-Manager.mapSize/2));
        }
        //prints path //TODO doesnt even actually print path, just prints collision matrix
        /*for(let i = 0; i < Manager.matrix.shape[0]; i++){
            for(let j = 0; j < Manager.matrix.shape[1]; j++){
                process.stdout.write(""+ Manager.matrix.get(i,j));
            }
            console.log()
        }*/
        //converts path to directions for ai to follow
        for(let n of directions){
            path.push(n);
        }
        path.reverse();
        return path;
    }
    finddestination(name: string): vector{
        return new vector(260-1000, 200-1000);
    }
}
export class raycast {
    increment: number = 1;
    coverCast(start: vector, direction: number, distance: number){

    }

    //returns true if aim is clear
    aimCast(start: vector, end: vector): boolean{
        let x = start.x;
        let y = start.y;
        if(Math.abs(start.y- end.y) > Math.abs(start.x - end.x)){
            let xslope = (end.x - start.x)/(Math.abs(end.y-start.y));
            if(start.y < end.y) {
                for (let i = start.y; i < end.y; i++) {
                    y++;
                    x += xslope;
                    if (!this.checkPoint(Math.trunc(x), y)) return false;
                }
            }else{
                for (let i = start.y; i > end.y; i--) {
                    y--;
                    x += xslope;
                    if (!this.checkPoint(Math.trunc(x), y)) return false;
                }
            }
        }else{
            let yslope = (end.y-start.y)/(Math.abs(end.x - start.x));

            if(start.x < end.x) {
                for (let i = start.x; i < end.x; i++) {
                    x++;
                    y += yslope;
                    if (!this.checkPoint(x, Math.trunc(y))) return false;
                }
            }else{
                for (let i = start.x; i > end.x; i--) {
                    x--;
                    y += yslope;
                    if (!this.checkPoint(x, Math.trunc(y))) return false;
                }
            }
        }
        return true;
    }
    //returns false if point collides with a static object
    checkPoint(x: number, y: number): boolean{
        let hash = (Math.trunc((x+Manager.mapSize/2) / Manager.spatialMap.cellsize)) + (Math.trunc((y+Manager.mapSize/2) / Manager.spatialMap.cellsize) * 10);
        let location = new vector(x,y);
        let rect1: Array<vector> = [
            new vector(location.x, location.y),
            new vector(location.x, location.y),
            new vector(location.x, location.y),
            new vector(location.x, location.y),];
        for(let s of Manager.spatialMap.savedBuckets[hash]) {
            let rect2: Array<vector> = new Array<vector>();
            for (let i = 0; i < s.hitbox.points.length; i++) {
                rect2[i] = new vector(0, 0, s.hitbox.points[i]);
                rect2[i].add(s.location);
            }
            if (rect1[3].x <= rect2[2].x&&
                rect1[2].x  >= rect2[3].x &&
                rect1[3].y <= rect2[0].y &&
                rect1[0].y >= rect2[3].y) {
                //console.log(x +", " + y)
                return false;
            }
        }
        return true;
    }
}

export let raycaster = new raycast();
export let pathfinder = new pathFinder();

class wandering extends state{
    destination: vector;
    constructor(parent: bot) {
        super();
        let x = Math.random() * Manager.mapSize;
        let y = Math.random() * Manager.mapSize;
        this.destination = new vector(x,y)
        while(!Manager.checkPoint(this.destination)){
            x = Math.random() * Manager.mapSize;
            y = Math.random() * Manager.mapSize;
        }
        parent.destination = this.destination;
        pathfinder.push(parent);
    }
    action(parent: bot) {
        if(parent.path != undefined && parent.path.length == 0){
            parent.currentState = new wandering(parent);
        }
    }
    update(parent: bot) {
        Start.update(parent);
    }
}
class waiting extends state{

}
class hiding extends state{

}
class attack extends state{
    target: gameObject;
    lastLocation: vector;
    lostCounter = 0;
    constructor(target: gameObject) {
        super();
        this.target = target;
    }
    update(parent: bot) {

    }
    action(parent: bot) {
        if(this.target instanceof player && Manager.playerByID[this.target.ID] == this.target){
            let distance = Math.sqrt(Math.pow(parent.location.x - this.target.location.x, 2) + Math.pow(parent.location.y - this.target.location.y, 2));
            if(distance < 700) {
                let direction = new vector(0, 0, this.target.location);
                direction.sub(parent.location);
                let angle = Math.atan2(direction.y, direction.x);
                angle *= (180 / Math.PI);
                if (angle < 0) angle += 360;
                angle += 90;
                let rotation = angle;
                rotation += Math.floor(Math.random() * 10) - 5;
                let chance = .05;
                if (raycaster.aimCast(parent.location, this.target.location)) {
                    parent.rotation = angle;
                    if (Math.random() < chance) {
                        //TODO add items for bots
                        new bullet(parent.location.x, parent.location.y, rotation, parent, 10);
                    }
                    this.lastLocation = null;
                    this.lostCounter = 0;
                }else if(this.lastLocation == null){
                    this.lastLocation = this.target.location;
                }else{
                    this.lostCounter++;
                }
                if(this.lostCounter >= 200/Manager.botupdate){
                    parent.destination = this.lastLocation;
                    pathfinder.push(parent);
                    this.lostCounter = 0;
                }
            }
        }else{
            parent.vis.threat = null;
            parent.currentState = Start;
        }
    }
}
export class destination{
    location : vector;
    name: string;
    constructor(location: vector, name: string) {
        this.name = name;
        this.location = location;
        Manager.destinations.push(this);
    }
}

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
        if(p == undefined){
            this.location = location;
            Manager.groundItems.push(this);
        }else{
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
let moneyThreshold = 10;
let Start: start = new start();

export class wall extends staticObject{
    color: number;
    constructor(x: number,y: number, l: number, w: number) {
        super(x, y);
        this.hitbox = new hitBox(0, true, w, l)
        Manager.spatialMap.insert(this);
    }

}

export let Manager: entityManager = new entityManager();
export function buildPlayerPayload(id: string): Array<number>{
    let payload: Array<number> = [Manager.players.length];
    payload.push(Manager.playerByID[id].location.x);
    payload.push(Manager.playerByID[id].location.y);
    payload.push(Manager.playerByID[id].health);
    if(Manager.playerByID[id].im.hands[0] != undefined) payload.push(Manager.playerByID[id].im.hands[0].type);
    else payload.push(0);
    payload.push(Manager.playerByID[id].hunger);
    payload.push(Manager.playerByID[id].thirst);
    payload.push(-2);
    for(let p of Manager.players){
        if(p.ID != id){
            payload.push(p.location.x);
            payload.push(p.location.y);
            payload.push(p.rotation);
            if(p.im.hands[0] != undefined) payload.push(p.im.hands[0].type);
            else payload.push(0);
            payload.push(-2);
        }
    }
    for(let b of Manager.bots){
            payload.push(b.location.x);
            payload.push(b.location.y);
            payload.push(b.rotation);
            payload.push(2);
            payload.push(-2);
    }
    payload[payload.length-1] = -1;
    for(let b of Manager.bulletstoSend){
        payload.push(b.location.x);
        payload.push(b.location.y);
        payload.push(b.rotation);
        payload.push(-1);
    }
    //console.log(payload);
    return payload;
}
export class InventoryManager{
    inventory: item[];
    inventoryMatrix: number[][] = [];
    hands: item[];
    handsMatrix: number[][] = [];
    ground: item[];
    groundMatrix: number[][] = [];
    chest: item[];
    chestdMatrix: number[][] = [];
    back: item[];
    backMatrix: number[][] = [];
    head: item[];
    headMatrix: number[][] = [];
    face: item[];
    faceMatrix: number[][] = [];
    height: number;
    width: number;
    space: number;
    selected: item;

    pickUp: number = 100;
    constructor(height: number, width: number) {
        this.height = height;
        this.width = width;
        this.space = width*height;
        this.inventory = [];
        this.hands = [];
        this.ground = [];
        this.chest = [];
        this.head = [];
        this.back = [];
        this.face = [];
        this.selected = null;

        for(let i = 0; i < height; i++){
                this.inventoryMatrix[i] = [];
            for(let j = 0; j < width; j++){
                this.inventoryMatrix[i][j] = 0;
            }
        }
        for(let i = 0; i < 12; i++){
            this.groundMatrix[i] = [];
            for(let j = 0; j < 6; j++){
                this.groundMatrix[i][j] = 0;
            }
        }
        for(let i = 0; i < 4; i++){
            this.handsMatrix[i] = [];
            for(let j = 0; j < 2; j++){
                this.handsMatrix[i][j] = 0;
            }
        }
        for(let i = 0; i < 2; i++){
            this.chestdMatrix[i] = [];
            for(let j = 0; j < 2; j++){
                this.chestdMatrix[i][j] = 0;
            }
        }
        for(let i = 0; i < 1; i++){
            this.headMatrix[i] = [];
            for(let j = 0; j < 1; j++){
                this.headMatrix[i][j] = 0;
            }
        }
        for(let i = 0; i < 2; i++){
            this.backMatrix[i] = [];
            for(let j = 0; j < 2; j++){
                this.backMatrix[i][j] = 0;
            }
        }
        for(let i = 0; i < 1; i++){
            this.faceMatrix[i] = [];
            for(let j = 0; j < 1; j++){
                this.faceMatrix[i][j] = 0;
            }
        }
    }
    add(it: item, container: number): boolean{
        if(container == 0){
                for(let i = 0; i < this.height; i++) {
                    for (let j = 0; j < this.width; j++) {
                        if(this.checkSpot(it, 0, i,j)){
                            this.inventory.push(it);
                            it.spot = new vector(i, j);
                            it.container = 0;
                            for(let h = i; h < i+it.height; h++) {
                                for (let k = j; k < j+it.width; k++) {
                                    this.inventoryMatrix[h][k] = 1;
                                }
                            }
                            return true;
                        }
                    }
                }
        }else if(container == 1){
            for(let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if(this.checkSpot(it, 1, i,j)){
                        this.ground.push(it);
                        it.spot = new vector(i, j);
                        it.container = 1;
                        for(let h = i; h < i+it.height; h++) {
                            for (let k = j; k < j+it.width; k++) {
                                this.groundMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        else if(container == 2){
            for(let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if(this.checkSpot(it, 2, i,j)){
                        this.hands.push(it);
                        it.spot = new vector(i, j);
                        it.container = 2;
                        for(let h = i; h < i+it.height; h++) {
                            for (let k = j; k < j+it.width; k++) {
                                this.handsMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        else if(container == 3){
            for(let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if(this.checkSpot(it, 3, i,j)){
                        this.chest.push(it);
                        it.spot = new vector(i, j);
                        it.container = 3;
                        for(let h = i; h < i+it.height; h++) {
                            for (let k = j; k < j+it.width; k++) {
                                this.chestdMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        if(container == 4){
            for(let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if(this.checkSpot(it, 4, i,j)){
                        this.back.push(it);
                        it.spot = new vector(i, j);
                        it.container = 4;
                        for(let h = i; h < i+it.height; h++) {
                            for (let k = j; k < j+it.width; k++) {
                                this.backMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        if(container == 5){
            for(let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if(this.checkSpot(it, 5, i,j)){
                        this.head.push(it);
                        it.spot = new vector(i, j);
                        it.container = 5;
                        for(let h = i; h < i+it.height; h++) {
                            for (let k = j; k < j+it.width; k++) {
                                this.headMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        if(container == 6){
            for(let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if(this.checkSpot(it, 6, i,j)){
                        this.face.push(it);
                        it.spot = new vector(i, j);
                        it.container = 6;
                        for(let h = i; h < i+it.height; h++) {
                            for (let k = j; k < j+it.width; k++) {
                                this.faceMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
            return false;
    }
    rotate(it: item){
        let mem = it.width;
        it.width = it.height;
        it.height = mem;
        it.rotated = !it.rotated;
        it.justrotated = true;
    }
    get(x: number, y: number, container: number): item{
        if(container == 0) {
            for (let i of this.inventory) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }else if(container == 1) {
            for (let i of this.ground) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }
        else if(container == 2) {
            for (let i of this.hands) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }
        else if(container == 3) {
            for (let i of this.chest) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }
        else if(container == 4) {
            for (let i of this.back) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }
        else if(container == 5) {
            for (let i of this.head) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }
        else if(container == 6) {
            for (let i of this.face) {
                if( x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width){
                    return i;
                }
            }
        }
        return null;
    }
    remove(it: item): boolean{
        if(it.container == 0){
            let index = this.inventory.indexOf(it);
            if(index != -1){
                this.inventory.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.inventoryMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.inventoryMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                return true;
            }

        }
        else if(it.container == 1){
            let index = this.ground.indexOf(it);
            if(index != -1){
                this.ground.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.groundMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.groundMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                //TODO make this more efficent
                index = Manager.groundItems.indexOf(it);
                Manager.groundItems.splice(index, 1);
                return true;
            }
        }
        else if(it.container == 2){
            let index = this.hands.indexOf(it);
            if(index != -1){
                this.hands.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.handsMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.handsMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                return true;
            }
        }
        else if(it.container == 3){
            let index = this.chest.indexOf(it);
            if(index != -1){
                this.chest.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.chestdMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.chestdMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                return true;
            }
        }
        else if(it.container == 4){
            let index = this.back.indexOf(it);
            if(index != -1){
                this.back.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.backMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.backMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                return true;
            }
        }
        else if(it.container == 5){
            let index = this.head.indexOf(it);
            if(index != -1){
                this.head.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.headMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.headMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                return true;
            }
        }
        else if(it.container == 6){
            let index = this.face.indexOf(it);
            if(index != -1){
                this.face.splice(index, 1);
                if(it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.faceMatrix[i][j] = 0;
                        }
                    }
                }else{
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.faceMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                return true;
            }
        }
        return false;
    }
    move(it: item, container: number, x: number, y: number, p: player){
        let prevSpot = it.spot;
        let prevContainer =it.container;
        if(this.remove(it)){
            console.log("geh");
            if(this.checkSpot(it, container, x, y)){
                console.log("guh");
                if(container != 1) {
                    this.put(it, container, x, y);
                }else{
                    it.location = new vector(0,0,p.location);
                    Manager.groundItems.push(it);
                }
            }else {
                if(prevContainer != 1) {
                    if (it.justrotated) this.rotate(it);
                    this.put(it, prevContainer, prevSpot.x, prevSpot.y);
                }else{
                    it.location = new vector(0,0,p.location);
                    Manager.groundItems.push(it);
                }
            }
        }
        if(container == 6){
            console.log(this.faceMatrix);
        }
    }
    put(it: item, container: number, x: number, y: number){
        it.container = container;
        it.spot = new vector(x,y);
        if(container == 0){
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.inventoryMatrix[i][j] = 1;
                }
            }
            this.inventory.push(it);
        }else if(container == 1) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.groundMatrix[i][j] = 1;
                }
            }
            this.ground.push(it);
        }
        else if(container == 2) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.handsMatrix[i][j] = 1;
                }
            }
            this.hands.push(it);
        } else if(container == 3) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.chestdMatrix[i][j] = 1;
                }
            }
            this.chest.push(it);
        }
        else if(container == 4) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.backMatrix[i][j] = 1;
                }
            }
            this.back.push(it);
        }
        else if(container == 5) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.headMatrix[i][j] = 1;
                }
            }
            this.head.push(it);
        }
        else if(container == 6) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.faceMatrix[i][j] = 1;
                }
            }
            this.face.push(it);
        }
    }
    checkSpot(it: item, container: number, x: number, y: number){
        if(container == 0){
            if(x >= 0 && x < this.inventoryMatrix.length && y >= 0 && y < this.inventoryMatrix[x].length &&this.inventoryMatrix[x][y] == 0) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.inventoryMatrix.length || k >= this.inventoryMatrix[h].length || this.inventoryMatrix[h][k] != 0) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }else if(container == 1){
            if(x >= 0 && x < this.groundMatrix.length && y >= 0 && y < this.groundMatrix[x].length &&this.groundMatrix[x][y] == 0){
                for(let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {

                        if(h >= this.groundMatrix.length || k >= this.groundMatrix[h].length || this.groundMatrix[h][k] != 0){
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        else if(container == 2){
            if(x >= 0 && x < this.handsMatrix.length && y >= 0 && y < this.handsMatrix[x].length &&this.handsMatrix[x][y] == 0){
                for(let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {

                        if(h >= this.handsMatrix.length || k >= this.handsMatrix[h].length || this.handsMatrix[h][k] != 0){
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        else if(container == 3 && it instanceof equipment){
            if(x >= 0 && x < this.chestdMatrix.length && y >= 0 && y < this.chestdMatrix[x].length &&this.chestdMatrix[x][y] == 0){
                for(let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {

                        if(h >= this.chestdMatrix.length || k >= this.chestdMatrix[h].length || this.chestdMatrix[h][k] != 0){
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        if(container == 4 && it instanceof equipment){
            if(x >= 0 && x < this.backMatrix.length && y >= 0 && y < this.backMatrix[x].length &&this.backMatrix[x][y] == 0){
                for(let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {

                        if(h >= this.backMatrix.length || k >= this.backMatrix[h].length || this.backMatrix[h][k] != 0){
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        if(container == 5 && it instanceof equipment){
            if(x >= 0 && x < this.headMatrix.length && y >= 0 && y < this.headMatrix[x].length &&this.headMatrix[x][y] == 0){
                for(let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {

                        if(h >= this.headMatrix.length || k >= this.headMatrix[h].length || this.headMatrix[h][k] != 0){
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        if(container == 6 && it instanceof equipment){
            if(x >= 0 && x < this.faceMatrix.length && y >= 0 && y < this.faceMatrix[x].length &&this.faceMatrix[x][y] == 0){
                for(let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {

                        if(h >= this.faceMatrix.length || k >= this.faceMatrix[h].length || this.faceMatrix[h][k] != 0){
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        return false;
    }
    print(){
        console.log("-----------------")
        for(let i = 0; i < this.inventoryMatrix.length; i++){
            for(let j = 0; j < this.inventoryMatrix.length; j++){
                process.stdout.write(" "+ this.inventoryMatrix[i][j]);
            }
            console.log()
        }
    }
    getGround(p: player){
        //clear ground;
        this.ground = [];
        for(let i = 0; i < 12; i++){
            this.groundMatrix[i] = [];
            for(let j = 0; j < 6; j++){
                this.groundMatrix[i][j] = 0;
            }
        }
        for(let i of Manager.groundItems){
            let dist = Math.sqrt(Math.pow(i.location.x - p.location.x, 2) + Math.pow(i.location.y - p.location.y, 2));
            //console.log(dist);
            if(dist <= this.pickUp) {
                this.add(i, 1);
            }
        }

    }
}