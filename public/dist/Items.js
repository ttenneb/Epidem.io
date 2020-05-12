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
import * as PIXI from "../web_modules/pixi.js-legacy.js";
import { item, vector } from "../dist/Entities.js";
export function getType(type) {
    switch (type) {
        case 0: {
            return new item(null);
            break;
        }
        case 1: {
            return new assualt();
            break;
        }
        case 2: {
            return new pistol();
            break;
        }
        case 3: {
            return new policeVest();
            break;
        }
        case 4: {
            return new mask();
            break;
        }
    }
    return null;
}
var Assualt = PIXI.Texture.from("../dist/Assualt.png");
var Pistol = PIXI.Texture.from("../dist/Pistol.png");
var PoliceVest = new PIXI.Texture.from("../dist/policeVest.png");
var Mask = new PIXI.Texture.from("../dist/mask.png");
var gun = /** @class */ (function (_super) {
    __extends(gun, _super);
    function gun(texture, width, height, location) {
        var _this = _super.call(this, texture) || this;
        _this.width = width;
        _this.height = height;
        if (location != undefined) {
            _this.location = new vector(0, 0, location);
        }
        return _this;
    }
    gun.prototype.use = function () {
        return 1;
    };
    gun.prototype.draw = function (image) {
    };
    return gun;
}(item));
var assualt = /** @class */ (function (_super) {
    __extends(assualt, _super);
    function assualt() {
        return _super.call(this, Assualt, 4, 2) || this;
    }
    assualt.prototype.draw = function (image) {
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
    };
    return assualt;
}(gun));
var pistol = /** @class */ (function (_super) {
    __extends(pistol, _super);
    function pistol() {
        return _super.call(this, Pistol, 2, 1) || this;
    }
    pistol.prototype.draw = function (image) {
        image.beginFill(0x000000);
        image.drawCircle(-0, -20, 8);
        image.endFill();
        image.beginFill(0x9b59b6);
        image.drawCircle(-0, -20, 7);
        image.endFill();
        image.beginFill(0x000000);
        image.drawRect(-3, -21, 6, -20);
        image.endFill();
    };
    return pistol;
}(gun));
var policeVest = /** @class */ (function (_super) {
    __extends(policeVest, _super);
    function policeVest() {
        var _this = _super.call(this, PoliceVest) || this;
        _this.height = 2;
        _this.width = 2;
        return _this;
    }
    policeVest.prototype.draw = function (image) {
    };
    return policeVest;
}(item));
var mask = /** @class */ (function (_super) {
    __extends(mask, _super);
    function mask() {
        var _this = _super.call(this, Mask) || this;
        _this.height = 1;
        _this.width = 1;
        return _this;
    }
    mask.prototype.draw = function (image) {
    };
    return mask;
}(item));
//# sourceMappingURL=Items.js.map