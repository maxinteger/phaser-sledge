var log = console.log.bind(console),
    sin = Math.sin,
    cos = Math.cos,
    zoom = 0.15,
    speed = {x:0, y: 0, z:0.05},
    yPos = -1000,
    center = {
        x: 400,
        y: 200
    };

var numOfTree = 100,
    forest = [],
    i;

function Sprite3D (){
    Phaser.Sprite.apply(this, arguments);
    this.scaleFactor = 1;
    this.pos = { x: 0, y: 0, z: 0 };
}

Sprite3D.prototype = _.create(Phaser.Sprite.prototype, {
    constructor: Sprite3D,
    updatePosSize: function (){
        var pos = this.pos;
        pos.x += speed.x;
        pos.y += speed.y;
        pos.z += speed.z;

        if (pos.z > 0){
            pos.z = 0.0001;
        }

        this.x = pos.x / pos.z * zoom + center.x;
        this.y = pos.y / pos.z * zoom + center.y;
        var scale = Math.abs(1 / pos.z) * this.scaleFactor;
        this.scale.setTo(scale, scale);
    }
});

function Tree(game){
    Sprite3D.call(this, game, 0, 0, 'tree');

    game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 1);
    this.body.setSize(200, 50);
    this.body.collideWorldBounds = false;
    this.body.bounce.set(1);
    this.reset();
}

Tree.prototype = _.create(Sprite3D.prototype, {
    constructor: Tree,
    reset: function(){
        var _x = 10000 - _.random(20000);
        this.pos = {
            x: _x,//_x > 0 ? _x + 2000 : _x - 2000,
            y: yPos,
            z: -(100 + _.random(5))
        };
        this.scaleFactor = 0.3 + _.random(1.5, true);
    }
});



function updateItem (item) {
    item.bringToTop();
    item.updatePosSize();
    if (item.pos.z > 0) {
        _.pull(forest, item);
        item.reset();
        forest.unshift(item);
    }
}

function collisionHandler(tree, car){
    log('collide');
    tree.tint = 0xff0000;
}

function initTrees(num){
    _(_.range(num)).map(function(){
        return -(5 + _.random(100));
    }).sort(function(a, b){
        return a - b;
    }).map(function(zIndex){
        var tree = new Tree(game);
        tree.pos.z = zIndex;
        forest.push(tree);
    });
}


/*
    Controls
 */
document.querySelector('#zoom-range').addEventListener('change', function(){
    zoom = parseFloat(this.value) || 1;
});

document.querySelector('#speed-range').addEventListener('change', function(){
    speed.z = parseFloat(this.value) || 1;
});

document.querySelector('#tree-range').addEventListener('change', function(){
    var num = parseInt(this.value) || 1;
    for (i = 0; i < numOfTree; i ++){
        if (forest[i]) forest[i].destroy(true);
    }
    forest.length = 0;
    initTrees(num);
    numOfTree = num;
});

document.querySelector('#y-range').addEventListener('change', function(){
    yPos = parseInt(this.value) || 1;
    for (i = 0; i < numOfTree; i ++){
        if (forest[i]) forest[i].pos.y = yPos
    }
});


/*
    GAME
 */
var car,
    carSpeed = 10;
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', {
    preload: function () {
        game.load.image('tree', 'assets/tree.png');
        game.load.spritesheet('car', 'assets/car.png', 54, 41);
    },
    create: function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);

        car = game.add.sprite(400, 350, 'car');
        car.anchor.setTo(0.5, 1);
        car.frame = 1;
        car.scale.setTo(1.5, 1.5);
        game.physics.enable(car, Phaser.Physics.ARCADE);
        car.body.collideWorldBounds = true;
        car.body.bounce.set(1);

        initTrees(numOfTree);
    },
    update: function update (){
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            car.x -= carSpeed;
            car.frame = 0;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            car.x += carSpeed;
            car.frame = 2;
        } else {
            car.frame = 1;
        }

        _(forest).each(updateItem);
        game.physics.arcade.collide(forest, car, collisionHandler, null, this);
    },
    render: function(){
        game.debug.body(car);
        _(forest).each(function(tree){
            game.debug.body(tree);
        });

        game.debug.quadTree(game.physics.arcade.quadTree);
    }
}, true);

