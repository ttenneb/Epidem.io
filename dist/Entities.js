"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ndarray_1 = __importDefault(require("ndarray"));
const PriorityQueue_1 = __importDefault(require("ts-priority-queue/src/PriorityQueue"));
// @ts-ignore
const l1_path_finder_1 = __importDefault(require("l1-path-finder"));
const Items_1 = require("./Items");
class vector {
    constructor(x, y, copy) {
        this.x = x;
        this.y = y;
        if (copy != undefined) {
            this.x = copy.x;
            this.y = copy.y;
        }
    }
    add(a) {
        this.x += a.x;
        this.y += a.y;
    }
    sub(a) {
        this.x -= a.x;
        this.y -= a.y;
    }
    mult(a) {
        this.x *= a;
        this.y *= a;
    }
    div(a) {
        this.x /= a;
        this.y /= a;
    }
    norm() {
        let mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.div(mag);
    }
    mag() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    equals(a) {
        return this.x == a.x && this.y == a.y;
    }
}
exports.vector = vector;
class gameObject {
    constructor(x, y) {
        this.location = new vector(x || 0, y || 0);
        exports.Manager.gameObjects.push(this);
    }
    isColliding(object) {
        if (this.hitbox.radius != 0 && object.hitbox.radius != 0) {
            let dx = this.location.x - object.location.x;
            let dy = this.location.y - object.location.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.hitbox.radius + object.hitbox.radius) {
                return true;
            }
            return false;
        }
        else if (object instanceof staticObject) {
            let rect1 = new Array();
            for (let i = 0; i < this.hitbox.points.length; i++) {
                rect1[i] = new vector(0, 0, this.hitbox.points[i]);
                rect1[i].add(this.location);
            }
            let rect2 = new Array();
            for (let i = 0; i < object.hitbox.points.length; i++) {
                rect2[i] = new vector(0, 0, object.hitbox.points[i]);
                rect2[i].add(object.location);
            }
            if (rect1[3].x <= rect2[2].x &&
                rect1[2].x >= rect2[3].x &&
                rect1[3].y <= rect2[0].y &&
                rect1[0].y >= rect2[3].y) {
                if (this instanceof bullet) {
                    this.removable = true;
                }
                if (this instanceof player) {
                    if (rect1[3].y == rect2[0].y) {
                        this.location.y += this.playerSpeed;
                    }
                    if (rect1[0].y == rect2[3].y) {
                        this.location.y -= this.playerSpeed;
                    }
                    if (rect1[0].x == rect2[3].x) {
                        this.location.x -= this.playerSpeed;
                    }
                    if (rect1[3].x == rect2[0].x) {
                        this.location.x += this.playerSpeed;
                    }
                }
                return true;
            }
        }
        return false;
    }
}
exports.gameObject = gameObject;
class hitBox {
    constructor(r, rect, width, length) {
        this.points = new Array();
        if (rect == false) {
            this.radius = r;
            this.points.push(new vector(this.radius, this.radius));
            this.points.push(new vector(-this.radius, this.radius));
            this.points.push(new vector(this.radius, -this.radius));
            this.points.push(new vector(-this.radius, -this.radius));
        }
        else if (width != undefined && length != undefined) {
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
class bullet extends gameObject {
    constructor(x, y, r, p, damage) {
        super(x, y);
        this.removable = false;
        this.speed = 7;
        let radians = (r - 90) * (Math.PI / 180);
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
        exports.Manager.bulletstoSend.push(this);
        this.distance = 0;
        this.hitbox = new hitBox(1, false);
    }
}
exports.bullet = bullet;
class player extends gameObject {
    constructor(ID, socket) {
        super();
        this.Input = [];
        this.socket = socket;
        this.ID = ID;
        this.im = new InventoryManager(6, 6);
        this.health = 100;
        this.hunger = 100;
        this.thirst = 100;
        this.armor = 0;
        exports.Manager.players.push(this);
        this.hitbox = new hitBox(20, false);
        this.keyMem = new Array(4);
        this.selected = 0;
        this.playerSpeed = 1;
        this.countdown = 0;
        this.bullets = [];
    }
    getHealth() {
        return this.health;
    }
}
exports.player = player;
class entityManager {
    constructor() {
        this.mapSize = 2000;
        this.tileRadius = 40;
        this.botupdate = 3;
        this.botupdatecount = this.botupdate;
        this.playerByID = {};
        this.gameObjects = [];
        this.players = [];
        this.bullets = [];
        this.bulletstoSend = [];
        this.spatialMap = new spatialHashMap();
        this.staticObjects = [];
        this.bots = [];
        this.destinations = [];
        this.groundItems = [];
    }
    bakeGraph() {
        this.matrix = ndarray_1.default([], [this.mapSize / this.tileRadius, this.mapSize / this.tileRadius]);
        for (let i = 0; i < this.mapSize / this.tileRadius; i += 1) {
            for (let j = 0; j < this.mapSize / this.tileRadius; j += 1) {
                if (this.checkPoint(new vector(j * this.tileRadius, i * this.tileRadius))) {
                    this.matrix.set(i, j, 0);
                }
                else {
                    this.matrix.set(i, j, 1);
                }
            }
        }
        for (let i = 0; i < exports.Manager.matrix.shape[0]; i++) {
            for (let j = 0; j < exports.Manager.matrix.shape[1]; j++) {
                process.stdout.write("" + exports.Manager.matrix.get(i, j));
            }
            console.log();
        }
    }
    checkPoint(location) {
        //TODO idk might be problem here with only checkig point not hitbox of a bot
        location.sub(new vector(this.mapSize / 2, this.mapSize / 2));
        let rect1 = [
            //these are all off
            new vector(location.x + this.tileRadius / 2, location.y + this.tileRadius / 2),
            new vector(location.x - this.tileRadius / 2, location.y + this.tileRadius / 2),
            new vector(location.x + this.tileRadius / 2, location.y - this.tileRadius / 2),
            new vector(location.x - this.tileRadius / 2, location.y - this.tileRadius / 2),
        ];
        for (let s of exports.Manager.staticObjects) {
            let rect2 = new Array();
            for (let i = 0; i < s.hitbox.points.length; i++) {
                rect2[i] = new vector(0, 0, s.hitbox.points[i]);
                rect2[i].add(s.location);
            }
            if (rect1[3].x <= rect2[2].x &&
                rect1[2].x >= rect2[3].x &&
                rect1[3].y <= rect2[0].y &&
                rect1[0].y >= rect2[3].y) {
                return false;
            }
        }
        return true;
    }
}
class spatialHashMap {
    constructor() {
        this.cellsize = 500;
        this.clear();
        this.savedBuckets = new Array(100);
        for (let i = 0; i < 100; i++) {
            this.savedBuckets[i] = new Array();
        }
    }
    clear() {
        this.buckets = new Array(100);
        for (let i = 0; i < 100; i++) {
            this.buckets[i] = new Array();
        }
    }
    //TODO if an object is bigger then a hashmap sector it can extend through out the whole sector and not be included in it becuase it's points are only on edges
    insert(object) {
        let indexes = [];
        for (let p of object.hitbox.points) {
            let location = new vector(0, 0);
            location.add(p);
            location.add(object.location);
            let index = (Math.trunc((location.x + exports.Manager.mapSize / 2) / this.cellsize)) + (Math.trunc((location.y + exports.Manager.mapSize / 2) / this.cellsize) * 10);
            if (indexes.find(element => element == index) == undefined) {
                if (index >= 0 && index < 100) {
                    if (object instanceof staticObject) {
                        this.savedBuckets[index].push(object);
                    }
                    else
                        this.buckets[index].push(object);
                    indexes.push(index);
                }
                else {
                    //console.log(index + ", " + object.location);
                }
            }
        }
    }
}
class staticObject extends gameObject {
    constructor(x, y) {
        super(x, y);
        exports.Manager.staticObjects.push(this);
    }
}
exports.staticObject = staticObject;
class bot extends gameObject {
    constructor(x, y, hostile, health) {
        super(x, y);
        this.removable = false;
        this.vis = new vision(this);
        this.hitbox = new hitBox(20, false);
        this.health = health;
        exports.Manager.bots.push(this);
        this.currentState = Start;
        this.hostile = hostile;
        this.speed = 1;
        this.searching = false;
    }
    drop() {
        for (let i = 0; i < this.lootTable.length; i++) {
            if (Math.random() < this.probTable[i]) {
                this.lootTable[i].location = new vector(this.location.x + (Math.random() * 50 - 100), this.location.y + (Math.random() * 50 - 100));
                exports.Manager.groundItems.push(this.lootTable[i]);
            }
        }
    }
    moveState() {
        this.currentState.update(this);
    }
    action() {
        if (this.path != undefined) {
            //make bot go to actual destination not final path instructions
            if (!this.pastlocation.equals(this.location)) {
                this.path = [];
                this.current = new vector(0, 0, this.location);
                exports.pathfinder.push(this);
            }
            for (let i = 0; i < exports.Manager.botupdate; i++) {
                if (this.current != undefined && !this.current.equals(this.location)) {
                    if (this.current.x > this.location.x) {
                        this.location.x += this.speed;
                        this.rotation = 90;
                    }
                    else if (this.current.x < this.location.x) {
                        this.location.x -= this.speed;
                        this.rotation = 270;
                    }
                    if (this.current.y > this.location.y) {
                        this.location.y += this.speed;
                        this.rotation = 180;
                    }
                    else if (this.current.y < this.location.y) {
                        this.location.y -= this.speed;
                        this.rotation = 0;
                    }
                }
                else {
                    //gets netxt instruction in the path
                    let next = this.path.pop();
                    if (next != undefined) {
                        this.current = next;
                        //if the path is done and the bot hasnt reached destination it recalculates
                    }
                    else if (this.path.length > 0 && !this.location.equals(this.destination)) {
                        exports.pathfinder.push(this);
                    }
                }
            }
        }
        this.pastlocation = this.location;
        this.vis.location = this.location;
        this.currentState.action(this);
    }
    getPathPriority() {
        this.pathPriority = 1;
    }
}
exports.bot = bot;
class pedestrian extends bot {
    constructor(x, y) {
        super(x, y, false, 100);
        this.lootTable = [new Items_1.grizzly(null), new Items_1.water(null), new Items_1.chips(null)];
        this.probTable = [.1, .5, .5];
    }
    drop() {
        super.drop();
        this.lootTable = [new Items_1.grizzly(null), new Items_1.water(null), new Items_1.chips(null)];
    }
}
exports.pedestrian = pedestrian;
class police extends bot {
    constructor(x, y) {
        super(x, y, true, 125);
        this.lootTable = [new Items_1.gunSemi(null), new Items_1.policeVest(null), new Items_1.grizzly(null), new Items_1.water(null), new Items_1.chips(null), new Items_1.itembullet(Math.random() * 30 + 1, null)];
        this.probTable = [.5, .33, .2, .33, .33, .5];
    }
    drop() {
        super.drop();
        this.lootTable = [new Items_1.gunSemi(null), new Items_1.policeVest(null), new Items_1.grizzly(null), new Items_1.water(null), new Items_1.chips(null), new Items_1.itembullet(Math.random() * 30 + 1, null)];
    }
}
exports.police = police;
class vision extends gameObject {
    constructor(parent) {
        super();
        this.hitbox = new hitBox(250, false);
        this.location = parent.location;
    }
}
exports.vision = vision;
class state {
    constructor() {
    }
    update(parent) {
    }
    action(parent) {
    }
}
class start extends state {
    constructor() {
        super();
    }
    update(parent) {
        if (parent.vis.threat != undefined) {
            if (parent.hostile == true) {
                parent.currentState = new attack(parent.vis.threat);
                return;
            }
            else if (!(parent.currentState instanceof run)) {
                console.log("guh");
                parent.path = [];
                parent.currentState = new run(parent, parent.vis.threat.location);
                return;
            }
        }
        if (parent.injured) {
            parent.destination = exports.pathfinder.finddestination("hospital");
            //TODO fix this taveling state thing seems redudent
            parent.currentState = new traveling();
            exports.pathfinder.push(parent);
        }
        if (!(parent.currentState instanceof wandering) && !(parent.currentState instanceof traveling)) {
            parent.currentState = new wandering(parent);
            return;
        }
    }
}
exports.start = start;
class traveling extends state {
    constructor() {
        super();
    }
    update(parent) {
        Start.update(parent);
    }
    action(parent) {
    }
}
class pathFinder {
    //Creates a path for the bot to travel along, needs optimization (takes ~ 1 sec for every 10 paths genereated), also can get stuck easily!!
    constructor() {
        this.count = 0;
        //TODO check to make sure this is a min PQ not max
        this.queue = new PriorityQueue_1.default({ comparator: function (a, b) { return b.pathPriority - a.pathPriority; } });
    }
    push(b) {
        //TODO add calculation for pathPriority
        b.getPathPriority();
        this.queue.queue(b);
        b.searching = true;
    }
    pop() {
        if (this.queue.length > 0) {
            let bnext = this.queue.dequeue();
            bnext.path = this.findpath(bnext.location, bnext.destination);
            bnext.searching = false;
        }
    }
    findpath(location, pathto) {
        let path = [];
        let currentLocation = new vector(0, 0, location);
        let destination = new vector(0, 0, pathto);
        let offset = new vector(exports.Manager.mapSize / 2, exports.Manager.mapSize / 2);
        destination.add(offset);
        destination.div(exports.Manager.tileRadius);
        currentLocation.add(offset);
        currentLocation.div(exports.Manager.tileRadius);
        currentLocation.x = Math.trunc(currentLocation.x);
        currentLocation.y = Math.trunc(currentLocation.y);
        destination.x = Math.trunc(destination.x);
        destination.y = Math.trunc(destination.y);
        //finds path
        //TODO limit destination distance for optmization
        let spot = [];
        let planner = l1_path_finder_1.default(exports.Manager.matrix);
        let dist = planner.search(currentLocation.y, currentLocation.x, destination.y, destination.x, spot);
        let directions = [];
        //converts simplified collision mesh to actual game path directions
        for (let i = 0; i < spot.length; i += 2) {
            let x = spot[i + 1];
            let y = spot[i];
            // Manager.matrix.set(y,x,3);
            directions.push(new vector((x * exports.Manager.tileRadius) - exports.Manager.mapSize / 2, (y * exports.Manager.tileRadius) - exports.Manager.mapSize / 2));
        }
        //prints path //TODO doesnt even actually print path, just prints collision matrix
        /*for(let i = 0; i < Manager.matrix.shape[0]; i++){
            for(let j = 0; j < Manager.matrix.shape[1]; j++){
                process.stdout.write(""+ Manager.matrix.get(i,j));
            }
            console.log()
        }*/
        //converts path to directions for ai to follow
        for (let n of directions) {
            path.push(n);
        }
        path.reverse();
        return path;
    }
    finddestination(name) {
        return new vector(260 - 1000, 200 - 1000);
    }
}
exports.pathFinder = pathFinder;
class raycast {
    constructor() {
        this.increment = 1;
    }
    coverCast(start, direction, distance) {
    }
    //returns true if aim is clear
    aimCast(start, end) {
        let x = start.x;
        let y = start.y;
        if (Math.abs(start.y - end.y) > Math.abs(start.x - end.x)) {
            let xslope = (end.x - start.x) / (Math.abs(end.y - start.y));
            if (start.y < end.y) {
                for (let i = start.y; i < end.y; i++) {
                    y++;
                    x += xslope;
                    if (!this.checkPoint(Math.trunc(x), y))
                        return false;
                }
            }
            else {
                for (let i = start.y; i > end.y; i--) {
                    y--;
                    x += xslope;
                    if (!this.checkPoint(Math.trunc(x), y))
                        return false;
                }
            }
        }
        else {
            let yslope = (end.y - start.y) / (Math.abs(end.x - start.x));
            if (start.x < end.x) {
                for (let i = start.x; i < end.x; i++) {
                    x++;
                    y += yslope;
                    if (!this.checkPoint(x, Math.trunc(y)))
                        return false;
                }
            }
            else {
                for (let i = start.x; i > end.x; i--) {
                    x--;
                    y += yslope;
                    if (!this.checkPoint(x, Math.trunc(y)))
                        return false;
                }
            }
        }
        return true;
    }
    //returns false if point collides with a static object
    checkPoint(x, y) {
        let hash = (Math.trunc((x + exports.Manager.mapSize / 2) / exports.Manager.spatialMap.cellsize)) + (Math.trunc((y + exports.Manager.mapSize / 2) / exports.Manager.spatialMap.cellsize) * 10);
        let location = new vector(x, y);
        let rect1 = [
            new vector(location.x, location.y),
            new vector(location.x, location.y),
            new vector(location.x, location.y),
            new vector(location.x, location.y),
        ];
        for (let s of exports.Manager.spatialMap.savedBuckets[hash]) {
            let rect2 = new Array();
            for (let i = 0; i < s.hitbox.points.length; i++) {
                rect2[i] = new vector(0, 0, s.hitbox.points[i]);
                rect2[i].add(s.location);
            }
            if (rect1[3].x <= rect2[2].x &&
                rect1[2].x >= rect2[3].x &&
                rect1[3].y <= rect2[0].y &&
                rect1[0].y >= rect2[3].y) {
                //console.log(x +", " + y)
                return false;
            }
        }
        return true;
    }
}
exports.raycast = raycast;
exports.raycaster = new raycast();
exports.pathfinder = new pathFinder();
class wandering extends state {
    constructor(parent) {
        super();
        let x = Math.random() * exports.Manager.mapSize;
        let y = Math.random() * exports.Manager.mapSize;
        this.destination = new vector(x, y);
        while (!exports.Manager.checkPoint(this.destination)) {
            x = Math.random() * exports.Manager.mapSize;
            y = Math.random() * exports.Manager.mapSize;
        }
        parent.destination = this.destination;
        exports.pathfinder.push(parent);
    }
    action(parent) {
        if (parent.path != undefined && parent.path.length == 0) {
            parent.currentState = new wandering(parent);
        }
    }
    update(parent) {
        Start.update(parent);
    }
}
class run extends state {
    constructor(parent, location) {
        super();
        let direction = new vector(0, 0); /*,location);
        direction.norm();
        direction.mult(-500);
        direction.add(parent.location);*/
        let count = 0;
        /*while(!Manager.checkPoint(direction) && count < 20){
            direction.add(new vector(Math.random()*10, Math.random()*10));
            count++;
        }*/
        parent.destination = direction;
        parent.speed = 2;
        exports.pathfinder.push(parent);
    }
    update(parent) {
        console.log(parent.path.length);
        if (parent.path != undefined && parent.path.length == 0 && parent.searching == false) {
            parent.speed = 1;
            parent.vis.threat = null;
            Start.update(parent);
        }
    }
}
class waiting extends state {
}
class hiding extends state {
}
class attack extends state {
    constructor(target) {
        super();
        this.lostCounter = 0;
        this.target = target;
    }
    update(parent) {
    }
    action(parent) {
        if (this.target instanceof player && exports.Manager.playerByID[this.target.ID] == this.target) {
            let distance = Math.sqrt(Math.pow(parent.location.x - this.target.location.x, 2) + Math.pow(parent.location.y - this.target.location.y, 2));
            if (distance < 700) {
                let direction = new vector(0, 0, this.target.location);
                direction.sub(parent.location);
                let angle = Math.atan2(direction.y, direction.x);
                angle *= (180 / Math.PI);
                if (angle < 0)
                    angle += 360;
                angle += 90;
                let rotation = angle;
                rotation += Math.floor(Math.random() * 10) - 5;
                let chance = .05;
                if (exports.raycaster.aimCast(parent.location, this.target.location)) {
                    parent.rotation = angle;
                    if (Math.random() < chance) {
                        //TODO add items for bots
                        new bullet(parent.location.x, parent.location.y, rotation, parent, 10);
                    }
                    this.lastLocation = null;
                    this.lostCounter = 0;
                }
                else if (this.lastLocation == null) {
                    this.lastLocation = this.target.location;
                }
                else {
                    this.lostCounter++;
                }
                if (this.lostCounter >= 200 / exports.Manager.botupdate) {
                    parent.destination = this.lastLocation;
                    exports.pathfinder.push(parent);
                    this.lostCounter = 0;
                }
            }
        }
        else {
            parent.vis.threat = null;
            parent.currentState = Start;
        }
    }
}
class destination {
    constructor(location, name) {
        this.name = name;
        this.location = location;
        exports.Manager.destinations.push(this);
    }
}
exports.destination = destination;
let moneyThreshold = 10;
let Start = new start();
class wall extends staticObject {
    constructor(x, y, l, w) {
        super(x, y);
        this.hitbox = new hitBox(0, true, w, l);
        exports.Manager.spatialMap.insert(this);
    }
}
exports.wall = wall;
exports.Manager = new entityManager();
function buildPlayerPayload(id) {
    let payload = [exports.Manager.players.length];
    payload.push(exports.Manager.playerByID[id].location.x);
    payload.push(exports.Manager.playerByID[id].location.y);
    payload.push(exports.Manager.playerByID[id].health);
    if (exports.Manager.playerByID[id].hand != undefined)
        payload.push(exports.Manager.playerByID[id].hand.type);
    else
        payload.push(0);
    payload.push(exports.Manager.playerByID[id].hunger);
    payload.push(exports.Manager.playerByID[id].thirst);
    payload.push(exports.Manager.playerByID[id].armor);
    let hand = exports.Manager.playerByID[id].hand;
    if (hand instanceof Items_1.gunAuto) {
        payload.push(hand.ammo);
    }
    else {
        payload.push(0);
    }
    payload.push(-2);
    for (let p of exports.Manager.players) {
        if (p.ID != id) {
            payload.push(p.location.x);
            payload.push(p.location.y);
            payload.push(p.rotation);
            if (p.hand != undefined)
                payload.push(p.hand.type);
            else
                payload.push(0);
            payload.push(-2);
        }
    }
    for (let b of exports.Manager.bots) {
        payload.push(b.location.x);
        payload.push(b.location.y);
        payload.push(b.rotation);
        if (b instanceof police)
            payload.push(2);
        else if (b instanceof pedestrian)
            payload.push(0);
        payload.push(-2);
    }
    payload[payload.length - 1] = -1;
    for (let b of exports.Manager.bulletstoSend) {
        payload.push(b.location.x);
        payload.push(b.location.y);
        payload.push(b.rotation);
        payload.push(-1);
    }
    //console.log(payload);
    return payload;
}
exports.buildPlayerPayload = buildPlayerPayload;
class InventoryManager {
    constructor(height, width) {
        this.inventoryMatrix = [];
        this.handsMatrix = [];
        this.groundMatrix = [];
        this.chestdMatrix = [];
        this.backMatrix = [];
        this.headMatrix = [];
        this.faceMatrix = [];
        this.pickUp = 100;
        this.height = height;
        this.width = width;
        this.space = width * height;
        this.inventory = [];
        this.hands = [];
        this.ground = [];
        this.chest = [];
        this.head = [];
        this.back = [];
        this.face = [];
        this.selected = null;
        for (let i = 0; i < height; i++) {
            this.inventoryMatrix[i] = [];
            for (let j = 0; j < width; j++) {
                this.inventoryMatrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 12; i++) {
            this.groundMatrix[i] = [];
            for (let j = 0; j < 6; j++) {
                this.groundMatrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 4; i++) {
            this.handsMatrix[i] = [];
            for (let j = 0; j < 2; j++) {
                this.handsMatrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 2; i++) {
            this.chestdMatrix[i] = [];
            for (let j = 0; j < 2; j++) {
                this.chestdMatrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 1; i++) {
            this.headMatrix[i] = [];
            for (let j = 0; j < 1; j++) {
                this.headMatrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 2; i++) {
            this.backMatrix[i] = [];
            for (let j = 0; j < 2; j++) {
                this.backMatrix[i][j] = 0;
            }
        }
        for (let i = 0; i < 1; i++) {
            this.faceMatrix[i] = [];
            for (let j = 0; j < 1; j++) {
                this.faceMatrix[i][j] = 0;
            }
        }
    }
    add(it, container) {
        if (container == 0) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 0, i, j)) {
                        this.inventory.push(it);
                        it.spot = new vector(i, j);
                        it.container = 0;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
                                this.inventoryMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        else if (container == 1) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 1, i, j)) {
                        this.ground.push(it);
                        it.spot = new vector(i, j);
                        it.container = 1;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
                                this.groundMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        else if (container == 2) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 2, i, j)) {
                        this.hands.push(it);
                        it.spot = new vector(i, j);
                        it.container = 2;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
                                this.handsMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        else if (container == 3) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 3, i, j)) {
                        this.chest.push(it);
                        it.spot = new vector(i, j);
                        it.container = 3;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
                                this.chestdMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        if (container == 4) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 4, i, j)) {
                        this.back.push(it);
                        it.spot = new vector(i, j);
                        it.container = 4;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
                                this.backMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        if (container == 5) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 5, i, j)) {
                        this.head.push(it);
                        it.spot = new vector(i, j);
                        it.container = 5;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
                                this.headMatrix[h][k] = 1;
                            }
                        }
                        return true;
                    }
                }
            }
        }
        if (container == 6) {
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    if (this.checkSpot(it, 6, i, j)) {
                        this.face.push(it);
                        it.spot = new vector(i, j);
                        it.container = 6;
                        for (let h = i; h < i + it.height; h++) {
                            for (let k = j; k < j + it.width; k++) {
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
    rotate(it) {
        let mem = it.width;
        it.width = it.height;
        it.height = mem;
        it.rotated = !it.rotated;
        it.justrotated = true;
    }
    get(x, y, container) {
        if (container == 0) {
            for (let i of this.inventory) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        else if (container == 1) {
            for (let i of this.ground) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        else if (container == 2) {
            for (let i of this.hands) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        else if (container == 3) {
            for (let i of this.chest) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        else if (container == 4) {
            for (let i of this.back) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        else if (container == 5) {
            for (let i of this.head) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        else if (container == 6) {
            for (let i of this.face) {
                if (x >= i.spot.x && x < i.spot.x + i.height
                    && y >= i.spot.y && y < i.spot.y + i.width) {
                    return i;
                }
            }
        }
        return null;
    }
    remove(it) {
        if (it.container == 0) {
            let index = this.inventory.indexOf(it);
            if (index != -1) {
                this.inventory.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.inventoryMatrix[i][j] = 0;
                        }
                    }
                }
                else {
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
        else if (it.container == 1) {
            let index = this.ground.indexOf(it);
            if (index != -1) {
                this.ground.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.groundMatrix[i][j] = 0;
                        }
                    }
                }
                else {
                    for (let i = it.spot.x; i < it.spot.x + it.width; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.height; j++) {
                            this.groundMatrix[i][j] = 0;
                        }
                    }
                }
                it.spot = null;
                it.container = null;
                //TODO make this more efficent
                index = exports.Manager.groundItems.indexOf(it);
                exports.Manager.groundItems.splice(index, 1);
                return true;
            }
        }
        else if (it.container == 2) {
            let index = this.hands.indexOf(it);
            if (index != -1) {
                this.hands.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.handsMatrix[i][j] = 0;
                        }
                    }
                }
                else {
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
        else if (it.container == 3) {
            let index = this.chest.indexOf(it);
            if (index != -1) {
                this.chest.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.chestdMatrix[i][j] = 0;
                        }
                    }
                }
                else {
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
        else if (it.container == 4) {
            let index = this.back.indexOf(it);
            if (index != -1) {
                this.back.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.backMatrix[i][j] = 0;
                        }
                    }
                }
                else {
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
        else if (it.container == 5) {
            let index = this.head.indexOf(it);
            if (index != -1) {
                this.head.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.headMatrix[i][j] = 0;
                        }
                    }
                }
                else {
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
        else if (it.container == 6) {
            let index = this.face.indexOf(it);
            if (index != -1) {
                this.face.splice(index, 1);
                if (it.justrotated == false) {
                    for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                        for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                            this.faceMatrix[i][j] = 0;
                        }
                    }
                }
                else {
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
    move(it, container, x, y, p) {
        let prevSpot = it.spot;
        let prevContainer = it.container;
        if (this.remove(it)) {
            if (this.checkSpot(it, container, x, y)) {
                if (this.get(x, y, container) == null) {
                    if (container != 1) {
                        this.put(it, container, x, y);
                    }
                    else {
                        it.location = new vector(0, 0, p.location);
                        exports.Manager.groundItems.push(it);
                    }
                }
                else {
                    if (it instanceof Items_1.stackable) {
                        let at = this.get(x, y, container);
                        if (at instanceof Items_1.stackable) {
                            console.log("geh");
                            at.amount += it.amount;
                        }
                    }
                }
            }
            else {
                if (prevContainer != 1) {
                    if (it.justrotated)
                        this.rotate(it);
                    this.put(it, prevContainer, prevSpot.x, prevSpot.y);
                }
                else {
                    it.location = new vector(0, 0, p.location);
                    exports.Manager.groundItems.push(it);
                }
            }
        }
        if (container == 6) {
            console.log(this.faceMatrix);
        }
    }
    put(it, container, x, y) {
        it.container = container;
        it.spot = new vector(x, y);
        if (container == 0) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.inventoryMatrix[i][j] = 1;
                }
            }
            this.inventory.push(it);
        }
        else if (container == 1) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.groundMatrix[i][j] = 1;
                }
            }
            this.ground.push(it);
        }
        else if (container == 2) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.handsMatrix[i][j] = 1;
                }
            }
            this.hands.push(it);
        }
        else if (container == 3) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.chestdMatrix[i][j] = 1;
                }
            }
            this.chest.push(it);
        }
        else if (container == 4) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.backMatrix[i][j] = 1;
                }
            }
            this.back.push(it);
        }
        else if (container == 5) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.headMatrix[i][j] = 1;
                }
            }
            this.head.push(it);
        }
        else if (container == 6) {
            for (let i = it.spot.x; i < it.spot.x + it.height; i++) {
                for (let j = it.spot.y; j < it.spot.y + it.width; j++) {
                    this.faceMatrix[i][j] = 1;
                }
            }
            this.face.push(it);
        }
    }
    checkSpot(it, container, x, y) {
        if (container == 0) {
            if (x >= 0 && x < this.inventoryMatrix.length && y >= 0 && y < this.inventoryMatrix[x].length && this.inventoryMatrix[x][y] == 0 || (it instanceof Items_1.stackable && this.get(x, y, container) instanceof Items_1.stackable)) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.inventoryMatrix.length || k >= this.inventoryMatrix[h].length || this.inventoryMatrix[h][k] != 0 && !(it instanceof Items_1.stackable && this.get(h, k, container) instanceof Items_1.stackable)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        else if (container == 1) {
            if (x >= 0 && x < this.groundMatrix.length && y >= 0 && y < this.groundMatrix[x].length && this.groundMatrix[x][y] == 0 || (it instanceof Items_1.stackable && this.get(x, y, container) instanceof Items_1.stackable)) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.groundMatrix.length || k >= this.groundMatrix[h].length || this.groundMatrix[h][k] != 0 && !(it instanceof Items_1.stackable && this.get(h, k, container) instanceof Items_1.stackable)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        else if (container == 2) {
            if (x >= 0 && x < this.handsMatrix.length && y >= 0 && y < this.handsMatrix[x].length && this.handsMatrix[x][y] == 0 || (it instanceof Items_1.stackable && this.get(x, y, container) instanceof Items_1.stackable)) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.handsMatrix.length || k >= this.handsMatrix[h].length || this.handsMatrix[h][k] != 0 && !(it instanceof Items_1.stackable && this.get(h, k, container) instanceof Items_1.stackable)) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        else if (container == 3 && it instanceof Items_1.vest) {
            if (x >= 0 && x < this.chestdMatrix.length && y >= 0 && y < this.chestdMatrix[x].length && this.chestdMatrix[x][y] == 0) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.chestdMatrix.length || k >= this.chestdMatrix[h].length || this.chestdMatrix[h][k] != 0) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        if (container == 4 && it instanceof Items_1.equipment) {
            if (x >= 0 && x < this.backMatrix.length && y >= 0 && y < this.backMatrix[x].length && this.backMatrix[x][y] == 0) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.backMatrix.length || k >= this.backMatrix[h].length || this.backMatrix[h][k] != 0) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        if (container == 5 && it instanceof Items_1.equipment) {
            if (x >= 0 && x < this.headMatrix.length && y >= 0 && y < this.headMatrix[x].length && this.headMatrix[x][y] == 0) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.headMatrix.length || k >= this.headMatrix[h].length || this.headMatrix[h][k] != 0) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        if (container == 6 && it instanceof Items_1.equipment) {
            if (x >= 0 && x < this.faceMatrix.length && y >= 0 && y < this.faceMatrix[x].length && this.faceMatrix[x][y] == 0) {
                for (let h = x; h < x + it.height; h++) {
                    for (let k = y; k < y + it.width; k++) {
                        if (h >= this.faceMatrix.length || k >= this.faceMatrix[h].length || this.faceMatrix[h][k] != 0) {
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
    print() {
        console.log("-----------------");
        for (let i = 0; i < this.inventoryMatrix.length; i++) {
            for (let j = 0; j < this.inventoryMatrix.length; j++) {
                process.stdout.write(" " + this.inventoryMatrix[i][j]);
            }
            console.log();
        }
    }
    getGround(p) {
        //clear ground;
        this.ground = [];
        for (let i = 0; i < 12; i++) {
            this.groundMatrix[i] = [];
            for (let j = 0; j < 6; j++) {
                this.groundMatrix[i][j] = 0;
            }
        }
        for (let i of exports.Manager.groundItems) {
            let dist = Math.sqrt(Math.pow(i.location.x - p.location.x, 2) + Math.pow(i.location.y - p.location.y, 2));
            //console.log(dist);
            if (dist <= this.pickUp) {
                this.add(i, 1);
            }
        }
    }
    dropAll(p) {
        for (let i = this.inventory.length - 1; i >= 0; i--) {
            let mem = this.inventory[i];
            mem.location = new vector(p.location.x + (Math.random() * 50 - 100), p.location.y + (Math.random() * 50 - 100));
            exports.Manager.groundItems.push(mem);
            this.remove(this.inventory[i]);
        }
        for (let i = this.hands.length - 1; i >= 0; i--) {
            let mem = this.hands[i];
            mem.location = new vector(p.location.x + (Math.random() * 50 - 100), p.location.y + (Math.random() * 50 - 100));
            exports.Manager.groundItems.push(mem);
            this.remove(this.hands[i]);
        }
        for (let i = this.chest.length - 1; i >= 0; i--) {
            let mem = this.chest[i];
            mem.location = new vector(p.location.x + (Math.random() * 50 - 100), p.location.y + (Math.random() * 50 - 100));
            exports.Manager.groundItems.push(mem);
            this.remove(this.chest[i]);
        }
        for (let i = this.back.length - 1; i >= 0; i--) {
            let mem = this.back[i];
            mem.location = new vector(p.location.x + (Math.random() * 50 - 100), p.location.y + (Math.random() * 50 - 100));
            exports.Manager.groundItems.push(mem);
            this.remove(this.back[i]);
        }
        for (let i = this.head.length - 1; i >= 0; i--) {
            let mem = this.head[i];
            mem.location = new vector(p.location.x + (Math.random() * 50 - 100), p.location.y + (Math.random() * 50 - 100));
            exports.Manager.groundItems.push(mem);
            this.remove(this.head[i]);
        }
        for (let i = this.face.length - 1; i >= 0; i--) {
            let mem = this.face[i];
            mem.location = new vector(p.location.x + (Math.random() * 50 - 100), p.location.y + (Math.random() * 50 - 100));
            exports.Manager.groundItems.push(mem);
            this.remove(this.face[i]);
        }
    }
}
exports.InventoryManager = InventoryManager;
//# sourceMappingURL=Entities.js.map