
namespace foster {

    interface IUseItem {
        id: number;
        used: boolean;
        needNum: number;
        addExp: number;
    }

    export class OneClickLevelUpPanel extends ui.foster.panel.OneClickLevelUpPanelUI {
        private _roleId: number;
        /**角色当前等级 */
        private _nowLv: number;
        /**当前选中的目标等级(滑条，经验药水的选择都会引起变动) */
        private _targetLv: number;
        /**最大等级（玩家等级） */
        private _maxLv: number;
        /**经验药水信息 */
        private _useItemMap: util.HashMap<IUseItem>;
        /**选中物品后的升级信息缓存 */
        private _lvArr: Array<{ lv: number, willAddExp: number, arr: Array<{ id: number, needNum: number }> }>;
        constructor() {
            super();
            this._useItemMap = new util.HashMap();
            this.slider.bar.stateNum = 1;
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.sideClose = true;
        }

        show(roleId: number, openAni: boolean = true) {
            this._roleId = roleId;
            this._nowLv = clientCore.RoleManager.instance.getRoleById(roleId).lv;
            this._maxLv = clientCore.LocalInfo.userLv;
            this._targetLv = this._nowLv;
            this.slider.min = this._nowLv;
            this.slider.max = this._maxLv;
            this.slider.value = this._targetLv;
            this.slider.tick = 0.01;
            this._useItemMap.clear();
            for (const id of EXP_ITEM) {
                let haveNum = clientCore.ItemsInfo.getItemNum(id);
                this._useItemMap.add(id, { id: id, used: haveNum > 0, needNum: 0, addExp: xls.get(xls.itemBag).get(id).value });
            };
            this.calcuLvInfo();
            this.updateView();
            if (openAni)
                clientCore.DialogMgr.ins.open(this);
        }

        private async onSure() {
            let useItems = _.filter(this._useItemMap.getValues(), o => o.used);
            await clientCore.RoleManager.instance.upgrageLv(this._roleId, useItems.map((o) => { return new pb.Item({ id: o.id, cnt: o.needNum }) }))
            this.onClose();
        }

