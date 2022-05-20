/**
 * Convert absolute CSS numerical values to pixels.
 *
 * @link https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#numbers_lengths_and_percentages
 *
 * @param {string} cssValue
 * @param {null|HTMLElement} target Used for relative units.
 * @return {*}
 */
 const convertCssUnit = function( cssValue: string, target: HTMLElement): number {

    target = target || document.body;

    const supportedUnits = {

        // Absolute sizes
        'px': (value: any) => value,
        'cm': (value: number) => value * 38,
        'mm': (value: number) => value * 3.8,
        'q': (value: number) => value * 0.95,
        'in': (value: number) => value * 96,
        'pc': (value: number) => value * 16,
        'pt': (value: number) => value * 1.333333,

        // Relative sizes
        'rem': (value: number) => value * parseFloat( getComputedStyle( document.documentElement ).fontSize ),
        'em': (value: number) => value * parseFloat( getComputedStyle( target ).fontSize ),
        'vw': (value: number) => value / 100 * window.innerWidth,
        'vh': (value: number) => value / 100 * window.innerHeight,

        // Times
        'ms': (value: any) => value,
        's': (value: number) => value * 1000,

        // Angles
        'deg': (value: any) => value,
        'rad': (value: number) => value * ( 180 / Math.PI ),
        'grad': (value: number) => value * ( 180 / 200 ),
        'turn': (value: number) => value * 360

    };

    // Match positive and negative numbers including decimals with following unit
    const pattern = new RegExp( `^([\-\+]?(?:\\d+(?:\\.\\d+)?))(${ Object.keys( supportedUnits ).join( '|' ) })$`, 'i' );

    // If is a match, return example: [ "-2.75rem", "-2.75", "rem" ]
    const matches = String.prototype.toString.apply( cssValue ).trim().match( pattern );

    if ( matches ) {
        const value = Number( matches[ 1 ] );
        const unit = matches[ 2 ].toLocaleLowerCase();

        // Sanity check, make sure unit conversion function exists
        if ( unit in supportedUnits ) {
			//@ts-ignore
            return supportedUnits[ unit ]( value );
        }
    }

    return parseInt(cssValue);

};

function reactive<T>(value: T): [() => T, (value: T) => void] {
	var newValue: T = value;

	function get() {
		return newValue;
	}
	function set( value: T ) {
		newValue = value;
	}

	return [get, set]
}

class UnitConversion {
	constructor () {

	}

	static textToPX = function (length: number, size: string): number {
		var newText = document.createElement('span');
		newText.style.fontSize = size

		return length * convertCssUnit(size, document.createElement('d')) * 0.9
	}
}


type EngineOptions = {
	width: number;
	height: number;
	backgroundColor?: string,
	framerate: number;
};
type BaseOptions = {
	
}

type CanvasOnOptions = 'click'
type CanvasTwiceOptions = 'hover'

interface SpriteOptions {
	alignHoriz?: 'left' | 'center' | 'right';
	alignVertical?: 'top' | 'middle' | 'bottom';
}

interface BaseDrawOptions extends BaseOptions {
	color: string;
}

interface LineOptions extends BaseDrawOptions {
	width: number;
}
interface CircleOptions extends BaseDrawOptions {
	
}
interface ImageOptions extends BaseOptions {

}
interface TextOptions extends BaseDrawOptions {
	fontfamily?: string;
	fontsize?: string;
	justifyHoriz?: 'left' | 'center' | 'right';
	justifyVertical?: 'top' | 'middle' | 'bottom';
}

function src(path: string) {
	var img = document.createElement('img')
	img.src = path
	return img
}

class Sprite {
	canvas: Canvas
	width: number
	height: number;
	ueid: number;
	deleted: boolean;

	options: SpriteOptions

	collisions: Set<number>;

	draw: (sprite: Sprite) => void;
	end: (sprite: Sprite) => void;
	load: (sprite: Sprite) => void;

	

	delete: () => void;
	private _y: number;
	private _x: number;

	constructor(canvas: Canvas, x: number, y: number, width: number, height: number, spriteOptions: SpriteOptions, load?: (sprite: Sprite) => void, draw?: (sprite: Sprite) => void, end?: (sprite: Sprite) => void) {
		this.canvas = canvas
		this.x = x
		this.y = y
		this._x = x
		this._y = y

		this.width = width

		this.options = spriteOptions		

		this.height = height
		this.deleted = false;

		this.ueid = Math.floor(Math.random() * 9999999999999)

		this.collisions = new Set()

		this.draw = draw! ?? (() => {})
		this.end = end! ?? (() => {})
		this.load = load! ?? (() => {})

		this.delete = () => {this.end(this); canvas.sprites = canvas.sprites.filter(sp => sp.ueid !== this.ueid)}
		
		const detectCollisions = () => {
			
			this.collisions.clear()
			
			var sprites = canvas.sprites.filter(sp => sp.ueid !== this.ueid)
			sprites.forEach(sprite => {
				if (
					this.x < sprite.x + sprite.width &&
					this.x + this.width > sprite.x &&
					this.y < sprite.y + sprite.height &&
					this.height + this.y > sprite.y
				) {
					this.collisions.add(sprite.ueid)
				}
			})
			
		}

		setInterval(detectCollisions, 10)
	}

	get x() {

		if (this.options.alignHoriz !== undefined) {
			switch (this.options.alignHoriz) {
				case 'center':
					return this._x - this.width/2
				case 'left':
					return this._x
				case 'right':
					return this._x
			}
		}
		return this._x
	}
	set x(num: number) {
		this._x = num
	}
	get y() {

		if (this.options.alignVertical !== undefined) {
			switch (this.options.alignVertical) {
				case 'middle':
					return this._y - this.height/2
				case 'top':
					return this._y
				case 'bottom':
					return this._y
			}
		}
		return this._x
	}
	set y(num: number) {
		this._y = num
	}

