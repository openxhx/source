
namespace clothChange {
    const CHILD_W = 163;
    const CHILD_H = 70;
    export class SellTabControl {
        private readonly _typeHash: util.HashMap<number[] | number>;
        private readonly _nameDic: util.HashMap<string>;
        private _parentHash: util.HashMap<ui.commonUI.item.ClothTabButtonUI>;//父级按钮hash
        private _childHash: util.HashMap<Laya.List>;//子级按钮list Hash
        private _hanlder: Laya.Handler;
        private _parentUI: Laya.Panel;
        private _selectType: number = -1;//当前选中的（可能是父级标签）
        private _scroll: Laya.VScrollBar;

        /**
         * @param typeHash key是父类型 value是子类型数组 如果传number则没有子类型
         * @param initType 初始选择的类型(可以是父类型也可以是子类型)
         * @hanlder 选择一项后回调 回调参数
         */
        constructor(parent: Laya.Panel, typeHash: util.HashMap<number[] | number>, initType: number, nameDic: util.HashMap<string>, hanlder: Laya.Handler) {
            this._parentUI = parent;
            this._parentUI.vScrollBarSkin = null;
            this._scroll = this._parentUI.vScrollBar;
            this._typeHash = typeHash;
            this._nameDic = nameDic;
            this._hanlder = hanlder;
            this._parentHash = new util.HashMap();
            this._childHash = new util.HashMap();
            let parentSelect = this.getParentTypeByChild(initType);
            //创建所有显示对象
            let entries = this._typeHash.toArray();
            for (const obj of entries) {
                let key = parseInt(obj[0]);
                let childArr = obj[1];
                if (childArr instanceof Array) {
                    //创建所有子级按钮list
                    let list = new Laya.List();
                    list.dataSource = childArr;
                    list.itemRender = ui.commonUI.item.ClothTabButtonChildUI;
                    list.renderHandler = new Laya.Handler(this, this.onChildRender);
                    list.mouseHandler = new Laya.Handler(this, this.onChildSelect);
                    let listBg = new Laya.Image();
                    listBg.skin = 'clothTab/di_tabtab.png';
                    listBg.sizeGrid = '30,30,30,30';
                    list.addChildAt(listBg, 0);
                    list.height = CHILD_H * list.length;
                    listBg.size(CHILD_W, list.height);
                    list.centerX = 0;
                    this._childHash.add(key, list);
                    list.getCell(childArr.length - 1)['imgSplit'].visible = false;
                    //如果一开始需要展开 addChid
                    if (key == parentSelect) {
                        this._parentUI.addChild(list);
                    }
                }
                //创建父级按钮
                let parent = new ui.commonUI.item.ClothTabButtonUI();
                this.onParentRender(parent, key);
                BC.addEvent(this, parent, Laya.Event.CLICK, this, this.onParentSelect, [key]);
                this._parentHash.add(key, parent);
                this._parentUI.addChild(parent);
            }
            //初始化时
            this.sureSelect(initType);
            this.setLayout();
        }

        public getClothListCell(pTab: number) {
            let num = this._parentUI.numChildren;
            for (let i = 0; i < num; i++) {
                let dis = this._parentUI.getChildAt(i);
                if (dis instanceof ui.commonUI.item.ClothTabButtonUI) {
                    if (dis.name == ("" + pTab)) {
                        return dis;
                    }
                }
            }
        }
        /**设置位置
         * @param tweenToParent 需要缓动到置顶位置的类型（父级类型）
        */
        private setLayout(tweenToParent: number = -1) {
            this._scroll.stopScroll();
            let y = 0;
            let tweenToY: number = this._scroll.value;//默认就是当前滚动的位置
            let entries = this._typeHash.toArray();
            for (const obj of entries) {
                let key = parseInt(obj[0])
                let childArr = obj[1]
                if (tweenToParent == key) {
                    tweenToY = y;
                }
                //父级按钮
                let uiComp: Laya.Sprite;
                uiComp = this._parentHash.get(key);
                uiComp.y = y;
                y += uiComp.height;
                //如果子集展开了
                if (childArr instanceof Array) {
                    let listComp = this._childHash.get(key);
                    if (listComp.parent) {
                        listComp.y = y;
                        y += listComp.height;
                    }
                }
            }
            //如果先全部展开，再全部关闭，可能出现超出滚动范围的问题，用tween回合法范围
            let max = Math.max(0, y - this._parentUI.height)
            this._scroll.min = 0;
            this._scroll.max = max;
            let v = _.clamp(tweenToY, 0, max);
            if (v != this._scroll.value) {
                Laya.Tween.clearTween(this._scroll);
                Laya.Tween.to(this._scroll, { value: v }, 100);
            }
        }