        private onListRender(cell: Laya.Box, idx: number) {
            let data = cell.dataSource as IUseItem;
            let item = cell.getChildByName('item') as ui.commonUI.item.RewardItemUI;
            let clip = cell.getChildByName('clip') as Laya.Clip;
            clip.index = data.used ? 0 : 1;
            item.ico.skin = clientCore.ItemsInfo.getItemIconUrl(data.id);
            item.imgBg.skin = clientCore.ItemsInfo.getItemIconBg(data.id);
            item.txtName.text = clientCore.ItemsInfo.getItemName(data.id);
            item.txtName.visible = true;
            let haveNum = clientCore.ItemsInfo.getItemNum(data.id);
            let needNum = data.used ? data.needNum : 0;
            cell.gray = !data.used;
            item.num.value = `${needNum}/${haveNum}`;
        }

        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let id = this._useItemMap.getKeys()[idx];
                if (clientCore.ItemsInfo.getItemNum(parseInt(id)) > 0) {
                    this._useItemMap.get(id).used = !this._useItemMap.get(id).used;
                    this.list.startIndex = this.list.startIndex;
                    this.calcuLvInfo();
                }
            }
        }

        /**根据当前选择的药水，计算能升到哪些等级 */
        private calcuLvInfo() {
            this._lvArr = [];
            for (let lv = this._nowLv; lv <= this._maxLv; lv++) {
                let useItemInfo = this.calcuExpItemNum(lv);
                this._lvArr.push({ lv: useItemInfo.willLv, willAddExp: useItemInfo.willAddExp, arr: useItemInfo.useItemArr });
            }
            //去重
            this._lvArr = _.uniqBy(this._lvArr, o => o.lv);
            this._lvArr.unshift({ lv: this._nowLv, willAddExp: 0, arr: [] })
            this.updateView();
            this.slider.value += 0.01;
            this.slider.changeValue();
            // console.table(this._lvArr);
        }

        private calcuExpItemNum(targetLv: number) {
            console.clear();
            let nowExpInfo = clientCore.role.RoleInfo.parseLvInfoByExp(clientCore.RoleManager.instance.getRoleById(this._roleId).exp);
            let needExp = 0;
            if (this._nowLv == targetLv) {
                needExp = nowExpInfo.nextLvNeed;
            }
            else {
                needExp = clientCore.role.RoleInfo.getExpNeedByLv(this._nowLv, targetLv) - nowExpInfo.currExp;
            }
            let expItemArr = _.filter(this._useItemMap.getValues(), o => o.used);
            let useItemArr: Array<{ id: number, needNum: number }> = [];
            for (const o of expItemArr) {
                let haveNum = clientCore.ItemsInfo.getItemNum(o.id);
                let addExp = o.addExp;//一个道具加多少
                //全用掉能满足
                if (haveNum * addExp >= needExp) {
                    useItemArr.push({ id: o.id, needNum: Math.ceil(needExp / addExp) })
                    break;
                }
                //全部用掉还不够，判断下一个道具
                else {
                    useItemArr.push({ id: o.id, needNum: haveNum })
                    needExp -= haveNum * addExp;
                }
            }
            //道具得出后,判断一下 是不是有一瓶药水跨等级的情况
            let willAddExp = useItemArr.reduce((sum, curr) => { return sum + this._useItemMap.get(curr.id).addExp * curr.needNum }, 0);
            let nowExp = clientCore.RoleManager.instance.getRoleById(this._roleId).exp;
            let willLv = clientCore.role.RoleInfo.parseLvInfoByExp(nowExp + willAddExp).lv;
            return { willLv: willLv, useItemArr: useItemArr, willAddExp: willAddExp };
        }

        private updateView() {
            //先清空使用数量记录
            for (const o of this._useItemMap.getValues()) {
                o.needNum = 0;
            }
            let info = _.find(this._lvArr, o => o.lv == this._targetLv);
            //判断能否达到目标等级
            if (!info) {
                //不能达到目标 找一个最近的目标取顶,这时还需要改slider
                info = _.findLast(this._lvArr, o => o.lv <= this._targetLv);
                //没有能去顶的就取第一个了（一般是达到等级上限的边际问题）
                if (!info)
                    info = this._lvArr[0];
                this._targetLv = info.lv;
            }
            //根据目标设置所需药水
            for (const o of info.arr) {
                this._useItemMap.get(o.id).needNum = o.needNum;
            }
            let max: number = this._lvArr.length > 0 ? _.last(this._lvArr).lv : this._targetLv;
            this.slider.max = max;
            //上限变了，也要注意当前value
            if (Math.round(this.slider.value) > max) {
                this._targetLv = max;
            }
            this.txtLv.text = `${Math.min(this._maxLv, this._targetLv)}/${Math.min(this._maxLv, max)}`;
            this.list.dataSource = this._useItemMap.getValues();
            let useItems = _.filter(this._useItemMap.getValues(), o => o.used);
            this.btnSure.disabled = !(useItems.length > 0 && this._targetLv > this._nowLv);
        }

        private onSliderChange() {
            let tmpTarget = Math.round(this.slider.value);
            //滑动条刻度有改变
            if (tmpTarget != this._targetLv) {
                this.updateSliderValue(tmpTarget > this._targetLv);
            }
        }

        /**计算滑动条真实值（如果使用大经验药水,拖动一下可能升好几级） */
        private updateSliderValue(add: boolean) {
            let tmpTarget = Math.round(this.slider.value);
            let nowIdx = _.findIndex(this._lvArr, o => o.lv == this._targetLv);
            let targetIdx = _.clamp(add ? nowIdx + 1 : nowIdx - 1, 0, this._lvArr.length - 1);
            tmpTarget = this._lvArr[targetIdx].lv;
            if (tmpTarget != this._targetLv) {
                this._targetLv = tmpTarget;
                this.updateView();
            }
            //计算targetLv后改变滑条进度
            this.slider.value = this._targetLv;
            this.slider.changeValue();
        }

        private onClose() {
            clientCore.DialogMgr.ins.close(this);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnSub, Laya.Event.CLICK, this, this.updateSliderValue, [false]);
            BC.addEvent(this, this.btnAdd, Laya.Event.CLICK, this, this.updateSliderValue, [true]);
            BC.addEvent(this, this.btnSure, Laya.Event.CLICK, this, this.onSure);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.onClose);
            BC.addEvent(this, this.slider, Laya.Event.CHANGE, this, this.onSliderChange);//数字变动需要实时
            BC.addEvent(this, this.slider, Laya.Event.CHANGED, this, this.onSliderChange);//有时候变动了没有change 但是一定有changed 
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
            this._useItemMap.clear();
        }
    }
}