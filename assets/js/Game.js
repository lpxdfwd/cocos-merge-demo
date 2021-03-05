// // Learn cc.Class:
// //  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// // Learn Attribute:
// //  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// // Learn life-cycle callbacks:
// //  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const FruitItem = cc.Class({
    name: 'FruitItem',
    properties: {
        id: 0,
        iconSF: cc.SpriteFrame
    }
})

cc.Class({
    extends: cc.Component,

    properties: {
        fruitPrefab: {
            default: null,
            type: cc.Prefab
        },
        fruits: {
            default: [],
            type: FruitItem
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    startFruitPhysics(fruit) {
        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic
        const physicsCircleCollider = fruit.getComponent(cc.PhysicsCircleCollider)
        physicsCircleCollider.radius = fruit.height / 2
        physicsCircleCollider.apply()
    },

    initPhysicsManager() {
        // 物理引擎
        const instance = cc.director.getPhysicsManager()
        instance.enabled = true
        // instance.debugDrawFlags = 4
        instance.gravity = cc.v2(0, -960);

        // 碰撞检测
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true

        // 设置四周的碰撞区域
        let width = this.node.width;
        let height = this.node.height;

        let node = new cc.Node();

        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        const _addBound = (node, x, y, width, height) => {
            let collider = node.addComponent(cc.PhysicsBoxCollider);
            collider.offset.x = x;
            collider.offset.y = y;
            collider.size.width = width;
            collider.size.height = height;
        }

        _addBound(node, 0, -height / 2, width, 1);
        _addBound(node, 0, height / 2, width, 1);
        _addBound(node, -width / 2, 0, 1, height);
        _addBound(node, width / 2, 0, 1, height);

        node.parent = this.node;
    },

    addBound(node, x, y, width, height) {
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    },

    createFruit(num, x, y) {
        let fruit = cc.instantiate(this.fruitPrefab);
        const config = this.fruits[num - 1];

        fruit.getComponent('Fruit').init({
            id: config.id,
            iconSF: config.iconSF
        });

        fruit.setPosition(cc.v2(x, y));

        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static
        fruit.getComponent(cc.PhysicsCircleCollider).radius = 0;
        fruit.scale = 0.6

        this.node.addChild(fruit);
        return fruit;
    },

    onTouchStart(e){
        this.isCreating = true
        const {width, height} = this.node


        const fruit = this.currentFruit

        const pos = e.getLocation()
        let {x, y} = pos
        x = x - width / 2
        y = y - height / 2

        const action = cc.sequence(cc.moveBy(0.3, cc.v2(x, 0)).easing(cc.easeCubicActionIn()), cc.callFunc(() => {
            this.startFruitPhysics(fruit)

            this.scheduleOnce(() => {
                this.currentFruit = this.createFruit(this.getFruitId(), 0, 400);
                this.isCreating = false
            }, 1)
        }))

        fruit.runAction(action)
    },

    start () {

    },

    getFruitId() {
        return Math.floor(Math.random() * 4) + 1;
    },

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.initPhysicsManager();
        this.currentFruit = this.createFruit(this.getFruitId(), 0, 400);
    }

    // update (dt) {},
});