        /**渲染父级按钮 */
        private onParentRender(cell: ui.commonUI.item.ClothTabButtonUI, clothType: number) {
            cell.name = "" + clothType;
            let name = this._nameDic.get(clothType);
            cell.imgTxt.skin = `clothTab/clip_${name}.png`;
            cell.imgIcon.skin = `clothTab/par_${name}.png`;
            let childUI = this._childHash.get(clothType);
            cell.imgArrow.visible = childUI && childUI.parent != null;
        }

        private onParentSelect(parentType: number) {
            let childList = this._childHash.get(parentType);
            if (childList) {
                //如果有子级
                if (childList.parent) {
                    childList.removeSelf();
                    this.setLayout();
                }
                else {
                    //没有子级把之前展开的关闭
                    //展开时需要缓动
                    let beforeParent = this.getParentTypeByChild(this._selectType);
                    let beforeChildList = this._childHash.get(beforeParent);
                    if (beforeChildList && beforeChildList.parent)
                        beforeChildList.removeSelf()
                    this._parentUI.addChild(childList);
                    this.setLayout(parentType);
                    this.sureSelect(this._typeHash.get(parentType)[0]);
                }
                this.onParentRender(this._parentHash.get(parentType), parentType);
            }
            else {
                //无子级 直接选中
                this.sureSelect(parentType);
            }
        }

        private onChildRender(cell: ui.commonUI.item.ClothTabButtonChildUI, idx: number) {
            let clothType = cell.dataSource;
            let name = this._nameDic.get(clothType);
            cell.imgTxt.skin = `clothTab/clip_${name}.png`;
            cell.imgIcon.skin = `clothTab/icon_${name}.png`;
            cell.imgSelect.visible = cell.imgIcon.visible = this._selectType == clothType;
            cell.imgNoSelect.visible = this._selectType != clothType;
        }

        private onChildSelect(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                this.sureSelect(e.currentTarget['dataSource']);
            }
        }

        private sureSelect(selectClothType: number) {
            if (this._selectType != selectClothType) {
                //如果之前选中的是一个子级，需要取消子级list中的选中状态
                let beforeParent = this.getParentTypeByChild(this._selectType);
                this._selectType = selectClothType;
                let afterParent = this.getParentTypeByChild(this._selectType);
                let parentArr = [beforeParent, afterParent];
                for (const iterator of parentArr) {
                    let childList = this._childHash.get(iterator);
                    childList && childList.refresh();
                }
                //触发回调
                this._hanlder.runWith([this._selectType, afterParent]);
            }
            if (clientCore.GuideMainManager.instance.curGuideInfo.operationBehavior == "clickClothChangeSuitTab") {
                EventManager.event(globalEvent.NEW_PLAYER_GUIDE_STEP_COM);
            }
        }

        private getParentTypeByChild(type: number) {
            let entries = this._typeHash.toArray();
            for (const obj of entries) {
                let key = parseInt(obj[0])
                let childArr = obj[1]
                if (key == type) {
                    return key;
                }
                if (childArr instanceof Array) {
                    if (childArr.indexOf(type) > -1) {
                        return key;
                    }
                }
            }
        }

        public scrollToEnd() {
            Laya.Tween.clearTween(this._scroll);
            this._scroll.value = this._scroll.max;
        }

        destroy() {
            this._parentUI = null;
            this._hanlder = null;
            Laya.Tween.clearTween(this._scroll);
            this._scroll = null;
            BC.removeEvent(this);
        }
    }
}