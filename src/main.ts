import express from 'express';
import socket from 'socket.io'
import {
    player,
    buildPlayerPayload,
    vector,
    gameObject,
    Manager,
    bullet,
    wall,
    bot,
    item,
    destination, pathfinder, vision
} from "./Entities";
import {gunAuto, gunSemi, mask, policeVest} from "./Items";

const playerSpeed = 1;
let start = false;
const app = express();
app.use(express.static("C:/Users/bgarc/WebstormProjects/typescript-test/public"));
app.get('/', (req, res) => {
   console.log("gee guh")
});
const server = app.listen(5001, () => {
    console.log("Server running on port " + 5001);
});
var io = socket(server);
io.on('connection', (socket) =>{
    let id: string = socket.id;
    console.log("Client connected: " + id);
    let newplayer: player = new player(id);
    Manager.playerByID[id] = newplayer;
    let test = new gunAuto(null, Manager.playerByID[id]);
    //item being added in constructer cuasing issues because width and height is assigned after constrcution
    /*test = new item(1, new vector(0,0), newplayer);
    test.width = 4;
    test.height = 2;*/

    socket.on('update', (data) =>{
        let Keys: Array<boolean>  = new Array<boolean>();
        //console.log(id + ", "+ data);
        if(data[0] == 0){
            Keys.push(false)
        }else{
            Keys.push(true);
        }
        if(data[1] == 0){
            Keys.push(false)
        }else{
            Keys.push(true);
        }
        if(data[2] == 0){
            Keys.push(false)
        }else{
            Keys.push(true);
        }
        if(data[3] == 0){
            Keys.push(false)
        }else{
            Keys.push(true);
        }
        Manager.playerByID[id].Input = Keys;
        Manager.playerByID[id].rotation = data[4];
        let hand = Manager.playerByID[id].im.hands[0];
        if(hand != undefined) hand.use(data[5], Manager.playerByID[id])
       // console.log(Manager.bullets);
    });
    socket.on('getItems', () =>{
        send(socket, id);
    });
    socket.on('moveItem', (data: number[]) =>{
        let i = Manager.playerByID[id].im.get(data[0], data[1], data[5]);
        if(data[4] == 1) Manager.playerByID[id].im.rotate(i);
        Manager.playerByID[id].im.move(i, data[6], data[2], data[3], Manager.playerByID[id]);
        send(socket, id);
    });
    io.emit('connectionCall', id);
});
function send(socket: any, id: string){
    let data: number[][] = [];
    for (let i = 0; i < Manager.playerByID[id].im.height; i ++){
        data[i]= [];
        for (let j = 0; j < Manager.playerByID[id].im.width; j ++){
            data[i][j] = 0;
        }
    }
    for(let i of Manager.playerByID[id].im.inventory){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }

    socket.emit('items', data);
    data = [];
    for (let i = 0; i < 4; i ++){
        data[i]= [];
        for (let j = 0; j < 2; j ++){
            data[i][j] = 0;
        }
    }
   // console.log(Manager.playerByID[id].im.hands);
    for(let i of Manager.playerByID[id].im.hands){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }
    socket.emit('hands', data);

    data = [];
    for (let i = 0; i < 2; i ++){
        data[i]= [];
        for (let j = 0; j < 2; j ++){
            data[i][j] = 0;
        }
    }
    // console.log(Manager.playerByID[id].im.hands);
    for(let i of Manager.playerByID[id].im.chest){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }
    socket.emit('chest', data);

    data = [];
    for (let i = 0; i < 2; i ++){
        data[i]= [];
        for (let j = 0; j < 2; j ++){
            data[i][j] = 0;
        }
    }
    // console.log(Manager.playerByID[id].im.hands);
    for(let i of Manager.playerByID[id].im.back){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }
    socket.emit('back', data);

    data = [];
    for (let i = 0; i < 1; i ++){
        data[i]= [];
        for (let j = 0; j < 1; j ++){
            data[i][j] = 0;
        }
    }
    // console.log(Manager.playerByID[id].im.hands);
    for(let i of Manager.playerByID[id].im.head){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }
    socket.emit('head', data);

    data = [];
    for (let i = 0; i < 1; i ++){
        data[i]= [];
        for (let j = 0; j < 1; j ++){
            data[i][j] = 0;
        }
    }
    // console.log(Manager.playerByID[id].im.hands);
    for(let i of Manager.playerByID[id].im.face){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }
    console.log(data);
    socket.emit('face', data);



    data = [];

    Manager.playerByID[id].im.getGround(Manager.playerByID[id]);

    for (let i = 0; i < 12; i ++){
        data[i]= [];
        for (let j = 0; j < 6; j ++){
            data[i][j] = 0;
        }
    }
    // console.log(Manager.playerByID[id].im.hands);
    for(let i of Manager.playerByID[id].im.ground){
        for(let h = i.spot.x; h < i.spot.x + i.height; h ++){
            for(let k = i.spot.y; k < i.spot.y + i.width; k ++){
                let x = i.type;
                if(i.rotated) x += .5;
                data[h][k] = x;
            }
        }
        i.justrotated = false;
    }
    socket.emit('ground', data);
    socket.emit('test', data);
}
function updateAll(): void{
    Manager.spatialMap.clear();
    let i = 0;
    //players
    for(let p of Manager.players){
        let rand = Math.random()*100;
        if(rand < 10){
            p.hunger -= .005;
        }else if(rand < 20){
            p.thirst -= .01;
        }
        p.keyMem = new Array<boolean>(4);
        if(p.Input[0]){
            p.location.y -= playerSpeed;
            p.keyMem[0] = true;
        }
        if(p.Input[1]){
            p.location.x += playerSpeed;
            p.keyMem[1] = true;
        }
        if(p.Input[2]){
            p.location.y += playerSpeed;
            p.keyMem[2] = true;
        }
        if(p.Input[3]){
            p.location.x -= playerSpeed;
            p.keyMem[3] = true;
        }
        if(p.health < 0){
            Manager.playerByID[p.ID] = new player(p.ID);
            Manager.players.splice(i, 1);
        }
        Manager.spatialMap.insert(p);
        i++;
    }
    i = 0;

    //bullets
    for(let b of Manager.bullets){
        b.location.add(b.velocity);
        b.distance += b.speed;
        if(b.distance > 1500 || b.removable == true){
            Manager.bullets.splice(i, 1);

        }else{
            Manager.spatialMap.insert(b);
        }
        i++;
    }
    //bots
    if(Manager.bullets.length > 0) start = true;
    if(Manager.botupdatecount == 0) {
        Manager.botupdatecount = Manager.botupdate;
        for (let b of Manager.bots) {
            b.moveState();
            b.action();
            if (b.health < 0) {
                b.location = new vector(-900, 400);
                b.health = 100;
            }
            Manager.spatialMap.insert(b);
            Manager.spatialMap.insert(b.vis)
        }
    }else Manager.botupdatecount--;
    //collisions
    //console.log(Manager.spatialMap.buckets);
    let count = 0;
    //nonstatic collision
    for(let sector of Manager.spatialMap.buckets){
        for(let object1 of sector){
            for(let object2 of sector) {
                if (object1 != object2) {
                    //count++;
                    if (object1.isColliding(object2) && object1 instanceof bullet) {
                        if (object2 instanceof player || object2 instanceof bot) {
                            object2.health -= 20;
                            object1.removable = true;
                            //console.log("Collision: " + object1 + ", " + object2);
                        }
                    }
                    if(object1.isColliding(object2) && object1 instanceof vision && object2 instanceof  bullet){
                        object1.threat = object2.parent;
                    }
                }
            }
        }
    }
    //static collisions
    for(let i = 0; i < 100; i++){
        for(let staticobject of Manager.spatialMap.savedBuckets[i]){
            for(let object of Manager.spatialMap.buckets[i]){
                count++;
                if(object.isColliding(staticobject)){
                }
            }
        }
    }
    pathfinder.pop();

    //console.log("collision count: " + count);
    //io.sockets.emit('serverTick'
    setTimeout(updateAll, 3);
}
updateAll();
function Itemtick(){
    let sockets = io.sockets.sockets;
    for(let socketId in sockets)
    {
        let socket = sockets[socketId];

        let data: number[] = [];
        for(let i of Manager.groundItems){
            data.push(i.type);
            data.push(i.location.x);
            data.push(i.location.y);
        }
        //sends game data with player as first object in the list
        socket.emit('ItemTick', data);

    }
    setTimeout(Itemtick, 90);
}
Itemtick();
function tick(){
    let sockets = io.sockets.sockets;
    for(let socketId in sockets)
    {
        let socket = sockets[socketId];
        //sends game data with player as first object in the list
        socket.emit('serverTick', buildPlayerPayload(socketId));
    }
    for(let b of Manager.bulletstoSend){
        Manager.bullets.push(b);
    }
    Manager.bulletstoSend = [];
    setTimeout(tick, 30);
}
tick();
function buildMap(){
    //house 1
    new wall(617-1000, 14-1000, 265-1, 20);
    new wall(617-1000, 14-1000, 20, 231-1);
    new wall(617-1000, 225-1000, 83-1, 20);
    new wall(800-1000, 225-1000, 82-1, 20);
    new wall(862-1000, 14-1000, 20, 231-1);
    //house 2
    new wall(918-1000, 14-1000, 187, 20);
    new wall(918-1000, 14-1000, 20, 231-1);
    new wall(918-1000, 225-1000, 61-1, 20);
    new wall(1050-1000, 225-1000, 55, 20);
    new wall(1085-1000, 14-1000, 20, 231-1);
    //house 3
    new wall(1149-1000, 14-1000, 187, 20);
    new wall(1149-1000, 14-1000, 20, 231-1);
    new wall(1149-1000, 225-1000, 55, 20);
    new wall(1270-1000, 225-1000, 66, 20);
    new wall(1316-1000, 14-1000, 20, 231-1);
    //house 4
    new wall(1383-1000, 14-1000, 265, 20);
    new wall(1383-1000, 14-1000, 20, 231-1);
    new wall(1383-1000, 225-1000, 38, 20);
    new wall(1485-1000, 225-1000, 163, 20);
    new wall(1628-1000, 14-1000, 20, 231-1);
    //house 5
    new wall(1695-1000, 14-1000, 265, 20);
    new wall(1695-1000, 14-1000, 20, 231-1);
    new wall(1695-1000, 225-1000, 165, 20);
    new wall(1925-1000, 225-1000, 35, 20);
    new wall(1940-1000, 14-1000, 20, 231-1);

    //mall
    new wall(20-1000, 22-1000, 342, 20);
    new wall(20-1000, 22-1000, 20, 286);
    new wall(40-1000, 288-1000, 32, 20);
    new wall(163-1000, 288-1000, 199, 20);
    new wall(342-1000, 22-1000, 20, 286);
    new wall(163-1000, 288-1000, 20, 80);
    new wall(52-1000, 288-1000, 20, 254);
    new wall(22-1000, 522-1000, 50, 20);
    new wall(163-1000, 522-1000, 201, 20);
    new wall(344-1000, 522-1000, 20, 374);
    new wall(22-1000, 876-1000, 342, 20);
    new wall(22-1000, 522-1000, 20, 374);
    new wall(163-1000, 452-1000, 20, 90)

    let mapRadius = Manager.mapSize/2;
    new wall(-mapRadius+1, mapRadius-1, Manager.mapSize-1, 10);
    new wall(mapRadius-1, -mapRadius+1, 10, Manager.mapSize-1);
    new wall(-mapRadius+1, -mapRadius+1, Manager.mapSize-1, 10);
    new wall(-mapRadius+1, -mapRadius+1, 10, Manager.mapSize-1);

    Manager.bakeGraph();
   /* for(let i = 0; i < 1; i++) {
        let b = new bot( Math.random()*2000 - 1000, Math.random()*2000 - 1000);
        b.hungery = true;
    }*/
    for(let i = 0; i < 20; i++){
        let b = new bot( 600, -150 + i*100);
    }
    let test = new gunAuto(new vector(100,100));
    let test1 = new gunSemi(new vector(100,200));
    let test2 = new policeVest(new vector(100,300));
    let test3 = new mask(new vector(100,400));
    let s = new destination(new vector(600, -150), "store");

}
buildMap();
