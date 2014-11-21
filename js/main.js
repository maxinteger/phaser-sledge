var log = console.log.bind(console),
    sin = Math.sin,
    cos = Math.cos,
    zoom = 0.15,
    speed = 0.05,
    yPos = -1000,
    center = {
        x: 400,
        y: 200
    };

var numOfTree = 100,
    car = null,
    renderList = [],
    forest = [],
    i;

function Sprite3D (){
    Phaser.Sprite.apply(this, arguments);
    this.scaleFactor = 1;
    this.pos = { x: 0, y: 0, z: 0 };
    this.speed = {x:0, y: 0, z: 0 };
}

Sprite3D.prototype = _.create(Phaser.Sprite.prototype, {
    constructor: Sprite3D,
    update: function (){
        var pos = this.pos;
        pos.x += this.speed.x;
        pos.y += this.speed.y;
        pos.z += this.speed.z;

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
    this.body.setSize(150, 50);     // collision body
    this.body.collideWorldBounds = false;
    this.body.bounce.set(1);
    this.reset();

    this.speed = {x:0, y: 0, z:0.05}
}

Tree.prototype = _.create(Sprite3D.prototype, {
    constructor: Tree,
    update: function () {
        this.speed.z = speed;
        Sprite3D.prototype.update.call(this);
    },
    reset: function(){
        var _x = 10000 - _.random(20000);
        this.tint = 0xffffff;
        this.pos = {
            x: _x,//_x > 0 ? _x + 2000 : _x - 2000,
            y: yPos,
            z: -(100 + _.random(5))
        };
        this.scaleFactor = 0.3 + _.random(1.5, true);
    }
});


function Car (){
    Sprite3D.call(this, game, 0, 0, 'car');

    game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 1);
    this.frame = 1;
    this.scale.setTo(1.5, 1.5);
    this.body.collideWorldBounds = true;
    this.body.bounce.set(1);

    this.carSpeed = 50;
    this.pos = { x: 0, y: yPos, z: -0.55 };
}

Car.prototype = _.create(Sprite3D.prototype, {
    constructor: Car,
    update: function(){
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && this.pos.x < 1100) {
            this.pos.x += this.carSpeed;
            this.frame = 0;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && this.pos.x > -1100) {
            this.pos.x -= this.carSpeed;
            this.frame = 2;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && this.pos.z > -3) {
            this.pos.z -= this.carSpeed / 10000;
            this.frame = 1;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && this.pos.z < -0.4) {
            this.pos.z += this.carSpeed / 10000;
            this.frame = 1;
        } else {
            this.frame = 1;
        }

        Sprite3D.prototype.update.apply(this, arguments);
    }
});


function updateItem (item) {
    item.bringToTop();
    item.update();
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
    renderList = renderList.concat(forest);
}

function initRenderList(numOfTrees){
    renderList = [];
    initTrees(numOfTrees);
    car = new Car();
    renderList.unshift(car);
}


/*
    Controls
 */
document.querySelector('#zoom-range').addEventListener('change', function(){
    zoom = parseFloat(this.value) || 1;
});

document.querySelector('#speed-range').addEventListener('change', function(){
    speed = parseFloat(this.value) || 1;
});

document.querySelector('#tree-range').addEventListener('change', function(){
    var num = parseInt(this.value) || 1;
    for (i = 0; i < numOfTree; i ++){
        if (forest[i]) forest[i].destroy(true);
    }
    forest.length = 0;
    initRenderList(num);
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
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
    preload: function () {
        game.load.image('tree', 'assets/tree.png');
        game.load.spritesheet('car', 'assets/car.png', 54, 41);
    },
    create: function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        initRenderList(numOfTree);
    },
    update: function update (){
        _(renderList).each(updateItem);

        game.physics.arcade.overlap(forest, car, collisionHandler, null, this);
    },
    render: function(){
    }
}, true);

