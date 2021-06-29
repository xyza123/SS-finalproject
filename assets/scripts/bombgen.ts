// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    map:cc.Node = null;

     @property(cc.Node)
     player:cc.Node = null;

     @property(cc.Node)
     timeText: cc.Node = null;//only player1 need

     @property(cc.SpriteFrame)
     bombTest: cc.SpriteFrame = null;
    @property(cc.Node)
    otherPlayer: cc.Node = null;

     private real_position:cc.Vec2 = cc.v2(0,0);
     private revised_position:cc.Vec2 = cc.v2(0,0);

    player_data = null;
    player2_data = null;
    private otherPlayer_real_position:cc.Vec2 = cc.v2(0,0);
    private otherPlayer_revised_position:cc.Vec2 = cc.v2(0,0);
    Time: number = 0;
    preTime: number = 0;//not use now
    timeSpot: number[] = [3,8,13,21,29,37];//not use now
    bombNum: number[] = [1,3,5,6,7,8];//not use now
    bombSitX: number[] = [9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    bombSitY: number[] = [9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    moveX: number[] = [1,0,-1,0,0];
    moveY: number[] = [0,1,0,-1,0];
    TimeIdx:number = 0;//not use now
    ItemTimeIdx: number = 1;
    NewTimeSpot: number = 5;
    preGenNum: number = 23;

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
        //this.setItem();
        //cc.log(this);
        for(let i=0;i<this.preGenNum;i++){
            let random_number = Math.floor(Math.random() * 100) % 16 + 1;
            let random_number2 = Math.floor(Math.random() * 100) % 16 + 1;
            this.bombSitX[i] = random_number;
            this.bombSitY[i] = random_number2;
        }
    }

    Change_position(){
        this.real_position.x = this.player.position.x - this.map.position.x;
        this.real_position.y = this.player.position.y - this.map.position.y;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let tiledSize = tiledMap.getTileSize();
        let height = tiledSize.height * this.node.scaleY;
        let width = tiledSize.width * this.node.scaleX;
        this.revised_position.x = this.real_position.x / width;
        this.revised_position.y = this.real_position.y / height;

        if(this.otherPlayer.active){
            this.otherPlayer_real_position.x = this.otherPlayer.position.x - this.map.position.x;
            this.otherPlayer_real_position.y = this.otherPlayer.position.y - this.map.position.y;
            this.otherPlayer_revised_position.x = this.otherPlayer_real_position.x / width;
            this.otherPlayer_revised_position.y = this.otherPlayer_real_position.y / height;
        }
    }

    start () {
        
    }

    update(dt){
        this.updateTime();
        this.player_data = this.player.getComponent("survive_player_controller");
        if(this.otherPlayer.active){
            this.player2_data = this.otherPlayer.getComponent("survive_player2_controller");
        }
        this.Change_position();
        this.detect_dead();
        if(this.otherPlayer.active){
            if(this.player_data._alive && this.player2_data._alive){
                this.Time += dt;
            }
        }
        else {
            if(this.player_data._alive){
                this.Time += dt;
            }
        }
        /*if(this.timeSpot[this.TimeIdx] < this.Time && this.timeSpot[this.TimeIdx]+1 > this.Time){
            if(this.Time - this.preTime > 1){
                this.preTime = this.Time;
                this.Create_bomb();
                this.TimeIdx+=1;
            }
        }*/
        if(this.NewTimeSpot < this.Time && this.NewTimeSpot+1 > this.Time) {
            let hardRange = 4 - Math.floor(this.Time/20);
            if(hardRange < 0) hardRange = 0;
            this.NewTimeSpot += Math.floor(Math.random() * 100) % 3 + 1 + hardRange;
            cc.log("create,next=",this.NewTimeSpot);
            this.Create_bomb();
        }


        if(this.Time > this.ItemTimeIdx*5 && this.ItemTimeIdx*5 + 1 > this.Time ){
            this.ItemTimeIdx += 1;
            this.Create_Item();
        }

    }

    Create_Item(){
        let successCnt = 0;
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let layer = tiledMap.getLayer("exploded effect layer");
        let layerSize = layer.getLayerSize();
        let bomb_layer = tiledMap.getLayer("bomb layer");
        let item_layer = tiledMap.getLayer("item layer");
        let checksum = 0;
        for(let i = 1;i < layerSize.width-1 ; i++){
            for(let j = 1; j<layerSize.height-1; j++){
                let item_tiled = item_layer.getTiledTileAt(i, j, false);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                if(item_sprite.spriteFrame != null) {
                    checksum++;
                }
            }
        }
        if(checksum>=5){
            return ;
        }
        while(successCnt < 1){
            //for debug
            // successCnt += 1;
            // let ItemX = 9;
            // let ItemY = 9;
            let ItemX = Math.floor(Math.random() * 100) % 16 + 1;
            let ItemY = Math.floor(Math.random() * 100) % 16 + 1;
            if(!(ItemX>0 && ItemX < layerSize.width-1 && ItemY>0 && ItemY<layerSize.height-1)) {
                continue;//out of map
            }
            if(this.otherPlayer.active){
                if(ItemX > this.otherPlayer_revised_position.x - 1 && ItemX < this.otherPlayer_revised_position.x && (layerSize.height - ItemY) > this.otherPlayer_revised_position.y && (layerSize.height - ItemY) < this.otherPlayer_revised_position.y + 1) {
                    cc.log("create on player2");
                    continue;//與player2在同一格
                }
            }
            if(ItemX > this.revised_position.x - 1 && ItemX < this.revised_position.x && (layerSize.height - ItemY) > this.revised_position.y && (layerSize.height - ItemY) < this.revised_position.y + 1) {
                continue;//與player1在同一格
            } else {
                let bomb_tiled = bomb_layer.getTiledTileAt(ItemX, ItemY, false);
                let body = bomb_tiled.node.getComponent(cc.RigidBody);
                if(!body.active) {//沒有炸彈
                    // create item
                    let item_tiled = item_layer.getTiledTileAt(ItemX, ItemY, true);
                    let item_sprite = item_tiled.getComponent(cc.Sprite);
                    if(item_sprite.spriteFrame!=null) // have item
                        continue;
                    cc.log("create!");
                    let prob = Math.floor(Math.random() * 100) + 1;
                    let item_body = item_tiled.getComponent(cc.RigidBody);
                    if(prob < 90) {
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        item_body.onPreSolve = item_tiled.node.contact_type2;
                    } else {
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        item_body.onPreSolve = item_tiled.node.contact_type10;
                    }
                    successCnt += 1;
                }
            }
        }

    }

    Create_bomb(){
        let successCreate = 0;
        let needBomb = Math.floor(this.Time/10) + 1;
        if(needBomb>12) needBomb = 12; //balance
        //needBomb = 1;//debug
        for(let cnt = 0;cnt<this.preGenNum;cnt++){
            cc.log("cnt=",cnt,"success=",successCreate);

            if(successCreate >= needBomb)
                break;

            let tiledMap = this.map.getComponent(cc.TiledMap);
            let layer = tiledMap.getLayer("playerstart");
            let bomb_layer = tiledMap.getLayer("bomb layer");
            let layerSize = layer.getLayerSize();
            let item_layer = tiledMap.getLayer("item layer");
            if(this.bombSitX[cnt]>0 && this.bombSitX[cnt]<layerSize.width-1 && this.bombSitY[cnt]>0 && this.bombSitY[cnt]<layerSize.height-1){
                //if not around player && not on the Item
                let item_tiled = item_layer.getTiledTileAt(this.bombSitX[cnt], this.bombSitY[cnt], false);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                if(item_sprite.spriteFrame != null) {
                    cc.log("create on item!");
                    continue;
                }
                
                let aroundPlayer = false;
                for(let idx=0;idx<5;idx++){
                    let playerSitX = this.revised_position.x + this.moveX[idx];
                    let playerSitY = this.revised_position.y + this.moveY[idx];
                    if(this.bombSitX[cnt] > playerSitX - 1 && this.bombSitX[cnt] < playerSitX && (layerSize.height - this.bombSitY[cnt]) > playerSitY && (layerSize.height - this.bombSitY[cnt]) < playerSitY + 1) {
                        cc.log("create around player!");
                        aroundPlayer = true;
                        break;
                    }
                }
                if(aroundPlayer) {
                    continue;
                }
                if(this.otherPlayer.active){
                    cc.log("here!");
                    for(let idx=0;idx<5;idx++){
                        let playerSitX = this.otherPlayer_revised_position.x + this.moveX[idx];
                        let playerSitY = this.otherPlayer_revised_position.y + this.moveY[idx];
                        if(this.bombSitX[cnt] > playerSitX - 1 && this.bombSitX[cnt] < playerSitX && (layerSize.height - this.bombSitY[cnt]) > playerSitY && (layerSize.height - this.bombSitY[cnt]) < playerSitY + 1) {
                            cc.log("create around player2!");
                            aroundPlayer = true;
                            break;
                        }
                    }
                }
                if(aroundPlayer) {
                    continue;
                }
                // if(this.bombSitX[cnt] > this.revised_position.x - 1 && this.bombSitX[cnt] < this.revised_position.x && (layerSize.height - this.bombSitY[cnt]) > this.revised_position.y && (layerSize.height - this.bombSitY[cnt]) < this.revised_position.y + 1) {
                //     cc.log("create on player!");
                //     continue;
                // }

                
                let bomb_tiled = bomb_layer.getTiledTileAt(this.bombSitX[cnt], this.bombSitY[cnt], false);
                let body = bomb_tiled.node.getComponent(cc.RigidBody);
                if(!body.active){
                    successCreate+=1;
                    let Sprite = bomb_tiled.node.getComponent(cc.Sprite);
                    body.active = true;
                    body.enabledContactListener = true;
                    body.onPreSolve = this.Contact;
                    body.onEndContact = this.endContact;
                    let prob = Math.floor(Math.random() * 100) + 1;
                    cc.log("prob:",prob);
                    let hardline = 90 - Math.floor(this.Time / 5);
                    if(prob < hardline){ 
                        Sprite.spriteFrame = bomb_tiled.node.bomb_frame;
                        bomb_tiled.node.attr({
                            bomb_type: 0,
                            player1_left: true,
                            player2_left: true,
                            range: 20,
                            map: this.map
                        });
                        // let BombAnima = this; 
                        // bomb_tiled.scheduleOnce(function(){
                        //     let Spr = this.node.getComponent(cc.Sprite);
                        //     Spr.spriteFrame = BombAnima.bombTest;
                        // },1.2)
                        // bomb_tiled.scheduleOnce(function(){
                        //     let Spr = this.node.getComponent(cc.Sprite);
                        //     Spr.spriteFrame = this.node.bomb_frame;
                        // },1.8)
                        bomb_tiled.scheduleOnce(this.exploded_effect, 2);
                   } else {
                        Sprite.spriteFrame = bomb_tiled.node.special_bomb_frame;
                        bomb_tiled.node.attr({
                            bomb_type: 1,
                            player1_left: true,
                            player2_left: true,
                            range: 20,
                            map: this.map
                        });
                        bomb_tiled.scheduleOnce(this.special_exploded_effect, 2);
                    }
                }
            }
        }
        for(let i=0;i<this.preGenNum;i++){
            let random_number = Math.floor(Math.random() * 100) % 16 + 1;
            let random_number2 = Math.floor(Math.random() * 100) % 16 + 1;
            this.bombSitX[i] = random_number;
            this.bombSitY[i] = random_number2;
        }
        //cc.log("gen finish!");
    }

    exploded_effect(){
        cc.log(this);
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
        exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
        exploded_effect_tiled.unscheduleAllCallbacks();
        exploded_effect_tiled.scheduleOnce(function(){
            this.getComponent(cc.Sprite).spriteFrame = null;
        },0.5);

        for(let i = 1; i<= this.node.range; i++){
            if(x + i >= layerSize.width - 1){
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y, true);
            let tiled2 = layer2.getTiledTileAt(x + i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x + i, y, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
                break;
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }


        for(let i = 1; i<= this.node.range; i++){
            if(x - i < 0){
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y, true);
            let tiled2 = layer2.getTiledTileAt(x - i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x - i, y, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - (i-1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
                break;
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }


        for(let i = 1; i<= this.node.range; i++){
            if(y + i >= layerSize.height - 1){
                break;
            }
            let tiled = layer.getTiledTileAt(x, y + i, true);
            let tiled2 = layer2.getTiledTileAt(x, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y + i, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
                break;
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }


        for(let i = 1; i<= this.node.range; i++){
            if(y - i < 0){
                break;
            }
            let tiled = layer.getTiledTileAt(x, y - i, true);
            let tiled2 = layer2.getTiledTileAt(x, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y - i, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
                break;
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }
    }

    special_exploded_effect(){
        //cc.log(this);
        cc.log("in special!");
        this.getComponent(cc.Sprite).spriteFrame = null;
        this.getComponent(cc.RigidBody).active = false;
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
        exploded_effect_tiled.scheduleOnce(function(){
            this.getComponent(cc.Sprite).spriteFrame = null;
        },0.5);
        for(let i = 1; i <= this.node.range; i++){
            if(x + i >= layerSize.width - 1 || y + i >= layerSize.height - 1){
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y + i, true);
            if(!tiled.getComponent(cc.RigidBody).active) { // not box
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }

        for(let i = 1; i <= this.node.range; i++){
            if(x + i >= layerSize.width - 1 || y - i <= 0){
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y - i, true);
            if(!tiled.getComponent(cc.RigidBody).active) { // not box
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }

        for(let i = 1; i <= this.node.range; i++){
            if(x - i <= 0 || y - i <= 0){
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y - i, true);
            if(!tiled.getComponent(cc.RigidBody).active) { // not box
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }

        for(let i = 1; i <= this.node.range; i++){
            if(x - i <= 0 || y + i >= layerSize.height - 1){
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y + i, true);
            if(!tiled.getComponent(cc.RigidBody).active) { // not box
                exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_center;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }







        for(let i = 1; i<= this.node.range; i++){
            if(x + i >= layerSize.width - 1){
                break;
            }
            let tiled = layer.getTiledTileAt(x + i, y, true);
            let tiled2 = layer2.getTiledTileAt(x + i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x + i, y, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x + (i - 1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if(i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_right_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }


        for(let i = 1; i<= this.node.range; i++){
            if(x - i < 0){
                break;
            }
            let tiled = layer.getTiledTileAt(x - i, y, true);
            let tiled2 = layer2.getTiledTileAt(x - i, y, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - i, y, true);
            let item_tiled = item_layer.getTiledTileAt(x - i, y, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x - (i-1), y, true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if(i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_left_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_horizontal;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }


        for(let i = 1; i<= this.node.range; i++){
            if(y + i >= layerSize.height - 1){
                break;
            }
            let tiled = layer.getTiledTileAt(x, y + i, true);
            let tiled2 = layer2.getTiledTileAt(x, y + i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y + i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + i, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y + (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                cc.log(random_number);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if(i != this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_down_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }


        for(let i = 1; i<= this.node.range; i++){
            if(y - i < 0){
                break;
            }
            let tiled = layer.getTiledTileAt(x, y - i, true);
            let tiled2 = layer2.getTiledTileAt(x, y - i, true);
            let item_tiled = item_layer.getTiledTileAt(x, y - i, true);
            let exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - i, true);
            if(tiled2.getComponent(cc.RigidBody).active){ //wall
                if(i != 1){
                    exploded_effect_tiled = exploded_effect_layer.getTiledTileAt(x, y - (i - 1), true);
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                }
                break;
            }
            if(tiled.getComponent(cc.RigidBody).active){ // box
                let random_number = Math.floor(Math.random() * 100);
                let item_sprite = item_tiled.getComponent(cc.Sprite);
                let body = item_tiled.getComponent(cc.RigidBody);
                if(random_number < 25){
                    if(random_number >= 20){ //type 1
                        item_sprite.spriteFrame = item_tiled.node.type1_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type1;
                    }
                    else if(random_number >= 15){ // type 2
                        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type2;
                    }
                    else if(random_number >= 10){ //type 3
                        item_sprite.spriteFrame = item_tiled.node.type3_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type3;
                    }
                    else if(random_number >= 5){ //type 4
                        item_sprite.spriteFrame = item_tiled.node.type4_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type4;
                    }
                    else{ //type 5
                        item_sprite.spriteFrame = item_tiled.node.type5_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type5;
                    }
                }
                else if( random_number <= 40){
                    if(random_number <= 28){
                        item_sprite.spriteFrame = item_tiled.node.type6_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type6;
                    }
                    else if(random_number <= 31){
                        item_sprite.spriteFrame = item_tiled.node.type7_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type7;
                    }
                    else if(random_number <= 33){
                        item_sprite.spriteFrame = item_tiled.node.type8_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type8;
                    }
                    else if(random_number <= 35){
                        item_sprite.spriteFrame = item_tiled.node.type9_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type9;
                    }
                    else{
                        item_sprite.spriteFrame = item_tiled.node.type10_item_frame;
                        body.onPreSolve = item_tiled.node.contact_type10;
                    }
                }
                tiled.getComponent(cc.RigidBody).active = false;
                tiled.getComponent(cc.Sprite).spriteFrame = null;
                if(i!=this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                else 
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                exploded_effect_tiled.unscheduleAllCallbacks();  
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
            else{ // empty tiled or other bombs
                if(i == this.node.range)
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_up_end;
                else
                    exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame = exploded_effect_tiled.node.exploded_effect_vertical;
                exploded_effect_tiled.unscheduleAllCallbacks();   
                exploded_effect_tiled.scheduleOnce(function(){
                    this.getComponent(cc.Sprite).spriteFrame = null;
                },0.5);
            }
        }
    }




    Contact(contact, selfCollider, otherCollider){
        if(otherCollider.node.name == "player" && selfCollider.node.player1_left == false){
            contact.disabled = true;
        }
        if(otherCollider.node.name == "player2" && selfCollider.node.player2_left == false){
            contact.disabled = true;
        }
    }
    endContact(contact, selfCollider, otherCollider){
        if(otherCollider.node.name == "player" && selfCollider.node.player1_left == false){
            selfCollider.node.player1_left = true;
        }
        if(otherCollider.node.name == "player2" && selfCollider.node.player2_left == false){
            selfCollider.node.player2_left = true;
        }
        //selfCollider.node.left = true;
    }

    detect_dead(){
        //cc.log("in detect");
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let layer = tiledMap.getLayer("exploded effect layer");
        let layerSize = layer.getLayerSize();
        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                if(i > this.revised_position.x - 1 && i < this.revised_position.x && (layerSize.height - j) > this.revised_position.y && (layerSize.height - j) < this.revised_position.y + 1){
                    //cc.log("i=",i,"j=",j);
                    let exploded_effect_tiled = layer.getTiledTileAt(i, j, true);
                    //player1
                    if(exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame != null && this.player_data.is_invincible == false){
                        if(this.player.getChildByName("shield").active){
                            this.player.getComponent(cc.PhysicsCircleCollider).unscheduleAllCallbacks();
                            this.player.getChildByName("shield").active = false;
                            this.player_data.is_invincible = true;
                            this.player_data.unscheduleAllCallbacks();
                            this.player_data.scheduleOnce(function(){
                                this.is_invincible = false;
                            },2);
                        }
                        else{
                            this.player_data._alive = false;
                            cc.log("this.player_data._alive", this.player_data._alive);
                        }
                    }
                }
                //player2
                if(this.otherPlayer.active == false) {
                    continue;
                }
                if(i > this.otherPlayer_revised_position.x - 1 && i < this.otherPlayer_revised_position.x && (layerSize.height - j) > this.otherPlayer_revised_position.y && (layerSize.height - j) < this.otherPlayer_revised_position.y + 1){
                    let exploded_effect_tiled = layer.getTiledTileAt(i, j, true);
                    if(exploded_effect_tiled.getComponent(cc.Sprite).spriteFrame != null && this.player2_data.is_invincible == false){
                        if(this.otherPlayer.getChildByName("shield").active){
                            this.otherPlayer.getComponent(cc.PhysicsCircleCollider).unscheduleAllCallbacks();
                            this.otherPlayer.getChildByName("shield").active = false;
                            this.player2_data.is_invincible = true;
                            this.player2_data.unscheduleAllCallbacks();
                            this.player2_data.scheduleOnce(function(){
                                this.is_invincible = false;
                            },2);
                        }
                        else{
                            this.player2_data._alive = false;
                            cc.log("this.player_data._alive", this.player2_data._alive);
                        }
                    }
                }
            }
        }
    }
    //for debug
    setItem(){
        let tiledMap = this.map.getComponent(cc.TiledMap);
        let item_layer = tiledMap.getLayer("item layer");
        let ItemX = 9;
        let ItemY = 9;
        // create item
        let item_tiled = item_layer.getTiledTileAt(ItemX, ItemY, true);
        let item_sprite = item_tiled.getComponent(cc.Sprite);
        let item_body = item_tiled.getComponent(cc.RigidBody);
        item_sprite.spriteFrame = item_tiled.node.type2_item_frame;
        item_body.onPreSolve = item_tiled.node.contact_type2;
    }

    updateTime() {
        this.timeText.getComponent(cc.Label).string = this.Time.toFixed(0).toString();
    }
}
