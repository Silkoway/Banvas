"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Canvas_instances, _Canvas_initruns, _Canvas_ctx, _Canvas_setPixel;
const VERSION = 'v0.0.0';
/**
 * Convert absolute CSS numerical values to pixels.
 *
 * @link https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#numbers_lengths_and_percentages
 *
 * @param {string} cssValue
 * @param {null|HTMLElement} target Used for relative units.
 * @return {*}
 */
const convertCssUnit = function (cssValue, target) {
    target = target || document.body;
    const supportedUnits = {
        // Absolute sizes
        'px': (value) => value,
        'cm': (value) => value * 38,
        'mm': (value) => value * 3.8,
        'q': (value) => value * 0.95,
        'in': (value) => value * 96,
        'pc': (value) => value * 16,
        'pt': (value) => value * 1.333333,
        // Relative sizes
        'rem': (value) => value * parseFloat(getComputedStyle(document.documentElement).fontSize),
        'em': (value) => value * parseFloat(getComputedStyle(target).fontSize),
        'vw': (value) => value / 100 * window.innerWidth,
        'vh': (value) => value / 100 * window.innerHeight,
        // Times
        'ms': (value) => value,
        's': (value) => value * 1000,
        // Angles
        'deg': (value) => value,
        'rad': (value) => value * (180 / Math.PI),
        'grad': (value) => value * (180 / 200),
        'turn': (value) => value * 360
    };
    // Match positive and negative numbers including decimals with following unit
    const pattern = new RegExp(`^([\-\+]?(?:\\d+(?:\\.\\d+)?))(${Object.keys(supportedUnits).join('|')})$`, 'i');
    // If is a match, return example: [ "-2.75rem", "-2.75", "rem" ]
    const matches = String.prototype.toString.apply(cssValue).trim().match(pattern);
    if (matches) {
        const value = Number(matches[1]);
        const unit = matches[2].toLocaleLowerCase();
        // Sanity check, make sure unit conversion function exists
        if (unit in supportedUnits) {
            //@ts-ignore
            return supportedUnits[unit](value);
        }
    }
    return parseInt(cssValue);
};
function reactive(value) {
    var newValue = value;
    function get() {
        return newValue;
    }
    function set(value) {
        newValue = value;
    }
    return [get, set];
}
class UnitConversion {
    constructor() {
    }
}
UnitConversion.textToPX = function (length, size) {
    var newText = document.createElement('span');
    newText.style.fontSize = size;
    return length * convertCssUnit(size, document.createElement('d')) * 0.9;
};
function src(path) {
    var img = document.createElement('img');
    img.src = path;
    return img;
}
class Sprite {
    constructor(canvas, x, y, width, height, spriteOptions, load, draw, end) {
        var _a, _b, _c;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this._x = x;
        this._y = y;
        this.width = width;
        this.options = spriteOptions;
        this.height = height;
        this.deleted = false;
        this.ueid = Math.floor(Math.random() * 9999999999999);
        this.collisions = new Set();
        this.draw = (_a = draw) !== null && _a !== void 0 ? _a : (() => { });
        this.end = (_b = end) !== null && _b !== void 0 ? _b : (() => { });
        this.load = (_c = load) !== null && _c !== void 0 ? _c : (() => { });
        this.delete = () => { this.end(this); canvas.sprites = canvas.sprites.filter(sp => sp.ueid !== this.ueid); };
        const detectCollisions = () => {
            this.collisions.clear();
            var sprites = canvas.sprites.filter(sp => sp.ueid !== this.ueid);
            sprites.forEach(sprite => {
                if (this.x < sprite.x + sprite.width &&
                    this.x + this.width > sprite.x &&
                    this.y < sprite.y + sprite.height &&
                    this.height + this.y > sprite.y) {
                    this.collisions.add(sprite.ueid);
                }
            });
        };
        setInterval(detectCollisions, 10);
    }
    get x() {
        if (this.options.alignHoriz !== undefined) {
            switch (this.options.alignHoriz) {
                case 'center':
                    return this._x - this.width / 2;
                case 'left':
                    return this._x;
                case 'right':
                    return this._x;
            }
        }
        return this._x;
    }
    set x(num) {
        this._x = num;
    }
    get y() {
        if (this.options.alignVertical !== undefined) {
            switch (this.options.alignVertical) {
                case 'middle':
                    return this._y - this.height / 2;
                case 'top':
                    return this._y;
                case 'bottom':
                    return this._y;
            }
        }
        return this._x;
    }
    set y(num) {
        this._y = num;
    }
    on(type, callback) {
        switch (type) {
            case 'click': {
                this.canvas.__domElem.addEventListener('click', () => {
                    if (this.canvas.cursorX > this.x && this.canvas.cursorX < this.width + this.x && this.canvas.cursorY > this.y && this.canvas.cursorY < this.y + this.height) {
                        callback();
                    }
                });
                break;
            }
            default: {
                throw new Error('Unknown type: ' + type);
            }
        }
    }
    twice(type, cb1, cb2) {
        switch (type) {
            case 'hover': {
                var on = false;
                this.canvas.__domElem.addEventListener('mousemove', () => {
                    if (this.canvas.cursorX > this.x && this.canvas.cursorX < this.width + this.x && this.canvas.cursorY > this.y && this.canvas.cursorY < this.y + this.height) {
                        cb1();
                        on = true;
                    }
                    else if (on) {
                        cb2();
                        on = false;
                    }
                });
                break;
            }
            default: {
                throw new Error('Unknown type: ' + type);
            }
        }
    }
}
class Canvas {
    constructor(options) {
        _Canvas_instances.add(this);
        _Canvas_initruns.set(this, void 0);
        _Canvas_ctx.set(this, void 0);
        this.__domElem = document.createElement("canvas");
        this.__id = `silkeng-canvas-${Math.floor(Math.random() * 9999999999)}`;
        this.__domElem.classList.add(this.__id);
        this.__domElem.width = options.width;
        this.__domElem.height = options.height;
        this.bgColor = options.backgroundColor ? options.backgroundColor : '#ffffff';
        this.width = options.width;
        this.height = options.height;
        __classPrivateFieldSet(this, _Canvas_ctx, () => document.querySelector(`.${this.__id}`).getContext("2d"), "f");
        __classPrivateFieldSet(this, _Canvas_initruns, 0, "f");
        this.cursorX = 0;
        this.cursorY = 0;
        this.sprites = [];
        this.__domElem.addEventListener("mousemove", (evt) => {
            const rect = document.querySelector(`.${this.__id}`).getBoundingClientRect();
            this.cursorX = (evt.clientX - rect.left) / (rect.right - rect.left) * document.querySelector(`.${this.__id}`).width;
            this.cursorY = (evt.clientY - rect.top) / (rect.bottom - rect.top) * document.querySelector(`.${this.__id}`).height;
        });
        this.keysDown = new Set();
        document.addEventListener('keydown', (e) => {
            this.keysDown.add(e.key);
        });
        document.addEventListener('keyup', (e) => {
            this.keysDown.delete(e.key);
        });
    }
    init() {
        var _a;
        if (__classPrivateFieldGet(this, _Canvas_initruns, "f") > 0)
            throw new Error("Canvas has already been initialized.");
        __classPrivateFieldSet(this, _Canvas_initruns, (_a = __classPrivateFieldGet(this, _Canvas_initruns, "f"), _a++, _a), "f");
        return this.__domElem;
    }
    clear() {
        this.fill(0, 0, this.width, this.height, this.bgColor);
    }
    drawLine(x1, y1, x2, y2, options) {
        const m = (y2 - y1) / (x2 - x1);
        const b = y1 - (m * x1);
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        for (let x = 0; x < distance; x++) {
            var y = m * x + b;
            this.drawCircle(x, Math.round(y), options.width, { color: options.color });
        }
        console.log(`y = ${m}x + ${b}; d: ${distance}`);
    }
    drawCircle(x, y, radius, options) {
        radius--;
        radius *= radius;
        for (let X = -radius; X <= radius; X++) {
            for (let Y = -radius; Y <= radius; Y++) {
                if ((X) ** 2 + (Y) ** 2 <= radius) {
                    __classPrivateFieldGet(this, _Canvas_instances, "m", _Canvas_setPixel).call(this, X + x, Y + y, options.color);
                }
            }
        }
    }
    drawImage(x, y, width, height, source, options) {
        if (typeof source === 'string') {
            source = src(source);
        }
        __classPrivateFieldGet(this, _Canvas_ctx, "f").call(this).drawImage(source, x, y, width, height);
    }
    drawText(content, x, y, options) {
        var _a, _b;
        const ctx = __classPrivateFieldGet(this, _Canvas_ctx, "f").call(this);
        ctx.font = `${options.fontsize} ${options.fontfamily}`;
        ctx.textAlign = (_a = options.justifyHoriz) !== null && _a !== void 0 ? _a : 'end';
        ctx.textBaseline = (_b = options.justifyVertical) !== null && _b !== void 0 ? _b : 'bottom';
        ctx.fillStyle = options.color;
        ctx.fillText(content, x, y);
    }
    fill(x, y, width, height, color) {
        var r = parseInt(color[1] + color[2], 16);
        var g = parseInt(color[3] + color[4], 16);
        var b = parseInt(color[5] + color[6], 16);
        __classPrivateFieldGet(this, _Canvas_ctx, "f").call(this).fillStyle = "rgba(" + r + "," + g + "," + b + "," + 1 + ")";
        __classPrivateFieldGet(this, _Canvas_ctx, "f").call(this).fillRect(x, y, width, height);
    }
}
_Canvas_initruns = new WeakMap(), _Canvas_ctx = new WeakMap(), _Canvas_instances = new WeakSet(), _Canvas_setPixel = function _Canvas_setPixel(x, y, color) {
    var r = parseInt(color[1] + color[2], 16);
    var g = parseInt(color[3] + color[4], 16);
    var b = parseInt(color[5] + color[6], 16);
    __classPrivateFieldGet(this, _Canvas_ctx, "f").call(this).fillStyle = "rgba(" + r + "," + g + "," + b + "," + 1 + ")";
    __classPrivateFieldGet(this, _Canvas_ctx, "f").call(this).fillRect(x, y, 1, 1);
};
