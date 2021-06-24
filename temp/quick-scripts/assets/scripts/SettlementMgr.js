(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/SettlementMgr.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4736e3inpxHkY0r8ongFecH', 'SettlementMgr', __filename);
// scripts/SettlementMgr.ts

Object.defineProperty(exports, "__esModule", { value: true });
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var record = null;
var NewClass = /** @class */ (function (_super) {
    __extends(NewClass, _super);
    function NewClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.winner = null;
        _this.getCoin = null;
        _this.getExperience = null;
        _this.getAchievement = null;
        return _this;
        // update (dt) {}
    }
    // LIFE-CYCLE CALLBACKS:
    NewClass.prototype.onLoad = function () {
        record = cc.find("record").getComponent("record");
        this.winner.string = record.winner;
        this.getCoin.string = record.getCoin;
        this.getExperience.string = record.getExperience;
        this.getAchievement.string = record.getAchievement;
    };
    NewClass.prototype.start = function () {
        setTimeout(function () {
            cc.director.loadScene("main");
        }, 5000);
    };
    __decorate([
        property(cc.Label)
    ], NewClass.prototype, "winner", void 0);
    __decorate([
        property(cc.Label)
    ], NewClass.prototype, "getCoin", void 0);
    __decorate([
        property(cc.Label)
    ], NewClass.prototype, "getExperience", void 0);
    __decorate([
        property(cc.Label)
    ], NewClass.prototype, "getAchievement", void 0);
    NewClass = __decorate([
        ccclass
    ], NewClass);
    return NewClass;
}(cc.Component));
exports.default = NewClass;

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=SettlementMgr.js.map
        