var lastUpdate = Date.now();

const canva = new Canvas({
    width: 600, 
    height: 700,
    framerate: 60,
});

document.body.appendChild(canva.init())

const [textWidth, setTextWidth] = reactive(0)
const [clicks, setClicks] = reactive(0)

var textsize = '1rem'

canva.sprites = [
    new Sprite(canva, canva.width/2, canva.height/2, 100, 20, {
        alignHoriz: 'center',
        alignVertical: 'middle'
    }, sprite => {
        sprite.twice('hover', () => {
            textsize = '2rem'
        }, () => {
            textsize = '1rem'
        })
        sprite.on('click', e => {
            setClicks(clicks() + 1)
        })
    }, sprite => {
        setTextWidth(UnitConversion.textToPX('Click me'.length, textsize))
        
        sprite.width = textWidth()

        canva.drawText('Click me', canva.width/2, canva.height/2, {
            color: '#000000',
            fontfamily: "Arial",
            fontsize: textsize,
            justifyHoriz: 'center',
            justifyVertical: 'middle'
        })
        //canva.fill(sprite.x, sprite.y, sprite.width, sprite.height, '#000000');
    }),
    new Sprite(canva, canva.width/2, 100, 100, 20, {
        alignHoriz: 'center',
        alignVertical: 'middle'
    }, void 0, sprite => {
        setTextWidth(UnitConversion.textToPX(`${clicks()} Clicks`.length, textsize))
        
        sprite.width = textWidth()

        canva.drawText(`${clicks()} Clicks`, canva.width/2, 100, {
            color: '#000000',
            fontfamily: "Arial",
            fontsize: '3rem',
            justifyHoriz: 'center',
            justifyVertical: 'middle'
        })
        //canva.fill(sprite.x, sprite.y, sprite.width, sprite.height, '#000000');
    })
]

function load() {
    canva.sprites.forEach(sprite => {
        sprite.load(sprite)
    })
}
function tick() {
    canva.clear()
    canva.sprites.forEach(sprite => {
        sprite.draw(sprite)
    })
}
function second() {

}

load()
setInterval(tick, 1000/60)
setInterval(second, 4000)