	on(type: CanvasOnOptions, callback: (e?: any) => void) {
		switch (type) {
			case 'click': {
				this.canvas.__domElem.addEventListener('click', () => {
					if (this.canvas.cursorX > this.x && this.canvas.cursorX < this.width+this.x && this.canvas.cursorY > this.y && this.canvas.cursorY < this.y+this.height) {
						callback()
					}
				})
				
				break;
			}
			default: {
				throw new Error('Unknown type: ' + type)
			}
		}
	}
	
	twice(type: CanvasTwiceOptions, cb1: (e?: any) => void, cb2: (e?: any) => void) {
		switch (type) {
			case 'hover': {
				var on = false

				this.canvas.__domElem.addEventListener('mousemove', () => {
					if (this.canvas.cursorX > this.x && this.canvas.cursorX < this.width+this.x && this.canvas.cursorY > this.y && this.canvas.cursorY < this.y+this.height) {
						cb1()
						on = true
					} else if (on) {
						cb2()
						on = false
					}
				})
				break;
			}
			default: {
				throw new Error('Unknown type: ' + type)
			}
		}
	}
}

class Canvas {
	__id: string;
	width: number;
	height: number;
	__domElem: HTMLCanvasElement;
	#initruns: number;
	#bgColor: string;

	sprites: Sprite[];

	cursorX: number;
	cursorY: number;

	keysDown: Set<string>;

	#ctx: () => CanvasRenderingContext2D;

	constructor(options: EngineOptions) {
		this.__domElem = document.createElement("canvas");
		this.__id = `silkeng-canvas-${Math.floor(Math.random() * 9_999_999_999)}`;

		this.__domElem.classList.add(this.__id);
		this.__domElem.width = options.width;
		this.__domElem.height = options.height;
		this.#bgColor = options.backgroundColor ? options.backgroundColor : '#ffffff'
		this.width = options.width;
		this.height = options.height

		this.#ctx = () =>
			(document.querySelector(`.${this.__id}`) as HTMLCanvasElement).getContext(
				"2d"
			)!;

		this.#initruns = 0;

		this.cursorX = 0;
		this.cursorY = 0;
		this.sprites = [];

		this.__domElem.addEventListener("mousemove", (evt: MouseEvent) => {
			const rect = (document.querySelector(`.${this.__id}`) as HTMLCanvasElement).getBoundingClientRect();
			this.cursorX = (evt.clientX - rect.left) / (rect.right - rect.left) * (document.querySelector(`.${this.__id}`) as HTMLCanvasElement).width
			this.cursorY = (evt.clientY - rect.top) / (rect.bottom - rect.top) * (document.querySelector(`.${this.__id}`) as HTMLCanvasElement).height
		})

		this.keysDown = new Set()
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			this.keysDown.add(e.key)
		})
		document.addEventListener('keyup', (e: KeyboardEvent) => {
			this.keysDown.delete(e.key)
		})
	}

	init() {
		if (this.#initruns > 0)
			throw new Error("Canvas has already been initialized.");
		this.#initruns++;
		return this.__domElem;
	}
 
	clear() {
		this.fill(0, 0, this.width, this.height, this.#bgColor)
	}

	drawLine(x1: number, y1: number, x2: number, y2: number, options: LineOptions) {
		const m = (y2-y1)/(x2-x1)
		const b = y1-(m*x1)
		
		const distance = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
		for (let x = 0; x < distance; x++) {
			var y = m*x+b;
			this.drawCircle(x, Math.round(y), options.width, {color: options.color})
		}
		console.log(`y = ${m}x + ${b}; d: ${distance}`)
	}

	drawCircle(x: number, y: number, radius: number, options: CircleOptions) {
		radius--;
		radius *= radius
		for (let X = -radius; X <= radius; X++) {
			for (let Y = -radius; Y <= radius; Y++) {
				if ((X)**2+(Y)**2 <= radius) {
					this.#setPixel(X+x, Y+y, options.color)
				}
				
			}
			
		}
		
	}

	drawImage(x: number, y: number, width: number, height: number, source: CanvasImageSource | string, options: ImageOptions) {
		if (typeof source === 'string') {
			source = src(source);
		}
		this.#ctx().drawImage(source, x, y, width, height)
	}
	drawText(content: string, x:number, y:number, options: TextOptions) {
		const ctx = this.#ctx();
		ctx.font = `${options.fontsize!} ${options.fontfamily!}`
		ctx.textAlign = options.justifyHoriz ?? 'end'
		ctx.textBaseline = options.justifyVertical ?? 'bottom'
		ctx.fillStyle = options.color
		ctx.fillText(content, x, y)
	}

	#setPixel(x: number, y: number, color: string) {
		var r = parseInt(color[1] + color[2], 16);
		var g = parseInt(color[3] + color[4], 16);
		var b = parseInt(color[5] + color[6], 16);
		this.#ctx().fillStyle = "rgba(" + r + "," + g + "," + b + "," + 1 + ")";
		this.#ctx().fillRect(x, y, 1, 1);
	}

	fill(x: number, y: number, width: number, height: number, color: string) {
		var r = parseInt(color[1] + color[2], 16);
		var g = parseInt(color[3] + color[4], 16);
		var b = parseInt(color[5] + color[6], 16);
		this.#ctx().fillStyle = "rgba(" + r + "," + g + "," + b + "," + 1 + ")";
		this.#ctx().fillRect(x, y, width, height);
	}
}
