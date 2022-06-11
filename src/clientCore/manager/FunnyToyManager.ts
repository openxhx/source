namespace clientCore {

    const MAX_NUM = 3;
    /**
     * 奇趣道具管理
     */
    export class FunnyToyManager {
        private static _playNum: number = 0;
        private static _lastFireTime: number = 0;
        private static _aimingItemId: number = 0;

        static async  setup() {
            await xls.load(xls.funnyProp);
            this._playNum = 0;
            net.listen(pb.sc_notify_map_tool_use, this, this.onSomeOneUseToy);
            net.listen(pb.sc_notify_map_tool_clear, this, this.onSomeOneClearToy)
            //奇趣道具管理在player初始化后 更新下状态
            clientCore.PeopleManager.getInstance().player.updateFunnyToy(LocalInfo.srvUserInfo.propStampInfo);
        }

        static useFunnyToy(itemId: number, pos?: pb.IPoint, uid?: number) {
            let now = clientCore.ServerManager.curServerTime;
            if (now < this._lastFireTime + 2) {
                alert.showFWords('稍等一会再使用吧');
                return;
            }
            let itemType = xls.get(xls.funnyProp).get(itemId)?.type;
            if (uid) {
                let person = uid == clientCore.LocalInfo.uid ? clientCore.PeopleManager.getInstance().player : clientCore.PeopleManager.getInstance().getOther(uid);
                if (!person.checkCanUserFunnyToy(itemType)) {
                    alert.showFWords('等当前的消失再使用吧');
                    return;
                }
            }
            if (itemType) {
                this._lastFireTime = now;
                switch (itemType) {
                    case 1:
                        net.sendAndWait(new pb.cs_use_map_tool({ toolId: itemId }))
                        break;
                    case 2:
                        net.sendAndWait(new pb.cs_use_map_tool({ toolId: itemId, pos: pos }))
                        break;
                    case 3:
                    case 4:
                    case 5:
                        net.sendAndWait(new pb.cs_use_map_tool({ toolId: itemId, uid: uid }))
                        break;
                    default:
                        break;
                }
            }
        }

        /**设置当前瞄准使用的道具id */
        static setAimItemId(id: number) {
            this._aimingItemId = id;
        }
        /**当前使用中的道具（瞄准） */
        static get aimItemId() {
            return this._aimingItemId;
        }

        /**是否使用奇趣道具瞄准 */
        static get isAimingMode() {
            return this._aimingItemId != 0;
        }

        /**UI层动画 */
        private static playUILayerToy(itemId: number, nick: string) {
            if (this._playNum >= MAX_NUM)
                return;
            this._playNum += 1;
            let bone = clientCore.BoneMgr.ins.play(pathConfig.getFunnyToySk(itemId), 0, false, LayerManager.upMainLayer, { addChildAtIndex: 0 });
            bone.pos(Laya.stage.width / 2 + _.random(-200, 200), Laya.stage.height / 2 + _.random(-50, 200));
            bone.once(Laya.Event.COMPLETE, this, () => {
                this._playNum = Math.max(0, this._playNum - 1)
            });
            bone.scaleY = bone.scaleX = 1.2;
            alert.showWorlds({
                bgPath: 'res/alert/worldNotice/106.png',
                value: `${nick}使用了${clientCore.ItemsInfo.getItemName(itemId)}`,
                width: 719,
                y: 32,
                sign: alert.Sign.FUNNY_TOY,
                sizeGrid: '0,0,0,0',
                fontColor: '#ffffff'
            })
        }

        /**指定位置播放 */
        private static playToyByPosition(itemId: number, x: number, y: number) {
            let bone = clientCore.BoneMgr.ins.play(pathConfig.getFunnyToySk(itemId), 0, false, MapManager.curMap.upLayer, { addChildAtIndex: 0 });
            bone.pos(x, y);
            bone.scaleY = bone.scaleX = 1.2;
            core.SoundManager.instance.playSound('res/sound/bomb.ogg');
        }

        /**指定人 */
        private static playToyByPeople(itemId: number, uid: number) {
            console.log(`${uid}被使用了道具${itemId}`)
            let now = clientCore.ServerManager.curServerTime;
            let endTime = xls.get(xls.funnyProp).get(itemId).parameter.v2 + now;
            let people = clientCore.LocalInfo.uid == uid ? PeopleManager.getInstance().player : PeopleManager.getInstance().getOther(uid);
            if (people)
                people.updateFunnyToyByIdEndTime(itemId, endTime);
            if (uid == LocalInfo.uid) {
                EventManager.event(globalEvent.FUNNY_TOY_INFO_UPDATE);
            }
        }

        private static onSomeOneUseToy(data: pb.sc_notify_map_tool_use) {
            let itemId = data.toolId;
            let itemType = xls.get(xls.funnyProp).get(itemId)?.type;
            if (itemType) {
                switch (itemType) {
                    case 1:
                        this.playUILayerToy(itemId, data.nick)
                        break;
                    case 2:
                        this.playToyByPosition(itemId, data.pos.x, data.pos.y)
                        break;
                    case 3:
                    case 4:
                    case 5:
                        this.playToyByPeople(itemId, data.uid);
                        break;
                    default:
                        break;
                }
            }
        }

        private static onSomeOneClearToy(data: pb.sc_notify_map_tool_clear) {
            let people = clientCore.LocalInfo.uid == data.uid ? PeopleManager.getInstance().player : PeopleManager.getInstance().getOther(data.uid);
            if (people) {
                people.updateFunnyToyByIdEndTime(data.toolId, 0);
            }
            if (clientCore.LocalInfo.uid == data.uid)
                EventManager.event(globalEvent.FUNNY_TOY_INFO_UPDATE);
        }

        /**打开清除奇趣道具模块 */
        static openClearModule() {
            let now = clientCore.ServerManager.curServerTime;
            let havePropToClear = _.filter(clientCore.LocalInfo.srvUserInfo.propStampInfo, o => o.clearPropStamp != 0 && o.clearPropStamp >= now).length > 0;
            if (havePropToClear)
                clientCore.ModuleManager.open('funnyToyClear.FunnyToyClearModule');
        }
    }
}