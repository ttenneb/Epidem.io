// @ts-ignore
import * as PIXI from "../web_modules/pixi.js-legacy.js";
import {Connect, playerData} from "../dist/Networking.js";
import {update} from "../dist/Networking.js";
import {Manager, Player, staticObject, item, vector, playerinventory} from "../dist/Entities.js";
import {getItems} from "../dist/Networking.js";
import {getType} from "../dist/Items.js";

//gameobject class

//setup screen on document
export let screenWidth: number = window.innerWidth;
export let screenHeight: number = window.innerHeight;
export let mouseX: number;
export let mouseY: number;
export let rotation: number = 0;
function setUp(){
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    app.renderer.backgroundColor = 0x0db53a;
    app.renderer.resize(screenWidth, screenHeight);
    let Maptexture = new PIXI.Texture.from("../dist/MapPointTest.png");
    let Inventorytexture = new PIXI.Texture.from("../dist/Inventory.png");
    let NearBytexture = new PIXI.Texture.from("../dist/ItemGrid.png");
    let map: PIXI.Sprite = new PIXI.Sprite(Maptexture);
    inv = new PIXI.Sprite(Inventorytexture);
    env = new PIXI.Sprite(NearBytexture);
    //inv.zIndex = 100;
    inv.anchor.set(.5);
    inv.scale.set(1/3, 1/3);
    env.scale.set(1/3,1/3);
    env.anchor.set(-1.5, .5);
    //console.log(env.position);
    map.x = -1000;
    map.y = -1000;
    stage.addChild(map);
    stage.addChild(inventory);
    //Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(app.view);
    document.body.style.cursor = "crosshair";
    document.onmousemove = function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
        if(selected != null && im!=null){
            let relmouseLocation: vector = new vector((Player.location.x - screenWidth/2 + mouseX),(mouseY + Player.location.y - screenHeight/2));
            let pivot = new vector(im.containers[selected.container].startx, im.containers[selected.container].starty);
            relmouseLocation.sub(pivot);
            relmouseLocation.sub(new vector(50/3,50/3));
            selected.inMotion = relmouseLocation;
        }
    }
}

//creates main PIXI object
let app = new PIXI.Application({
        antialias: true,    // default: false
        transparent: false, // default: false
        resolution: 1       // default: 1
    });
let inv: PIXI.Sprite;
let env: PIXI.Sprite;
let inventory: PIXI.Graphics = new PIXI.Graphics();
export let stage: PIXI.Container = new PIXI.Container();

export let inventoryOpen: boolean = false;
export let selectedRoatated: boolean = false;
setUp();

//game client variables
const speed: number = 5;
const tickrate: number = 30;
export let Keys: Array<boolean> = [false, false, false, false];
Connect();
//keyboard handling
function onUp(){

}
function onDown(){

}
function onLeft() {

}
function onRight() {

}
function KeyDown(event: KeyboardEvent) {
    // PRESS LEFT ARROW
    if(!inventoryOpen){
        if (event.code == "KeyA" || event.code == "ArrowLeft") {
            Keys[3] = true;
        }
        // PRESS UP ARROW
        if (event.code == "KeyW" || event.code == "ArrowUp") {
            Keys[0] = true;
        }
        // PRESS RIGHT ARROW
        if (event.code == "KeyD" || event.code == "ArrowRight") {
            Keys[1] = true;
        }
        // PRESS DOWN ARROW
        if (event.code == "KeyS" || event.code == "ArrowDown") {
            Keys[2] = true;
        }
    }
    if (event.code == "KeyE") {
        if(inventoryOpen == false) {
            getItems();
            inventory.addChild(inv);
            inventory.addChild(env);
            inventoryOpen = true;
            Keys[0] = false;
            Keys[1] = false;
            Keys[2] = false;
            Keys[3] = false;
        }
        else if(inventoryOpen == true) {
            inventoryOpen = false;
            if(selected != null){
                selected.inMotion = null;
                selected = null;
            }
            inventory.removeChildAt(1);
            inventory.removeChildAt(0);
        }
    }
    if(event.code == "KeyR" && selected != null){
        selected.rotate();
        selected.rotated = !selected.rotated;
    }
}
function KeyUp(event: KeyboardEvent) {
    // PRESS LEFT ARROW
    if (event.code == "KeyA") {
        Keys[3] = false;
    }
    // PRESS UP ARROW
    if (event.code == "KeyW") {
        Keys[0] = false;
    }
    // PRESS RIGHT ARROW
    if (event.code == "KeyD") {
        Keys[1] = false;
    }
    // PRESS DOWN ARROW
    if (event.code == "KeyS") {
        Keys[2] = false;
    }
}

function tick() {
    if(!inventoryOpen) {
        if (Keys[0]) {
            onUp();
        }
        if (Keys[1]) {
            onRight();
        }
        if (Keys[2]) {
            onDown();
        }
        if (Keys[3]) {
            onLeft();
        }
        let angle = Math.atan2(mouseY - screenHeight / 2, mouseX - screenWidth / 2);
        angle = angle * (180 / Math.PI);
        if (angle < 0) angle += 360;
        rotation = angle + 90;
    }
    update();
    Manager.update(playerData);
    for(let b of Manager.bullets){
        for(let object of Manager.staticObjects){
            if(b.isColliding(object)){
            }
        }
    }

    setTimeout(tick, tickrate);
}
tick();
let g: PIXI.Graphics = new PIXI.Graphics();
export let im = new playerinventory(stage);
function animate() {
    stage.pivot.x = (Player.location.x - screenWidth/2);
    stage.pivot.y = (Player.location.y - screenHeight/2);
    //  console.log(stage.children.length);
    Manager.draw(stage);
    if(inventoryOpen){
        inventory.pivot.x = -(Player.location.x);
        inventory.pivot.y = -(Player.location.y);
        stage.removeChild(inventory);
        stage.addChild(inventory);
    }
    if(im != undefined){
        if(inventoryOpen){
            im.draw(stage);
        }else{
            im.clear();
        }

    }
    app.renderer.render(stage);
    requestAnimationFrame(animate);
}
animate();
//listeners
let pickup: vector;
let drop: vector;
let selected: item;
document.addEventListener('mousedown', () => {
    if(inventoryOpen == false) {
        Player.shot = 1;
    }else {
        pickup = new vector((mouseX-screenWidth / 2 ), (mouseY-screenHeight / 2));
        selected = im.select(pickup);
       // console.log(selected);
    }

});
document.addEventListener('mouseup', () => {
    if (inventoryOpen == true && selected != null) {
        drop = new vector((mouseX-screenWidth / 2 ), (mouseY-screenHeight / 2));
        im.drop(drop);
        selected.rotated = false;
        selected.inMotion = null;
        selected = null;
    }else if(inventoryOpen == false){
        Player.shot = -1;
    }
});
function buildMap(){
    let mapSize = 2000;
    let mapRadius = mapSize/2;
    new staticObject(-mapRadius, mapRadius,  mapSize, 10);
    new staticObject(mapRadius, -mapRadius, 10, mapSize);
    new staticObject(-mapRadius, -mapRadius, mapSize, 10);
    new staticObject(-mapRadius, -mapRadius, 10, mapSize);

}
buildMap();

export function getItem(type: number): item{
    return getType(type);
}

document.addEventListener('keydown', KeyDown);
document.addEventListener('keyup', KeyUp);

//helper functions


