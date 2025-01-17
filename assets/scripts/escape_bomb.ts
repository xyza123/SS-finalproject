// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { record } from "./record";
let record = null;
const { ccclass, property } = cc._decorator;
const Achievement_restrict_list = [[5,10,20],[],[],[],[20,40,60],[20,40,60],[20,40,60],[20,40,60],[],[],[],[],[],[60,20,7],[60,20,7],[20,40,60]];
const Achievement_level_list = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const Input = {}
@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    map: cc.Node = null;
    @property(cc.Node)
    player: cc.Node = null;
    @property(cc.Node)
    otherPlayer: cc.Node = null;
    @property(cc.AudioClip)
    bomb_sound: cc.AudioClip = null;
    private stunned_number = 0;
    private real_position: cc.Vec2 = cc.v2(0, 0);
    private revised_position: cc.Vec2 = cc.v2(0, 0);

    private otherPlayer_real_position: cc.Vec2 = cc.v2(0, 0);
    private otherPlayer_revised_position: cc.Vec2 = cc.v2(0, 0);
    bombCD: boolean = false;// if true, can't put bomb
    // LIFE-CYCLE CALLBACKS:
    bombTest: cc.Node = null;
    player_data = null;
    Time: number = 0;
    ItemTimeIdx: number = 1;
    treasurePt1X: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt2X: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt3X: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt4X: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt1Y: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt2Y: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt3Y: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasurePt4Y: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    treasureGenX: number[] = [0, 0, 0, 0, 0];
    treasureGenY: number[] = [0, 0, 0, 0, 0];
    pt1Num: number = 0;
    pt2Num: number = 0;
    pt3Num: number = 0;
    pt4Num: number = 0;


    onLoad() {
        record = cc.find("record").getComponent("record")
        for(let i=0;i<16;i++){
            if(record.userAchievement[i] < Achievement_restrict_list[i][0]){
                Achievement_level_list[i] = 0;
            }
            else if(record.userAchievement[i] < Achievement_restrict_list[i][1]){
                Achievement_level_list[i] = 1;
            }
            else if(record.userAchievement[i] < Achievement_restrict_list[i][2]){
                Achievement_level_list[i] = 2;
            }
            else{
                Achievement_level_list[i] = 3;
            }
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        cc.director.getPhysicsManager().enabled = true;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let treasure_layer = tiledMap.getLayer("treasureLayer");
        let item_layer = tiledMap.getLayer("item layer");
        let layerSize = treasure_layer.getLayerSize();
        for (let i = 1; i < layerSize.height; i++) {
            for (let j = 1; j < layerSize.width; j++) {
                let treasure_tiled = treasure_layer.getTiledTileAt(i, j, false);
                //cc.log(i,j,treasure_tiled.gid);
                if (treasure_tiled.gid == 0)
                    continue;

                if (i <= 8 && j <= 8) {
                    this.treasurePt1X[this.pt1Num] = i;
                    this.treasurePt1Y[this.pt1Num] = j;
                    this.pt1Num++;
                } else if (i > 8 && j <= 8) {
                    this.treasurePt2X[this.pt2Num] = i;
                    this.treasurePt2Y[this.pt2Num] = j;
                    this.pt2Num++;
                } else if (i > 8 && j > 8) {
                    this.treasurePt3X[this.pt3Num] = i;
                    this.treasurePt3Y[this.pt3Num] = j;
                    this.pt3Num++;
                } else {
                    this.treasurePt4X[this.pt4Num] = i;
                    this.treasurePt4Y[this.pt4Num] = j;
                    this.pt4Num++;
                }
            }
        }
        cc.log(this.pt1Num, this.pt2Num, this.pt3Num, this.pt4Num);
        let haveTwo = Math.floor(Math.random() * 100) % 4 + 1;
        let random1 = Math.floor(Math.random() * 100) % this.pt1Num;
        let random2 = Math.floor(Math.random() * 100) % this.pt2Num;
        let random3 = Math.floor(Math.random() * 100) % this.pt3Num;
        let random4 = Math.floor(Math.random() * 100) % this.pt4Num;
        this.treasureGenX[0] = this.treasurePt1X[random1];
        this.treasureGenY[0] = this.treasurePt1Y[random1];
        this.treasureGenX[1] = this.treasurePt2X[random2];
        this.treasureGenY[1] = this.treasurePt2Y[random2];
        this.treasureGenX[2] = this.treasurePt3X[random3];
        this.treasureGenY[2] = this.treasurePt3Y[random3];
        this.treasureGenX[3] = this.treasurePt4X[random4];
        this.treasureGenY[3] = this.treasurePt4Y[random4];
        let randomOther = 0;
        if (haveTwo == 1) {
            randomOther = Math.floor(Math.random() * 100) % this.pt1Num;
            while (randomOther == random1) {
                randomOther = Math.floor(Math.random() * 100) % this.pt1Num;
            }
            this.treasureGenX[4] = this.treasurePt1X[randomOther];
            this.treasureGenY[4] = this.treasurePt1Y[randomOther];
        } else if (haveTwo == 2) {
            randomOther = Math.floor(Math.random() * 100) % this.pt2Num;
            while (randomOther == random2) {
                randomOther = Math.floor(Math.random() * 100) % this.pt2Num;
            }
            this.treasureGenX[4] = this.treasurePt2X[randomOther];
            this.treasureGenY[4] = this.treasurePt2Y[randomOther];
        } else if (haveTwo == 3) {
            randomOther = Math.floor(Math.random() * 100) % this.pt3Num;
            while (randomOther == random3) {
                randomOther = Math.floor(Math.random() * 100) % this.pt3Num;
            }
            this.treasureGenX[4] = this.treasurePt3X[randomOther];
            this.treasureGenY[4] = this.treasurePt3Y[randomOther];
        } else if (haveTwo == 4) {
            randomOther = Math.floor(Math.random() * 100) % this.pt4Num;
            while (randomOther == random4) {
                randomOther = Math.floor(Math.random() * 100) % this.pt4Num;
            }
            this.treasureGenX[4] = this.treasurePt4X[randomOther];
            this.treasureGenY[4] = this.treasurePt4Y[randomOther];
        }
        cc.log("treasure point:");
        for (let cnt = 0; cnt < 5; cnt++)
            cc.log(this.treasureGenX[cnt], this.treasureGenY[cnt]);
        for (let i = 0; i < 5; i++) {
            let item_tiled = item_layer.getTiledTileAt(this.treasureGenX[i], this.treasureGenY[i], false);
            item_tiled.getComponent(cc.Sprite).spriteFrame = item_tiled.node.treasureSpriteFrame;
            item_tiled.getComponent(cc.RigidBody).onPreSolve = item_tiled.node.treasureContact;
        }
    }
    start() {
    }
    onKeyDown(e) {
        Input[e.keyCode] = 1;
    }

    onKeyUp(e) {
        Input[e.keyCode] = 0;
    }


    update(dt) {
        this.Change_position();
        this.detect_dead();
        var mybomb = this;
        if (Input[cc.macro.KEY.space]) {
            this.player_data = this.player.getComponent("escape_player_controller");
            if (this.bombCD == false && this.player_data.bomb_number != 0) {
                this.Create_bomb();
                setTimeout(function () {
                    mybomb.bombCD = false;
                }, 200)
            }
        }
        this.Time += dt;
        if (this.Time > this.ItemTimeIdx * 5 && this.ItemTimeIdx * 5 + 1 > this.Time) {
            this.ItemTimeIdx += 1;
            cc.log("create!!!");
            this.Create_Item();
        }
    }


    detect_landmine() {
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let layerSize = layer.getLayerSize();
        let mine_layer = tiledMap.getLayer("mine layer");
        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let mine_tiled = mine_layer.getTiledTileAt(i, j, true);
                if (mine_tiled.getComponent(cc.Sprite).spriteFrame != null && mine_tiled.node.is_touched == true && mine_tiled.node.is_trigger == false) {
                    mine_tiled.node.is_trigger = true;
                    mine_tiled.getComponent(cc.Sprite).spriteFrame = mine_tiled.node.landmine_frame_after_contact;
                    //animationDone
                    mine_tiled.schedule(function () {
                        mine_tiled.getComponent(cc.Sprite).spriteFrame = mine_tiled.node.landmine_frame_before_contact;
                    }, 0.2, 23, 0);
                    mine_tiled.schedule(function () {
                        mine_tiled.getComponent(cc.Sprite).spriteFrame = mine_tiled.node.landmine_frame_after_contact;
                    }, 0.2, 23, 0.1);

                    mine_tiled.scheduleOnce(this.landmine_exploded_effect, 5);
                }
            }
        }
    }

    landmine_exploded_effect() {
        this.unscheduleAllCallbacks();
        this.getComponent(cc.Sprite).spriteFrame = null;
        let x = this._x;
        let y = this._y;
        let map = this.node.map;
        let tiledMap = map.getComponent(cc.TiledMap);
        cc.log(tiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let layer2 = tiledMap.getLayer("Tile Layer 1");
        let item_layer = tiledMap.getLayer("item layer");
        let exploded_effect_layer = tiledMap.getLayer("exploded effect layer");
        let layerSize = layer.getLayerSize();
        let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y, true);
        exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
        exploded_effect_tiled.unscheduleAllCallbacks();
        exploded_effect_tiled.scheduleOnce(function () {
            this.getComponent(cc.Sprite).spriteFrame = null;
        }, 0.5);
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let now_x = x - 2 + i;
                let now_y = y - 2 + j;
                if (now_x <= 0 || now_x >= layerSize.width - 1 || now_y <= 0 || now_y >= layerSize.height - 1) {
                    continue;
                }
                cc.log(now_x);
                cc.log(now_y);
                let tiled = layer.getTiledTileAt(now_x, now_y, true);
                let tiled2 = layer2.getTiledTileAt(now_x, now_y, true);
                let item_tiled = item_layer.getTiledTileAt(now_x, now_y, true);
                let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(now_x, now_y, true);
                if (tiled2.getComponent(cc.RigidBody).active) { //wall
                    tiled2.getComponent(cc.RigidBody).active = false;
                    tiled2.gid = 0;
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                    exploded_effect_tiled.unscheduleAllCallbacks();
                    exploded_effect_tiled.scheduleOnce(function () {
                        this.getComponent(cc.Sprite).spriteFrame = null;
                    }, 0.5);
                }
                else if (tiled.getComponent(cc.RigidBody).active) { //box
                    let random_number = Math.floor(Math.random() * 100);
                    let item_sprite = item_tiled.getComponent(cc.Sprite);
                    let body = item_tiled.getComponent(cc.RigidBody);

                    if (random_number < 50) {
                        if (random_number >= 40) { //type 1
                            item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type1;
                        }
                        else if (random_number >= 30) { // type 2
                            item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type2;
                        }
                        else if (random_number >= 20) { //type 3
                            item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type3;
                        }
                        else if (random_number >= 10) { //type 4
                            item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type4;
                        }
                        else { //type 5
                            item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type5;
                        }
                    }
                    else {
                        if (random_number <= 60) {
                            item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type6;
                        }
                        else if (random_number <= 70) {
                            item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type7;
                        }
                        else if (random_number <= 80) {
                            item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type8;
                        }
                        else if (random_number <= 90) {
                            item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type9;
                        }
                        else {
                            item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type10;
                        }
                    }
                    tiled.getComponent(cc.RigidBody).active = false;
                    tiled.getComponent(cc.Sprite).spriteFrame = null;
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                    exploded_effect_tiled.unscheduleAllCallbacks();
                    exploded_effect_tiled.scheduleOnce(function () {
                        this.getComponent(cc.Sprite).spriteFrame = null;
                    }, 0.5);
                }
                else { // empty tiled or other bombs
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                    exploded_effect_tiled.unscheduleAllCallbacks();
                    exploded_effect_tiled.scheduleOnce(function () {
                        this.getComponent(cc.Sprite).spriteFrame = null;
                    }, 0.5);
                }
            }
        }
    }
    Change_position() {
        this.real_position.x = this.player.position.x - this.map.position.x;
        this.real_position.y = this.player.position.y - this.map.position.y;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let tiledSize = tiledMap.getTileSize();
        let height = tiledSize.height * this.node.scaleY;
        let width = tiledSize.width * this.node.scaleX;
        this.revised_position.x = this.real_position.x / width;
        this.revised_position.y = this.real_position.y / height;

        this.otherPlayer_real_position.x = this.otherPlayer.position.x - this.map.position.x;
        this.otherPlayer_real_position.y = this.otherPlayer.position.y - this.map.position.y;
        this.otherPlayer_revised_position.x = this.otherPlayer_real_position.x / width;
        this.otherPlayer_revised_position.y = this.otherPlayer_real_position.y / height;
    }

    Create_bomb() {
        this.bombCD = true;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let layerSize = layer.getLayerSize();
        let mine_layer = tiledMap.getLayer("mine layer");
        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                let bomb_tiled = bomb_layer.getTiledTileAt(i, j, false);
                let mine_tiled = mine_layer.getTiledTileAt(i, j, false);
                if (i > this.revised_position.x - 1 && i < this.revised_position.x && (layerSize.height - j) > this.revised_position.y && (layerSize.height - j) < this.revised_position.y + 1) {
                    let body = bomb_tiled.node.getComponent(cc.RigidBody);
                    if (body.active || mine_tiled.getComponent(cc.Sprite).spriteFrame != null) {
                        break;
                    }
                    let Sprite = bomb_tiled.node.getComponent(cc.Sprite);
                    body.active = true;
                    body.enabledContactListener = true;
                    body.onPreSolve = this.Contact;
                    body.onEndContact = this.endContact;
                    let now_otherPlayer = true;
                    if (i > this.otherPlayer_revised_position.x - 1 && i < this.otherPlayer_revised_position.x && (layerSize.height - j) > this.otherPlayer_revised_position.y && (layerSize.height - j) < this.otherPlayer_revised_position.y + 1) {
                        now_otherPlayer = false;
                    }

                    if (this.player_data.special_bomb_number != 0) {
                        this.player_data.bomb_number -= 1;
                        Sprite.spriteFrame = bomb_tiled.node.special_bomb_frame;
                        this.player_data.special_bomb_number -= 1;
                        bomb_tiled.node.attr({
                            bomb_type: 1,
                            owner: this.player,
                            player1_left: false,
                            player2_left: now_otherPlayer,
                            range: this.player_data.bomb_exploded_range,
                            map: this.map
                        });
                    }
                    else if (this.player_data.extra_special_bomb_number != 0) {
                        this.player_data.bomb_number -= 1;
                        Sprite.spriteFrame = bomb_tiled.node.extra_special_bomb_frame;
                        this.player_data.extra_special_bomb_number -= 1;
                        bomb_tiled.node.attr({
                            bomb_type: 2,
                            owner: this.player,
                            player1_left: false,
                            player2_left: now_otherPlayer,
                            range: this.player_data.bomb_exploded_range,
                            map: this.map
                        });
                    }
                    else if (this.player_data.burning_bomb_number != 0) {
                        this.player_data.bomb_number -= 1;
                        Sprite.spriteFrame = bomb_tiled.node.burning_bomb_frame;
                        this.player_data.burning_bomb_number -= 1;
                        bomb_tiled.node.attr({
                            bomb_type: 3,
                            owner: this.player,
                            player1_left: false,
                            player2_left: now_otherPlayer,
                            range: this.player_data.bomb_exploded_range,
                            map: this.map
                        });
                    }
                    else if (this.player_data.landmine_number != 0) {
                        body.active = false;
                        Sprite = mine_tiled.getComponent(cc.Sprite);
                        Sprite.spriteFrame = mine_tiled.node.landmine_frame_before_contact;
                        this.player_data.landmine_number -= 1;
                        bomb_tiled.node.attr({
                            bomb_type: 4,
                            owner: this.player,
                            player1_left: false,
                            player2_left: now_otherPlayer,
                            range: this.player_data.bomb_exploded_range,
                            map: this.map
                        });
                        mine_tiled.node.attr({
                            player1_left: false,
                            owner: this.player,
                            player2_left: now_otherPlayer,
                            map: this.map,
                            is_trigger: false,
                            is_touched: false
                        })
                    }
                    else {
                        this.player_data.bomb_number -= 1;
                        Sprite.spriteFrame = this.player_data.bomb_frame;
                        bomb_tiled.node.attr({
                            bomb_type: 0,
                            owner: this.player,
                            player1_left: false,
                            player2_left: now_otherPlayer,
                            range: this.player_data.bomb_exploded_range,
                            map: this.map
                        });

                    }
                    let e = this;
                    switch (bomb_tiled.node.bomb_type) {
                        case 0:
                            //Animation
                            this.scheduleOnce(function(){
                                cc.audioEngine.playEffect(this.bomb_sound, false);
                            },this.player_data.bomb_exploded_time)
                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = null;
                            }, 0.4, (e.player_data.bomb_exploded_time / 0.4) - 2, 0);

                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = e.player_data.bomb_frame;
                            }, 0.4, (e.player_data.bomb_exploded_time / 0.4) - 1, 0.1);
                            bomb_tiled.scheduleOnce(this.exploded_effect, this.player_data.bomb_exploded_time);
                            break;
                        case 1:
                            //Animation

                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = null;
                            }, 0.4, e.player_data.bomb_exploded_time / 0.4 - 2, 0);

                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = this.node.special_bomb_frame;
                            }, 0.4, e.player_data.bomb_exploded_time / 0.4 - 1, 0.1);
                            bomb_tiled.scheduleOnce(this.special_exploded_effect, this.player_data.bomb_exploded_time);
                            break;
                        case 2:
                            //Animation
                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = null;
                            }, 0.4, (e.player_data.bomb_exploded_time / 0.4) - 2, 0);

                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = this.node.extra_special_bomb_frame;
                            }, 0.4, (e.player_data.bomb_exploded_time / 0.4) - 1, 0.1);
                            bomb_tiled.scheduleOnce(this.extra_special_exploded_effect, this.player_data.bomb_exploded_time);
                            break;
                        case 3:
                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = null;
                            }, 0.4, e.player_data.bomb_exploded_time / 0.4 - 2, 0);

                            bomb_tiled.schedule(function () {
                                bomb_tiled.getComponent(cc.Sprite).spriteFrame = this.node.burning_bomb_frame;
                            }, 0.4, e.player_data.bomb_exploded_time / 0.4 - 1, 0.1);
                            bomb_tiled.scheduleOnce(this.burning_bomb_exploded_effect, this.player_data.bomb_exploded_time);
                            break;
                    }
                }
            }
        }
    }


    exploded_effect() {
        this.node.owner.getComponent("escape_player_controller").bomb_number += 1;
        this.getComponent(cc.Sprite).spriteFrame = null;
        this.getComponent(cc.RigidBody).active = false;
        let x = this._x;
        let y = this._y;
        let map = this.node.map;
        let tiledMap = map.getComponent(cc.TiledMap);
        cc.log(tiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let layer2 = tiledMap.getLayer("Tile Layer 1");
        let transparent_layer = tiledMap.getLayer("transparentLayer");
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let exploded_effect_layer = tiledMap.getLayer("exploded effect layer");
        let item_layer = tiledMap.getLayer("item layer");
        let layerSize = layer.getLayerSize();
        let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y, true);
        exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
        exploded_effect_tiled.unscheduleAllCallbacks();
        exploded_effect_tiled.scheduleOnce(function () {
            this.getComponent(cc.Sprite).spriteFrame = null;
        }, 0.5);

        for (let i = 1; i <= this.node.range; i++) {
            if (x + i >= layerSize.width - 1) {
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y, true);
            let tiled2 = layer2.getTiledTileAt(x + i, y, true);
            let tiled3 = transparent_layer.getTiledTileAt(x + i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x + i, y, true);
            if (tiled2.getComponent(cc.RigidBody).active || tiled3.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (x - i < 0) {
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y, true);
            let tiled2 = layer2.getTiledTileAt(x - i, y, true);
            let tiled3 = transparent_layer.getTiledTileAt(x - i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x - i, y, true);
            if (tiled2.getComponent(cc.RigidBody).active || tiled3.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (y + i >= layerSize.height - 1) {
                break;
            }
            let tiled = layer.getTiledTileAt(x, y + i, true);
            let tiled2 = layer2.getTiledTileAt(x, y + i, true);
            let tiled3 = transparent_layer.getTiledTileAt(x, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y + i, true);
            if (tiled2.getComponent(cc.RigidBody).active || tiled3.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (y - i < 0) {
                break;
            }
            let tiled = layer.getTiledTileAt(x, y - i, true);
            let tiled2 = layer2.getTiledTileAt(x, y - i, true);
            let tiled3 = transparent_layer.getTiledTileAt(x, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y - i, true);
            if (tiled2.getComponent(cc.RigidBody).active || tiled3.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }
    }

    special_exploded_effect() {
        //cc.log(this);
        this.getComponent(cc.Sprite).spriteFrame = null;
        this.getComponent(cc.RigidBody).active = false;
        this.node.owner.getComponent("escape_player_controller").bomb_number += 1;
        let x = this._x;
        let y = this._y;
        let map = this.node.map;
        let tiledMap = map.getComponent(cc.TiledMap);
        //cc.log(tiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let layer2 = tiledMap.getLayer("Tile Layer 1");
        let item_layer = tiledMap.getLayer("item layer");
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let exploded_effect_layer = tiledMap.getLayer("exploded effect layer");
        let layerSize = layer.getLayerSize();
        let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y, true);
        exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
        exploded_effect_tiled.unscheduleAllCallbacks();
        exploded_effect_tiled.scheduleOnce(function () {
            this.getComponent(cc.Sprite).spriteFrame = null;
        }, 0.5);

        for (let i = 1; i <= this.node.range; i++) {
            if (x + i >= layerSize.width - 1) {
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y, true);
            let tiled2 = layer2.getTiledTileAt(x + i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x + i, y, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if (i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (x - i < 0) {
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y, true);
            let tiled2 = layer2.getTiledTileAt(x - i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x - i, y, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if (i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (y + i >= layerSize.height - 1) {
                break;
            }
            let tiled = layer.getTiledTileAt(x, y + i, true);
            let tiled2 = layer2.getTiledTileAt(x, y + i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + i, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if (i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (y - i < 0) {
                break;
            }
            let tiled = layer.getTiledTileAt(x, y - i, true);
            let tiled2 = layer2.getTiledTileAt(x, y - i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - i, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if (i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 0.5);
            }
        }
    }

    extra_special_exploded_effect() {
        this.getComponent(cc.Sprite).spriteFrame = null;
        this.getComponent(cc.RigidBody).active = false;
        this.node.owner.getComponent("escape_player_controller").bomb_number += 1;
        let x = this._x;
        let y = this._y;
        let map = this.node.map;
        let tiledMap = map.getComponent(cc.TiledMap);
        cc.log(tiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let layer2 = tiledMap.getLayer("Tile Layer 1");
        let item_layer = tiledMap.getLayer("item layer");
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let exploded_effect_layer = tiledMap.getLayer("exploded effect layer");
        let layerSize = layer.getLayerSize();
        let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y, true);
        exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
        exploded_effect_tiled.unscheduleAllCallbacks();
        exploded_effect_tiled.scheduleOnce(function () {
            this.getComponent(cc.Sprite).spriteFrame = null;
        }, 0.5);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let now_x = x - 1 + i;
                let now_y = y - 1 + j;
                if (now_x <= 0 || now_x >= layerSize.width - 1 || now_y <= 0 || now_y >= layerSize.height - 1) {
                    continue;
                }
                cc.log(now_x);
                cc.log(now_y);
                let tiled = layer.getTiledTileAt(now_x, now_y, true);
                let tiled2 = layer2.getTiledTileAt(now_x, now_y, true);
                let item_tiled = item_layer.getTiledTileAt(now_x, now_y, true);
                let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(now_x, now_y, true);
                if (tiled2.getComponent(cc.RigidBody).active) { //wall
                    tiled2.getComponent(cc.RigidBody).active = false;
                    tiled2.gid = 0;
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                    exploded_effect_tiled.unscheduleAllCallbacks();
                    exploded_effect_tiled.scheduleOnce(function () {
                        this.getComponent(cc.Sprite).spriteFrame = null;
                    }, 0.5);
                }
                else if (tiled.getComponent(cc.RigidBody).active) { //box
                    let random_number = Math.floor(Math.random() * 100);
                    let item_sprite = item_tiled.getComponent(cc.Sprite);
                    let body = item_tiled.getComponent(cc.RigidBody);

                    if (random_number < 50) {
                        if (random_number >= 40) { //type 1
                            item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type1;
                        }
                        else if (random_number >= 30) { // type 2
                            item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type2;
                        }
                        else if (random_number >= 20) { //type 3
                            item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type3;
                        }
                        else if (random_number >= 10) { //type 4
                            item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type4;
                        }
                        else { //type 5
                            item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type5;
                        }
                    }
                    else {
                        if (random_number <= 60) {
                            item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type6;
                        }
                        else if (random_number <= 70) {
                            item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type7;
                        }
                        else if (random_number <= 80) {
                            item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type8;
                        }
                        else if (random_number <= 90) {
                            item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type9;
                        }
                        else {
                            item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                            body.onPreSolve = item_tiled.node.contact_type10;
                        }
                    }
                    tiled.getComponent(cc.RigidBody).active = false;
                    tiled.getComponent(cc.Sprite).spriteFrame = null;
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                    exploded_effect_tiled.unscheduleAllCallbacks();
                    exploded_effect_tiled.scheduleOnce(function () {
                        this.getComponent(cc.Sprite).spriteFrame = null;
                    }, 0.5);
                }
                else { // empty tiled or other bombs
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                    exploded_effect_tiled.unscheduleAllCallbacks();
                    exploded_effect_tiled.scheduleOnce(function () {
                        this.getComponent(cc.Sprite).spriteFrame = null;
                    }, 0.5);
                }
            }
        }
    }

    burning_bomb_exploded_effect() {
        this.node.owner.getComponent("escape_player_controller").bomb_number += 1;
        this.getComponent(cc.Sprite).spriteFrame = null;
        this.getComponent(cc.RigidBody).active = false;
        let x = this._x;
        let y = this._y;
        let map = this.node.map;
        let tiledMap = map.getComponent(cc.TiledMap);
        cc.log(tiledMap);
        let layer = tiledMap.getLayer("playerstart");
        let layer2 = tiledMap.getLayer("Tile Layer 1");
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let exploded_effect_layer = tiledMap.getLayer("exploded effect layer");
        let item_layer = tiledMap.getLayer("item layer");
        let layerSize = layer.getLayerSize();
        let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y, true);
        exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
        exploded_effect_tiled.unscheduleAllCallbacks();
        exploded_effect_tiled.scheduleOnce(function () {
            this.getComponent(cc.Sprite).spriteFrame = null;
        }, 5);

        for (let i = 1; i <= this.node.range; i++) {
            if (x + i >= layerSize.width - 1) {
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y, true);
            let tiled2 = layer2.getTiledTileAt(x + i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x + i, y, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (x - i < 0) {
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y, true);
            let tiled2 = layer2.getTiledTileAt(x - i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x - i, y, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (y + i >= layerSize.height - 1) {
                break;
            }
            let tiled = layer.getTiledTileAt(x, y + i, true);
            let tiled2 = layer2.getTiledTileAt(x, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y + i, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
            }
        }


        for (let i = 1; i <= this.node.range; i++) {
            if (y - i < 0) {
                break;
            }
            let tiled = layer.getTiledTileAt(x, y - i, true);
            let tiled2 = layer2.getTiledTileAt(x, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y - i, true);
            if (tiled2.getComponent(cc.RigidBody).active) { //wall
                if (i != 1) {
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                }
                break;
            }
            if (tiled.getComponent(cc.RigidBody).active) { // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if (random_number < 25) {
                    if (random_number >= 20) { //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if (random_number >= 15) { // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if (random_number >= 10) { //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if (random_number >= 5) { //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else { //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if (random_number <= 40) {
                    if (random_number <= 28) {
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if (random_number <= 31) {
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if (random_number <= 33) {
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if (random_number <= 35) {
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
                break;
            }
            else { // empty tiled or other bombs
                if (i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.burning_effect;
                exploded_effect_tiled.unscheduleAllCallbacks();
                exploded_effect_tiled.scheduleOnce(function () {
                    this.getComponent(cc.Sprite).spriteFrame = null;
                }, 5);
            }
        }
    }


    Contact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name == "player" && selfCollider.node.player1_left == false) {
            contact.disabled = true;
        }
        if (otherCollider.node.name == "player2" && selfCollider.node.player2_left == false) {
            contact.disabled = true;
        }
    }
    endContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name == "player" && selfCollider.node.player1_left == false) {
            selfCollider.node.player1_left = true;
        }
        if (otherCollider.node.name == "player2" && selfCollider.node.player2_left == false) {
            selfCollider.node.player2_left = true;
        }
        //selfCollider.node.left = true;
    }

    detect_dead() {
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let layer = tiledMap.getLayer("exploded effect layer");
        let layerSize = layer.getLayerSize();
        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                if (i > this.revised_position.x - 1 && i < this.revised_position.x && (layerSize.height - j) > this.revised_position.y && (layerSize.height - j) < this.revised_position.y + 1) {
                    let exploded_effect_tiled = layer.getTiledTileAt(i, j, true);
                    if (exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame != null && this.player_data.is_invincible == false) {
                        if (this.player.getChildByName("shield").active) {
                            this.player.getComponent(cc.PhysicsCircleCollider).unscheduleAllCallbacks();
                            this.player.getChildByName("shield").active = false;
                            this.player_data.is_invincible = true;
                            this.player_data.blick();
                            this.player_data.unscheduleAllCallbacks();
                            this.player_data.scheduleOnce(function () {
                                this.is_invincible = false;
                            }, 2);
                        }
                        else {
                            if (!this.player_data.end) {
                                this.player_data.end = true;
                                record.winType = "suicide";
                                record.winner = 'player2'
                                this.player_data.endGame();
                            }

                        }
                    }
                }
                if (i > this.otherPlayer_revised_position.x - 1 && i < this.otherPlayer_revised_position.x && (layerSize.height - j) > this.otherPlayer_revised_position.y && (layerSize.height - j) < this.otherPlayer_revised_position.y + 1) {
                    let exploded_effect_tiled = layer.getTiledTileAt(i, j, true);
                    if (exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame != null && this.otherPlayer.getComponent("escape_ghost_controller").is_stunned == false) {
                        this.otherPlayer.getComponent("escape_ghost_controller").is_stunned = true;
                        this.stunned_number++;
                        if (this.stunned_number > record.userAchievement[15]) {
                            record.userAchievement[15] = this.stunned_number;
                        }
                        if(Achievement_level_list[15] != 3){
                            if(record.userAchievement[15] >= Achievement_restrict_list[15][Achievement_level_list[15]]){
                                record.updateAchievementList[15] = Achievement_level_list[15] + 1;
                                Achievement_level_list[15] += 1;
                            }
                        }
                        this.otherPlayer.getComponent("escape_ghost_controller").scheduleOnce(function () {
                            this.is_stunned = false;
                        }, 2);
                    }
                }
            }
        }
    }
    //random create item
    Create_Item() {
        let successCnt = 0;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let layer = tiledMap.getLayer("exploded effect layer");
        let layer2 = tiledMap.getLayer("Tile Layer 1");
        let layerSize = layer.getLayerSize();
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let item_layer = tiledMap.getLayer("item layer");
        let transparent_layer = tiledMap.getLayer("transparentLayer");//wait to do
        cc.log(transparent_layer);
        let treasure_layer = tiledMap.getLayer("treasureLayer");//wait to do
        let checksum = 0;
        for (let i = 1; i < layerSize.width - 1; i++) {
            for (let j = 1; j < layerSize.height - 1; j++) {
                let item_tiled = item_layer.getTiledTileAt(i, j, false);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                if (item_sprite.spriteFrame != null) {
                    if (item_sprite.spriteFrame != item_tiled.node.treasureSpriteFrame)
                        checksum++;
                }
            }
        }
        if (checksum >= 3) {
            return;
        }
        while (successCnt < 1) {
            //for debug
            // successCnt += 1;
            // let ItemX = 9;
            // let ItemY = 9;
            let ItemX = Math.floor(Math.random() * 100) % 16 + 1;
            let ItemY = Math.floor(Math.random() * 100) % 16 + 1;
            if (!(ItemX > 0 && ItemX < layerSize.width - 1 && ItemY > 0 && ItemY < layerSize.height - 1)) {
                continue;//out of map
            }

            if (ItemX > this.otherPlayer_revised_position.x - 1 && ItemX < this.otherPlayer_revised_position.x && (layerSize.height - ItemY) > this.otherPlayer_revised_position.y && (layerSize.height - ItemY) < this.otherPlayer_revised_position.y + 1) {
                cc.log("create on player2");
                continue;//與player2在同一格
            }

            if (ItemX > this.revised_position.x - 1 && ItemX < this.revised_position.x && (layerSize.height - ItemY) > this.revised_position.y && (layerSize.height - ItemY) < this.revised_position.y + 1) {
                cc.log("create on player1");
                continue;//與player1在同一格
            }

            let tiled2 = layer2.getTiledTileAt(ItemX, ItemY, false);
            if (tiled2.getComponent(cc.RigidBody).active) {
                cc.log("create on wall!");
                continue;
            }

            let transparent_tiled = transparent_layer.getTiledTileAt(ItemX, ItemY, false);
            cc.log(ItemX, ItemY, transparent_tiled);
            if (transparent_tiled.gid != 0)
                continue;
            let bomb_tiled = bomb_layer.getTiledTileAt(ItemX, ItemY, false);
            let body = bomb_tiled.node.getComponent(cc.RigidBody);
            if (body.active) //have bomb;
                continue;
            // 判斷treasure
            let item_tiled = item_layer.getTiledTileAt(ItemX, ItemY, true);
            let item_sprite = item_tiled.getComponent(cc.Sprite);
            if (item_sprite.spriteFrame != null) // have item
                continue;

            let prob = Math.floor(Math.random() * 100) + 1;
            let item_body = item_tiled.getComponent(cc.RigidBody);
            if (prob < 33) {
                item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                item_body.onPreSolve = item_tiled.node.contact_type1;
            } else if (prob < 66) {
                item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                item_body.onPreSolve = item_tiled.node.contact_type4;
            } else {
                item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                item_body.onPreSolve = item_tiled.node.contact_type10;
            }
            successCnt += 1;
            // if(!body.active) {//沒有炸彈
            //     // create item
            //     let item_tiled = item_layer.getTiledTileAt(ItemX, ItemY, true);
            //     let item_sprite = item_tiled.getComponent(cc.Sprite);
            //     if(item_sprite.spriteFrame!=null) // have item
            //         continue;
            //     cc.log("create!");
            //     let prob = Math.floor(Math.random() * 100) + 1;
            //     let item_body = item_tiled.getComponent(cc.RigidBody);
            //     if(prob < 90) {
            //         item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
            //         item_body.onPreSolve = item_tiled.node.contact_type2;
            //     } else {
            //         item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
            //         item_body.onPreSolve = item_tiled.node.contact_type10;
            //     }
            //     successCnt += 1;
            // }

        }
    }

}
