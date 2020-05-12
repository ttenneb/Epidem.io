var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// @ts-ignore
import * as PIXI from "../web_modules/pixi.js-legacy.js";
import { screenWidth, screenHeight, rotation, stage, getItem } from "../dist/index.js";
import { moveItem, rotateItem } from "../dist/Networking.js";
//import {getType} from "../dist/Items.js";
var vector = /** @class */ (function () {
    function vector(x, y, copy) {
        this.x = x;
        this.y = y;
        if (copy != undefined) {
            this.x = copy.x;
            this.y = copy.y;
        }
    }
    vector.prototype.add = function (a) {
        this.x += a.x;
        this.y += a.y;
    };
    vector.prototype.sub = function (a) {
        this.x -= a.x;
        this.y -= a.y;
    };
    vector.prototype.mult = function (a) {
        this.x *= a;
        this.y *= a;
    };
    vector.prototype.div = function (a) {
        this.x /= a;
        this.y /= a;
    };
    vector.prototype.norm = function () {
        var mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.div(mag);
    };
    return vector;
}());
export { vector };
var entityManager = /** @class */ (function () {
    function entityManager() {
        this.gameObjects = [];
        this.bullets = [];
        this.staticObjects = [];
        this.groundItems = [];
    }
    entityManager.prototype.update = function (playerData) {
        for (var _i = 0, _a = this.gameObjects; _i < _a.length; _i++) {
            var p = _a[_i];
            p.clear();
            stage.removeChild(p.image);
        }
        this.gameObjects = [];
        var i = 1;
        //TODO streamline and optimize player data format
        Player = new player(playerData[i], playerData[i + 1], playerData[i + 2], getItem(playerData[i + 3]), playerData[i + 4], playerData[i + 5]);
        this.gameObjects.push(Player);
        i += 6;
        var breakpoint = playerData[i];
        if (playerData.length > 0) {
            while (breakpoint != -1) {
                var p = new character(playerData[i + 1], playerData[i + 2], playerData[i + 3], getItem(playerData[i + 4]));
                this.gameObjects.push(p);
                i += 5;
                breakpoint = playerData[i];
            }
            i++;
            while (i < playerData.length) {
                //console.log("guh" + playerData[i + 1]);
                //console.log(playerData[i], playerData[i+1]);
                new bullet(playerData[i], playerData[i + 1], playerData[i + 2]);
                i += 4;
            }
        }
    };
    entityManager.prototype.draw = function () {
        for (var _i = 0, _a = this.groundItems; _i < _a.length; _i++) {
            var i_1 = _a[_i];
            i_1.drawGround();
        }
        for (var _b = 0, _c = this.gameObjects; _b < _c.length; _b++) {
            var o = _c[_b];
            o.draw();
        }
        var i = 0;
        //tODO dont like this it might be slow
        while (i < this.bullets.length) {
            var b = this.bullets[i];
            b.draw();
            if (b.alpha < 0) {
                b.clear();
                stage.removeChild(b.image);
                this.bullets.splice(i, 1);
            }
            else {
                i++;
            }
        }
        for (var _d = 0, _e = this.staticObjects; _d < _e.length; _d++) {
            var o = _e[_d];
            o.draw();
        }
    };
    return entityManager;
}());
export var Manager = new entityManager();
export var Player;
var gameObject = /** @class */ (function () {
    function gameObject(x, y, r) {
        this.drawn = true;
        this.anchored = false;
        this.rotation = 0;
        this.location = new vector(x, y);
        this.image = new PIXI.Graphics();
        this.rotation = r;
        stage.addChild(this.image);
    }
    gameObject.prototype.draw = function () {
        this.clear();
        this.image.zIndex = 50;
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        this.image.rotation = this.rotation * (Math.PI / 180);
    };
    gameObject.prototype.clear = function () {
        this.image.clear();
    };
    return gameObject;
}());
export { gameObject };
var hitBox = /** @class */ (function () {
    function hitBox(width, length) {
        this.points = new Array();
        this.points.push(new vector(length, width));
        this.points.push(new vector(0, width));
        this.points.push(new vector(length, 0));
        this.points.push(new vector(0, 0));
        this.length = length;
        this.width = width;
    }
    return hitBox;
}());
export { hitBox };
var staticObject = /** @class */ (function (_super) {
    __extends(staticObject, _super);
    function staticObject(x, y, l, w) {
        var _this = _super.call(this, x, y, 0) || this;
        _this.length = l;
        _this.width = w;
        _this.hitbox = new hitBox(w, l);
        Manager.staticObjects.push(_this);
        return _this;
    }
    staticObject.prototype.draw = function () {
        this.clear();
        this.image.beginFill(0x964b00);
        this.image.drawRect(this.location.x, this.location.y, this.length, this.width);
        this.image.endFill();
    };
    return staticObject;
}(gameObject));
export { staticObject };
var character = /** @class */ (function (_super) {
    __extends(character, _super);
    function character(x, y, r, it) {
        var _this = _super.call(this, x, y, r) || this;
        _this.inHand = new item(null);
        _this.inHand = it;
        return _this;
    }
    character.prototype.draw = function () {
        this.clear();
        this.image.beginFill(0x9b59b6);
        this.image.drawCircle(0, 0, 20);
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        if (this.inHand != null && this.inHand != undefined)
            this.inHand.draw(this.image);
        this.image.rotation = this.rotation * (Math.PI / 180);
        this.image.endFill();
    };
    character.prototype.clear = function () {
        this.image.clear();
    };
    return character;
}(gameObject));
export { character };
var player = /** @class */ (function (_super) {
    __extends(player, _super);
    function player(x, y, health, it, hunger, thirst) {
        var _this = _super.call(this, x, y, 0, it) || this;
        //console.log(x + ", " + y);
        _this.rotation = rotation;
        //console.log(this.rotation);
        _this.health = new healthBar(health, 0xff0000, 0);
        _this.hunger = new healthBar(hunger, 0x008b00, 15);
        _this.thirst = new healthBar(thirst, 0x0000ff, 30);
        _this.armor = new healthBar(100, 0x808080, 45);
        _this.shot = 0;
        return _this;
    }
    player.prototype.draw = function () {
        _super.prototype.draw.call(this);
        this.health.draw();
        this.armor.draw();
        this.thirst.draw();
        this.hunger.draw();
        this.image.beginFill(0x9b59b6);
        this.image.endFill();
    };
    player.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this.health.clear();
    };
    player.prototype.useHand = function () {
        if (this.inHand == null) {
        }
        else {
            this.inHand.use();
        }
    };
    return player;
}(character));
export { player };
var healthBar = /** @class */ (function (_super) {
    __extends(healthBar, _super);
    function healthBar(health, color, height) {
        var _this = _super.call(this, 0, 0, 0) || this;
        _this.health = health;
        _this.color = color;
        _this.height = height;
        Manager.gameObjects.push(_this);
        return _this;
    }
    healthBar.prototype.draw = function () {
        this.image.beginFill(this.color);
        this.image.drawRect(Player.location.x - (screenWidth / 2), Player.location.y - screenHeight / 2 + this.height, this.health * 2, 15);
        this.image.endFill();
    };
    return healthBar;
}(gameObject));
var bullet = /** @class */ (function (_super) {
    __extends(bullet, _super);
    function bullet(x, y, r, id) {
        var _this = _super.call(this, x, y, r) || this;
        _this.length = 0;
        _this.alpha = .7;
        _this.drawCount = 0;
        _this.speed = 35;
        var radians = (_this.rotation - 90) * (Math.PI / 180);
        _this.image.rotation = r * (Math.PI / 180);
        _this.velocity = new vector(Math.cos(radians), Math.sin(radians));
        _this.velocity.norm();
        _this.velocity.mult(_this.speed);
        var startoffset = new vector(0, 0, _this.velocity);
        startoffset.div(2);
        _this.location.sub(startoffset);
        //console.log(this.location);
        //console.log("-----")
        Manager.bullets.push(_this);
        _this.hitbox = new hitBox(5, 5);
        return _this;
    }
    bullet.prototype.draw = function () {
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
    };
    bullet.prototype.isColliding = function (object) {
        var rect1 = new Array();
        for (var i = 0; i < this.hitbox.points.length; i++) {
            rect1[i] = new vector(0, 0, this.hitbox.points[i]);
            rect1[i].add(this.location);
        }
        var rect2 = new Array();
        for (var i = 0; i < object.hitbox.points.length; i++) {
            rect2[i] = new vector(0, 0, object.hitbox.points[i]);
            rect2[i].add(object.location);
        }
        if (rect1[3].x < rect2[2].x &&
            rect1[2].x > rect2[3].x &&
            rect1[3].y < rect2[0].y &&
            rect1[0].y > rect2[3].y) {
            this.alpha = 0;
            return true;
        }
        return false;
    };
    return bullet;
}(gameObject));
export { bullet };
var item = /** @class */ (function () {
    function item(texture) {
        this.rotated = false;
        if (texture != null) {
            this.sprite = new PIXI.Sprite(texture);
            this.sprite.scale.set(1 / 3);
            this.sprite.zIndex = 101;
            this.image = new PIXI.Sprite(texture);
            this.image.scale.set(1 / 4);
        }
        this.inMotion = null;
    }
    item.prototype.use = function () {
        return 0;
    };
    item.prototype.draw = function (image) {
        image.beginFill(0x000000);
        image.drawCircle(-15, -20, 8);
        image.drawCircle(+15, -20, 8);
        image.beginFill(0x9b59b6);
        image.drawCircle(-15, -20, 7);
        image.drawCircle(+15, -20, 7);
    };
    item.prototype.drawGround = function () {
        this.clearGround();
        this.image.position.x = this.location.x;
        this.image.position.y = this.location.y;
        stage.addChild(this.image);
    };
    item.prototype.clearGround = function () {
        stage.removeChild(this.image);
    };
    item.prototype.toInventory = function () {
        //TODO request over network first
        stage.addChild(this.sprite);
        stage.removeChild(this.image);
    };
    item.prototype.toGround = function () {
        //TODO push to server
        stage.removeChild(this.sprite);
        stage.addChild(this.image);
        this.container = 1;
        //TODO remove this
        Manager.groundItems.push(this);
    };
    item.prototype.rotate = function () {
        var mem = this.width;
        this.width = this.height;
        this.height = mem;
        if (this.sprite.rotation == 0)
            this.sprite.rotation = Math.PI / 2;
        else
            this.sprite.rotation = 0;
        rotateItem(this);
    };
    return item;
}());
export { item };
var itemManager = /** @class */ (function () {
    function itemManager(width, height, wlimit, startx, starty) {
        this.matrix = [];
        //TODO change for ui ratio
        this.startx = 119 / 3;
        this.starty = -373 / 3;
        for (var i = 0; i < width; i++) {
            this.matrix[i] = [];
            for (var j = 0; j < height; j++) {
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
    itemManager.prototype.add = function (it) {
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                if (this.checkSpot(it, i, j)) {
                    //console.log(i + ", " + j);
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            this.matrix[h][k] = 1;
                        }
                    }
                    //TODo change for ui ratio resize
                    this.items.push(it);
                    it.spot = new vector(j * (-115 / 3), i * (-115 / 3));
                    return;
                }
            }
        }
    };
    itemManager.prototype.remove = function (it) {
        if (it.spot != undefined) {
            var spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
            spot = new vector(Math.trunc(spot.x + .5), Math.trunc(spot.y + .5));
            if (it.rotated == true) {
                for (var h = spot.x; h < spot.x + it.width; h++) {
                    for (var k = spot.y; k < spot.y + it.height; k++) {
                        this.matrix[h][k] = 0;
                    }
                }
            }
            else {
                for (var h = spot.x; h < spot.x + it.height; h++) {
                    for (var k = spot.y; k < spot.y + it.width; k++) {
                        this.matrix[h][k] = 0;
                    }
                }
            }
            var element = this.items.indexOf(it);
            this.items.splice(element, 1);
        }
    };
    itemManager.prototype.insert = function (it, point) {
        if (this.checkSpot(it, point.x, point.y)) {
            for (var h = point.x; h < point.x + it.height; h++) {
                for (var k = point.y; k < point.y + it.width; k++) {
                    this.matrix[h][k] = 1;
                }
            }
            this.items.push(it);
            it.spot = new vector(point.y * -115 / 3, point.x * -115 / 3);
            return true;
        }
        else {
            return false;
        }
    };
    itemManager.prototype.draw = function () {
        stage.removeChild(this.image);
        this.clear();
        //TODO might be causing some issues with memory leak
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var i = _a[_i];
            if (i.inMotion == null) {
                i.sprite.position.x = Player.location.x - i.spot.x;
                i.sprite.position.y = Player.location.y - i.spot.y;
            }
            else {
                i.sprite.position.x = i.inMotion.x;
                i.sprite.position.y = i.inMotion.y;
            }
            if (i.sprite.rotation != 0)
                i.sprite.position.x += (115 / 3) * i.width;
            if (i != undefined && i.sprite != undefined && this.image != undefined)
                this.image.addChild(i.sprite);
        }
        stage.addChild(this.image);
    };
    itemManager.prototype.clear = function () {
        for (var i = this.image.children.length - 1; i >= 0; i--) {
            this.image.removeChildAt(i);
        }
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var i = _a[_i];
            stage.removeChild(i.image);
            stage.removeChild(i.sprite);
        }
        stage.removeChild(this.image);
    };
    itemManager.prototype.checkSpot = function (it, x, y) {
        if (x >= 0 && x < this.matrix.length && y >= 0 && y < this.matrix[x].length && this.matrix[x][y] == 0) {
            for (var h = x; h < x + it.height; h++) {
                for (var k = y; k < y + it.width; k++) {
                    if (h >= this.matrix.length || k >= this.matrix[h].length || this.matrix[h][k] != 0) {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    };
    itemManager.prototype.getPoint = function (location) {
        var x = location.x - this.startx;
        var y = location.y - this.starty;
        //console.log(x + ", " + y);
        var point = new vector(Math.trunc((y) / (115 / 3)), Math.trunc((x) / (115 / 3)));
        //TODO could have issues with none square inventories, x and y might be mixed up
        //TODO this must be changed bc it might have issues with non rectangular inventories
        if (point.x >= 0 && point.y >= 0 && point.x <= this.matrix.length && point.y <= this.matrix[0].length) {
            return point;
        }
        else {
            return new vector(-1, -1);
        }
    };
    itemManager.prototype.getItem = function (point) {
        //console.log(point);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var it = _a[_i];
            var spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
            //console.log(spot);
            if (point.x >= spot.x && point.x < spot.x + it.height
                && point.y >= spot.y && point.y < spot.y + it.width) {
                return it;
            }
        }
        return null;
    };
    return itemManager;
}());
export { itemManager };
var playerinventory = /** @class */ (function () {
    function playerinventory(stage) {
        this.containers = [];
        //TODO width and height are flip flopped
        this.inv = new itemManager(6, 6, 100, 119 / 3, -373 / 3);
        this.grd = new itemManager(12, 6, 100, 357, -373 / 3 - 102);
        this.hnd = new itemManager(4, 2, 100, -846 / 3, -229 / 3);
        this.cht = new itemManager(2, 2, 100, (-846 + 260) / 3, (-229 + 37) / 3);
        this.bck = new itemManager(2, 2, 100, (-846 + 524) / 3, (-229 + 37) / 3);
        this.hed = new itemManager(1, 1, 100, (-846 + 315) / 3, (-229 - 109) / 3);
        this.fce = new itemManager(1, 1, 100, (-846 + 466) / 3, (-229 - 109) / 3);
        this.containers.push(this.inv);
        this.containers.push(this.grd);
        this.containers.push(this.hnd);
        this.containers.push(this.cht);
        this.containers.push(this.bck);
        this.containers.push(this.hed);
        this.containers.push(this.fce);
    }
    playerinventory.prototype.draw = function (stage) {
        this.inv.draw();
        this.hnd.draw();
        this.grd.draw();
        this.cht.draw();
        this.bck.draw();
        this.hed.draw();
        this.fce.draw();
    };
    playerinventory.prototype.clear = function () {
        this.inv.clear();
        this.hnd.clear();
        this.grd.clear();
        this.cht.clear();
        this.bck.clear();
        this.hed.clear();
        this.fce.clear();
    };
    playerinventory.prototype.add = function (it, num) {
        if (this.containers[num] != undefined) {
            this.containers[num].add(it);
            it.container = num;
        }
    };
    playerinventory.prototype.remove = function (it, num) {
        if (this.containers[num] != undefined) {
            this.containers[num].remove(it);
            it.container = -1;
        }
    };
    playerinventory.prototype.getContainer = function (location) {
        var count = 0;
        for (var _i = 0, _a = this.containers; _i < _a.length; _i++) {
            var c = _a[_i];
            if (location.x > c.startx && location.x < c.startx + c.matrix[0].length * (115 / 3)
                && location.y > c.starty && location.y < c.starty + c.matrix.length * (115 / 3)) {
                console.log(c.startx + c.matrix[0].length * (115 / 3) + ", " + count);
                return count;
            }
            count++;
        }
        return -1;
    };
    playerinventory.prototype.select = function (location) {
        var container = this.getContainer(location);
        if (container != -1) {
            var point = this.containers[container].getPoint(location);
            if (point.x != -1 && point.y != -1) {
                var it = this.containers[container].getItem(point);
                if (it != null) {
                    this.selected = it;
                    //console.log(it);
                    return it;
                }
            }
        }
        return null;
    };
    playerinventory.prototype.drop = function (location) {
        var container = this.getContainer(location);
        if (this.selected != null) {
            var point = this.containers[container].getPoint(location);
            if (point.x != -1 && point.y != -1) {
                moveItem(this.selected, point, container, this.selected.rotated);
            }
        }
        this.selected.rotated = false;
        this.selected.inMotion = null;
        this.selected = null;
    };
    playerinventory.prototype.clearData = function () {
        this.clear();
        this.inv = new itemManager(6, 6, 100, 119 / 3, -373 / 3);
        this.grd = new itemManager(12, 6, 100, 357, -373 / 3 - 102);
        this.hnd = new itemManager(4, 2, 100, -846 / 3, -229 / 3);
        this.cht = new itemManager(2, 2, 100, (-846 + 260) / 3, (-229 + 37) / 3);
        this.bck = new itemManager(2, 2, 100, (-846 + 524) / 3, (-229 + 37) / 3);
        this.hed = new itemManager(1, 1, 100, (-846 + 315) / 3, (-229 - 109) / 3);
        this.fce = new itemManager(1, 1, 100, (-846 + 466) / 3, (-229 - 109) / 3);
        this.containers = [];
        this.containers.push(this.inv);
        this.containers.push(this.grd);
        this.containers.push(this.hnd);
        this.containers.push(this.cht);
        this.containers.push(this.bck);
        this.containers.push(this.hed);
        this.containers.push(this.fce);
    };
    return playerinventory;
}());
export { playerinventory };
//# sourceMappingURL=Entities.js.map