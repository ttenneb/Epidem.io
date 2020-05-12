// @ts-ignore
import * as PIXI from "../web_modules/pixi.js-legacy.js";
import socket from "../web_modules/socket.io-client.js"
import {vector, Player, Manager, item} from "../dist/Entities.js";
import {im, Keys, stage} from "../dist/index.js";
import {getType} from "../dist/Items.js";

export let playerData: Array<number> = [];
let io: socket;
let ID: string;
export function Connect() {
    io = socket(`173.54.214.211:5001`);
    io.on('serverTick', (data: Array<number>) => {
        playerData = data;
       // console.log(playerData);
    });
    io.on('ItemTick', (data: number[]) =>{
        for(let i of Manager.groundItems){
            stage.removeChild(i.image);
        }
        Manager.groundItems = [];
        let i = 0;
        while(i < data.length){
            let it = getType(data[i])
            it.location = new vector(data[i+1], data[i+2]);
            i+=3;
            it.toGround();
            Manager.groundItems.push(it);
        }
    });
    io.on('connectionCall', (id: string) =>{
        ID = id;
        console.log(ID);
    })
}
export function update(): void{
    const data: Array<number> = new Array<number>();
    data.push(Keys[0] ? 1 : 0);
    data.push(Keys[1] ? 1 : 0);
    data.push(Keys[2] ? 1 : 0);
    data.push(Keys[3] ? 1 : 0);
    if(Player != null) {
        data.push(Player.rotation);
    } else {
        data.push(0);
    }
    if(Player != null){
        data.push(Player.shot);
    }
    io.emit('update', data);
}
export function getItems(){
    io.emit('getItems');
    im.clearData();
    io.on('items', (data: number[][]) =>{
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 0;
                    if(data[i][j] % 1 == .5){
                       let mem = it.height;
                       it.height = it.width;
                       it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    im.inv.insert(it , new vector(i,j));
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    //io.on('test', (data: any) => {console.log(data);});
    io.on('hands', (data: number[][]) => {
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 2;
                    if(data[i][j] % 1 == .5){
                        let mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    im.hnd.insert(it , new vector(i,j));
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('ground',  (data: number[][]) =>{
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    //create item
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 1;
                    //rotate or no?
                    if(data[i][j] % 1 == .5){
                        let mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.grd.insert(it , new vector(i,j));
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('chest',  (data: number[][]) =>{
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    //create item
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 3;
                    //rotate or no?
                    if(data[i][j] % 1 == .5){
                        let mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.cht.insert(it , new vector(i,j));
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('back',  (data: number[][]) =>{
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    //create item
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 4;
                    //rotate or no?
                    if(data[i][j] % 1 == .5){
                        let mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.bck.insert(it , new vector(i,j));
                    console.log(im.bck.matrix);
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('head',  (data: number[][]) =>{
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    //create item
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 5;
                    //rotate or no?
                    if(data[i][j] % 1 == .5){
                        let mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.hed.insert(it , new vector(i,j));
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('face',  (data: number[][]) =>{
        for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].length; j++){
                if(data[i][j] != 0){
                    //create item
                    let it = getType(Math.trunc(data[i][j]));
                    it.container = 6;
                    //rotate or no?
                    if(data[i][j] % 1 == .5){
                        let mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if(it.sprite.rotation == 0)it.sprite.rotation = Math.PI/2;
                        else it.sprite.rotation = 0;
                    }
                    console.log(data);
                    im.fce.insert(it , new vector(i,j));
                    for(let h = i; h < i + it.height; h++) {
                        for (let k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
}
export function rotateItem(it: item){
    let spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
    spot = new vector(Math.trunc(spot.x + .5), Math.trunc(spot.y + .5));
    let data: number[] = [];
    data.push(spot.x);
    data.push(spot.y);
    data.push(it.container);
    io.emit('rotateItem', data);
}
export function moveItem(it: item, point: vector, container: number, r: boolean){
    let data: number[] = [];
    let spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
    spot = new vector(Math.trunc(spot.x + .5), Math.trunc(spot.y + .5));
    data.push(spot.x);
    data.push(spot.y);
    data.push(point.x);
    data.push(point.y);
    if(r == true) data.push(1);
    if(r == false) data.push(0);
    //console.log(container);
    data.push(it.container);
    data.push(container);
    im.clearData();
    io.emit('moveItem', data);
}
function printtest():void {
    console.log("Connected to server, YAY!")
}