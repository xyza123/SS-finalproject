// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
const skin_list = ["normal", "boxer", "brucelee", "bullman", "caveman", "ebifry", "egypt", "mexican", "ninja", "pirate", "russian"];
const bomb_list = ["normal", "watermelon", "soccer", "baseball", "UFO"];
const Achievement_restrict_list = [[5,10,20],[],[],[],[20,40,60],[20,40,60],[20,40,60],[20,40,60],[],[],[],[],[],[60,20,7],[60,20,7],[20,40,60]];
const Achievement_level_list = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const Input = {};
let record = null;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    timeText: cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;


    @property(cc.Node)
    shieldTimer: cc.Node = null;
    @property(cc.Node)
    speedCount: cc.Node = null;

    @property(cc.Node)
    playerStatus: cc.Node = null;

    @property(cc.Node)
    endanimation: cc.Node = null;


    public skin: String = "brucelee";
    public color: String = "red";
    public bomb: String = "";
    public get_treasure = 0;
    public is_invincible = false;
    public _alive = true;
    public _speed = 0;
    private _direction = 'static';
    public coin = 0;
    private frameCount = 0;

    public bomb_number = 1;
    public special_bomb_number = 0;
    public extra_special_bomb_number = 0;
    public burning_bomb_number = 0;
    public landmine_number = 0;

    public bomb_exploded_range = 1;
    public bomb_exploded_time = 2.5;

    public bomb_frame: any = null;
    private walkRightSprites: any = [0, 1, 2, 3, 4, 5, 6, 7];
    private walkDownSprites: any = [0, 1, 2, 3];
    private walkUpSprites: any = [0, 1, 2, 3];

    private headSprites: any = [0, 1, 2];
    private faceSprites: any = [0, 1, 2];
    //should get by persist node
    public lifeNum: number = 3;
    public Timer: number = 60;
    public isDeadTest: boolean = false;
    public killTest: boolean = false;
    public rebornX: number = 0;
    public rebornY: number = 0;

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        for (let i in Input) {
            Input[i] = 0;
        }
        record = cc.find("record").getComponent("record")
        for(let i=0;i<16;i++){
            if(record.userAchievement[i] != 0){
                if(record.userAchievement[i] > Achievement_restrict_list[i][0]){
                    Achievement_level_list[i] = 0;
                }
                else if(record.userAchievement[i] > Achievement_restrict_list[i][1]){
                    Achievement_level_list[i] = 1;
                }
                else if(record.userAchievement[i] > Achievement_restrict_list[i][2]){
                    Achievement_level_list[i] = 2;
                }
                else{
                    Achievement_level_list[i] = 3;
                }
            }
        }
        this.skin = skin_list[record.player1Skin];
        this.color = record.player1Color;
        this.bomb = bomb_list[record.player1Bomb];
        this._speed = 100;
        //this.lifeNum = parseInt(record.settingLife);
        this.Timer = parseInt(record.settingTime);

        this._direction = 'static';

        this.shieldTimer.active = false;
        this.node.getChildByName('shield').active = false;


        this.rebornX = this.node.x;
        this.rebornY = this.node.y;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        //Load Sprites
        let me = this;

        ////walkright
        for (let i = 0; i < 8; i++) {
            cc.loader.loadRes('character sprites/' + this.skin + '/' + this.color + '/walkright/walkright-' + i, cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    cc.log(err);
                    return;
                }
                me.walkRightSprites[i] = spriteFrame;
            });
        }

        ////walkdown
        for (let i = 0; i < 4; i++) {
            cc.loader.loadRes('character sprites/' + this.skin + '/' + this.color + '/walkdown/walkdown-' + i, cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    cc.log(err);
                    return;
                }
                me.walkDownSprites[i] = spriteFrame;
                //onload check
                if (i == 3) {
                    me.node.getChildByName('body').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                }
            });


        }

        ////walkup
        for (let i = 0; i < 4; i++) {
            cc.loader.loadRes('character sprites/' + this.skin + '/' + this.color + '/walkup/walkup-' + i, cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    cc.log(err);
                    return;
                }
                me.walkUpSprites[i] = spriteFrame;
            });
        }

        ////head [back, right, front]
        for (let i = 0; i < 3; i++) {
            cc.loader.loadRes('character sprites/' + this.skin + '/' + this.color + '/heads/head-' + i, cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    cc.log(err);
                    return;
                }
                me.headSprites[i] = spriteFrame;
                //onload check
                if (i == 2) {
                    me.node.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    me.node.getChildByName('head').active = true;
                }
            });

        }

        ////face [both, cry, side]
        cc.loader.loadRes('character sprites/face/botheye', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            me.faceSprites[0] = spriteFrame;

            //onload check
            me.node.getChildByName('face').getComponent(cc.Sprite).spriteFrame = spriteFrame;

        });
        cc.loader.loadRes('character sprites/face/cryface', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            me.faceSprites[1] = spriteFrame;
        });
        cc.loader.loadRes('character sprites/face/sideeye', cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            me.faceSprites[2] = spriteFrame;
        });

        cc.loader.loadRes('object sprites/' + this.bomb, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            me.bomb_frame = spriteFrame;
        });
    }


    onKeyDown(e) {
        if (this._alive)
            Input[e.keyCode] = 1;
        else
            Input[e.keyCode] = 0;
        // if (e.keyCode == cc.macro.KEY.k) {
        //     this.reborn();
        //     this.lifeNum -= 1;
        // }
    }

    onKeyUp(e) {
        Input[e.keyCode] = 0;
        this._direction = 'static';
    }

    updateStatus() {
        let bcd = this.playerStatus.getChildByName('bombCD').getChildByName('num').getComponent(cc.Label);
        let range = this.playerStatus.getChildByName('range').getChildByName('num').getComponent(cc.Label);

        bcd.string = this.bomb_exploded_time.toString() + '秒'
        range.string = this.bomb_exploded_range.toString() + '格'
    }

    private shieldTime = 20;

    startShieldCountdown() {
        if (this.shieldTimer.active) {
            this.shieldTime = 20;
            return;
        }
        this.shieldTimer.active = true;

        let e = this;

        e.shieldTimer.getChildByName('timer').getComponent(cc.Label).string = e.shieldTime.toString();
        e.shieldTime--;
        this.node.getChildByName('body').getComponent(cc.Sprite).schedule(function () {
            if (e.shieldTime === -1 || e.node.getChildByName('shield').active === false) {
                this.unscheduleAllCallbacks();
            }
            e.shieldTimer.getChildByName('timer').getComponent(cc.Label).string = e.shieldTime.toString();

            e.shieldTime--;
        }, 1, 190, 0);

    }

    detectShield() {
        if (this.shieldTime === -1 || this.node.getChildByName('shield').active === false) {
            this.shieldTimer.active = false;
            this.node.getChildByName('shield').active = false;
            this.shieldTime = 20;
        }
    }


    public end = false;
    endGame() {
        let action = cc.moveBy(2, 0, -720);
        this.endanimation.runAction(action);
        this.node.getComponent(cc.RigidBody).schedule(function () {
            cc.director.loadScene("settlement");
        }, 2)
    }
    update(dt) {
        if (this._alive == false) {
            if (!this.end) {
                this.end = true;
                record.winner = "player2"
                this.endGame();
            }

        }
        else if (this.get_treasure == 5) {
            if (!this.end) {
                this.end = true;
                record.winType = "collect";
                record.winner = "player1";
                if (record.userAchievement[14] > record.settingTime - this.Timer || record.userAchievement[14] == 0) {
                    record.userAchievement[14] = record.settingTime - this.Timer;
                }
                if(Achievement_level_list[14] != 3){
                    if(record.userAchievement[14] <= Achievement_restrict_list[14][Achievement_level_list[14]]){
                        record.updateAchievementList[14] = Achievement_level_list[14] + 1;
                        Achievement_level_list[14] += 1;
                    }
                }
                this.endGame();
            }
        }
        this.updateTime(dt);// only player1 need
        //cc.log("x:",this.node.x);
        this.detectShield()
        this.updateStatus()

        let head = this.node.getChildByName('head');
        let body = this.node.getChildByName('body');
        let face = this.node.getChildByName('face');


        if (this._direction === 'left' && this._alive) {
            head.setPosition(6, head.position.y);
            body.getComponent(cc.Sprite).node.scaleX = -1;
            head.getComponent(cc.Sprite).node.scaleX = -1;

            face.setPosition(-15, face.position.y);
            face.getComponent(cc.Sprite).spriteFrame = this.faceSprites[2];
            face.active = true;

        } else if (this._direction === 'right' && this._alive) {
            head.setPosition(-6, head.position.y);
            body.getComponent(cc.Sprite).node.scaleX = 1;
            head.getComponent(cc.Sprite).node.scaleX = 1;

            face.getComponent(cc.Sprite).spriteFrame = this.faceSprites[2];
            face.setPosition(15, face.position.y);
            face.active = true;
        } else if (this._direction === 'up' && this._alive) {
            head.setPosition(0, head.position.y);

            face.active = false;
        } else if (this._direction === 'down' && this._alive) {
            head.setPosition(0, head.position.y);

            face.getComponent(cc.Sprite).spriteFrame = this.faceSprites[0];
            face.active = true;
            face.setPosition(0, face.position.y);
        }

        if (Input[cc.macro.KEY.a] && this._alive) {
            this.node.x -= this._speed * dt;
            this._direction = 'left'
            head.getComponent(cc.Sprite).spriteFrame = this.headSprites[1];
        }
        else if (Input[cc.macro.KEY.d] && this._alive) {
            this.node.x += this._speed * dt;
            //this.node.runAction(cc.moveTo(0.5,448,this.node.y));
            this._direction = 'right'
            head.getComponent(cc.Sprite).spriteFrame = this.headSprites[1];

        }
        else if (Input[cc.macro.KEY.w] && this._alive) {
            this.node.y += this._speed * dt;
            this._direction = 'up'
            head.getComponent(cc.Sprite).spriteFrame = this.headSprites[0];

        }
        else if (Input[cc.macro.KEY.s] && this._alive) {
            this.node.y -= this._speed * dt;
            this._direction = 'down'
            head.getComponent(cc.Sprite).spriteFrame = this.headSprites[2];

        }

        if (this._alive) {
            switch (this._direction) {
                case 'right':
                case 'left':
                    this.walkRight();
                    break;
                case 'down':
                    this.walkDown();
                    break;
                case 'up':
                    this.walkUp();
                    break;
            }
        }

    }

    walkRight() {
        this.frameCount %= 40;
        this.node.getChildByName('body').getComponent(cc.Sprite).spriteFrame = this.walkRightSprites[Math.floor(this.frameCount / 5)];
        this.frameCount++;
    }

    walkDown() {
        this.frameCount %= 40;
        this.node.getChildByName('body').getComponent(cc.Sprite).spriteFrame = this.walkDownSprites[Math.floor(this.frameCount / 10)];
        this.frameCount++;
    }

    walkUp() {
        this.frameCount %= 40;
        this.node.getChildByName('body').getComponent(cc.Sprite).spriteFrame = this.walkUpSprites[Math.floor(this.frameCount / 10)];
        this.frameCount++;
    }

    updateTime(dt) {
        if (this.lifeNum > 0) {
            this.Timer -= dt;
        }
        if (this.Timer <= 0) {
            //this.playDeath();
            if (!this.end) {
                this.end = true;
                record.winner = 'player1'
                record.winType = "time";
                this.endGame()
            }
        } else {
            this.timeText.getComponent(cc.Label).string = this.Timer.toFixed(0).toString();
        }
    }

    reborn() {
        //this.lifeNum-=1;

        let blink = cc.blink(2, 6);
        this.node.runAction(blink);

        this.is_invincible = true;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(function () {
            this.is_invincible = false;
        }, 2);
        this._alive = true;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let bomb_tiled = bomb_layer.getTiledTileAt(1, 10, false);
        if (bomb_tiled.getComponent(cc.Sprite).spriteFrame != null) {
            bomb_tiled.node.attr({
                left: false,
            })
        }
        this.node.x = this.rebornX;
        this.node.y = this.rebornY;
        this._direction = "static";
        let head = this.node.getChildByName('head');
        let face = this.node.getChildByName('face');
        head.setPosition(0, head.position.y);
        head.getComponent(cc.Sprite).spriteFrame = this.headSprites[2];
        face.getComponent(cc.Sprite).spriteFrame = this.faceSprites[0];
        face.active = true;
        face.setPosition(0, face.position.y);
        this.node.getChildByName('body').getComponent(cc.Sprite).spriteFrame = this.walkDownSprites[Math.floor(this.frameCount / 10)];

    }

    blick() {
        let blink = cc.blink(2, 6);
        this.node.runAction(blink);
    }

    onBeginContact(contact, self, other) {
        if (other.node.name == "player2") {
            contact.disabled = true;
            if (self.node.getChildByName('shield').active) {
                this.node.getComponent(cc.PhysicsCircleCollider).unscheduleAllCallbacks();
                this.node.getChildByName("shield").active = false;
                this.node.getComponent('escape_player_controller').is_invincible = true;
                this.node.getComponent('escape_player_controller').blick();
                this.node.getComponent('escape_player_controller').unscheduleAllCallbacks();
                this.node.getComponent('escape_player_controller').scheduleOnce(function () {
                    this.is_invincible = false;
                }, 2);
            } else if (!this.is_invincible) {
                this._alive = false;
                record.winType = "catched";
                if (record.userAchievement[13] > record.settingTime - this.Timer || record.userAchievement[13] == 0) {
                    record.userAchievement[13] = record.settingTime - this.Timer;
                }
                if(Achievement_level_list[13] != 3){
                    if(record.userAchievement[13] <= Achievement_restrict_list[13][Achievement_level_list[13]]){
                        record.updateAchievementList[13] = Achievement_level_list[13] + 1;
                        Achievement_level_list[13] += 1;
                    }
                }
            }

        }
    }
}
