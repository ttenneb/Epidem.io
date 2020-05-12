import socket from "../web_modules/socket.io-client.js";
import { vector, Player, Manager } from "../dist/Entities.js";
import { im, Keys, stage } from "../dist/index.js";
import { getType } from "../dist/Items.js";
export var playerData = [];
var io;
var ID;
export function Connect() {
    io = socket("173.54.214.211:5001");
    io.on('serverTick', function (data) {
        playerData = data;
        // console.log(playerData);
    });
    io.on('ItemTick', function (data) {
        for (var _i = 0, _a = Manager.groundItems; _i < _a.length; _i++) {
            var i_1 = _a[_i];
            stage.removeChild(i_1.image);
        }
        Manager.groundItems = [];
        var i = 0;
        while (i < data.length) {
            var it = getType(data[i]);
            it.location = new vector(data[i + 1], data[i + 2]);
            i += 3;
            it.toGround();
            Manager.groundItems.push(it);
        }
    });
    io.on('connectionCall', function (id) {
        ID = id;
        console.log(ID);
    });
}
export function update() {
    var data = new Array();
    data.push(Keys[0] ? 1 : 0);
    data.push(Keys[1] ? 1 : 0);
    data.push(Keys[2] ? 1 : 0);
    data.push(Keys[3] ? 1 : 0);
    if (Player != null) {
        data.push(Player.rotation);
    }
    else {
        data.push(0);
    }
    if (Player != null) {
        data.push(Player.shot);
    }
    io.emit('update', data);
}
export function getItems() {
    io.emit('getItems');
    im.clearData();
    io.on('items', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 0;
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    im.inv.insert(it, new vector(i, j));
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    //io.on('test', (data: any) => {console.log(data);});
    io.on('hands', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 2;
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    im.hnd.insert(it, new vector(i, j));
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('ground', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    //create item
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 1;
                    //rotate or no?
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.grd.insert(it, new vector(i, j));
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('chest', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    //create item
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 3;
                    //rotate or no?
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.cht.insert(it, new vector(i, j));
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('back', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    //create item
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 4;
                    //rotate or no?
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.bck.insert(it, new vector(i, j));
                    console.log(im.bck.matrix);
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('head', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    //create item
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 5;
                    //rotate or no?
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    //add and remove remenents of data
                    im.hed.insert(it, new vector(i, j));
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
    io.on('face', function (data) {
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].length; j++) {
                if (data[i][j] != 0) {
                    //create item
                    var it = getType(Math.trunc(data[i][j]));
                    it.container = 6;
                    //rotate or no?
                    if (data[i][j] % 1 == .5) {
                        var mem = it.height;
                        it.height = it.width;
                        it.width = mem;
                        if (it.sprite.rotation == 0)
                            it.sprite.rotation = Math.PI / 2;
                        else
                            it.sprite.rotation = 0;
                    }
                    console.log(data);
                    im.fce.insert(it, new vector(i, j));
                    for (var h = i; h < i + it.height; h++) {
                        for (var k = j; k < j + it.width; k++) {
                            data[h][k] = 0;
                        }
                    }
                }
            }
        }
    });
}
export function rotateItem(it) {
    var spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
    spot = new vector(Math.trunc(spot.x + .5), Math.trunc(spot.y + .5));
    var data = [];
    data.push(spot.x);
    data.push(spot.y);
    data.push(it.container);
    io.emit('rotateItem', data);
}
export function moveItem(it, point, container, r) {
    var data = [];
    var spot = new vector((it.spot.y / (-115 / 3)), (it.spot.x / (-115 / 3)));
    spot = new vector(Math.trunc(spot.x + .5), Math.trunc(spot.y + .5));
    data.push(spot.x);
    data.push(spot.y);
    data.push(point.x);
    data.push(point.y);
    if (r == true)
        data.push(1);
    if (r == false)
        data.push(0);
    //console.log(container);
    data.push(it.container);
    data.push(container);
    im.clearData();
    io.emit('moveItem', data);
}
function printtest() {
    console.log("Connected to server, YAY!");
}
//# sourceMappingURL=Networking.js.map