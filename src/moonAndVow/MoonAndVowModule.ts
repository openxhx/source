
namespace moonAndVow {
    /**
     * 月与誓约的的传说
     * moonAndVow.MoonAndVowModule
     */

    const BEAN_ID = clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID;
    const LEAF_ID = clientCore.MoneyManager.LEAF_MONEY_ID;

    export class MoonAndVowModule extends ui.moonAndVow.MoonAndVowModuleUI {
        private _drawArr: xls.godTree[];
        private _needCoinInfo: xls.rouletteDrawCost;
        private _rewardState: boolean[];

        init(d: any) {
            super.init(d);
            this.list.renderHandler = new Laya.Handler(this, this.onListRender);
            this.list.mouseHandler = new Laya.Handler(this, this.onListMouse);
            this.imgCloth.skin = clientCore.LocalInfo.sex == 1 ? 'unpack/moonAndVow/female.png' : 'unpack/moonAndVow/male.png';
            clientCore.UIManager.showCoinBox();
            clientCore.UIManager.setMoneyIds([clientCore.MoneyManager.LEAF_MONEY_ID, clientCore.MoneyManager.SPIRIT_BEAN_MONEY_ID]);
            this.addPreLoad(xls.load(xls.godTree));
            this.addPreLoad(xls.load(xls.rouletteDrawCost));
            this.addPreLoad(xls.load(xls.eventFeature));
            this.addPreLoad(res.load(['res/animate/moonAndVow/broken.sk', 'res/animate/moonAndVow/broken.png']));
            this.addPreLoad(net.sendAndWait(new pb.cs_legend_of_moon_and_oath_get_info()).then((data: pb.sc_legend_of_moon_and_oath_get_info) => {
                this._rewardState = [];
                for (let i = 0; i < 3; i++) {
                    this._rewardState.push(util.getBit(data.storyStatus, i + 1) == 1);
                };
                this.txtNeedNum.value = data.drawCost.toString();
            }));
        }

        private reqCurrPrice() {
            net.sendAndWait(new pb.cs_legend_of_moon_and_oath_get_info()).then((data: pb.sc_legend_of_moon_and_oath_get_info) => {
                this.txtNeedNum.value = data.drawCost.toString();
                this.updateDrawView();
            })
        }

        onPreloadOver() {
            this.list.dataSource = xls.get(xls.eventFeature).getValues().slice(0, 3);
            this._drawArr = _.filter(xls.get(xls.godTree).getValues(), v => v.module == 2);
            this.updateDrawView();
            clientCore.Logger.sendLog('2020年4月16日活动', '【付费】月与誓约的传说', '打开活动面板');
        }

        private updateDrawView() {
            //性别
            for (let i = 801; i <= 813; i++) {
                let box = this['box_' + i] as Laya.Box;
                //女号部件在底下
                (box.getChildAt(clientCore.LocalInfo.sex == 1 ? 1 : 0) as Laya.Image).visible = false;
                (box.getChildAt(2) as Laya.Image).visible = false;
            }
            //解读过的不显示
            let canLightIdArr = _.filter(this._drawArr, (o) => {
                let rwdId = clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1;
                return !clientCore.LocalInfo.checkHaveCloth(rwdId);
            }).map(o => o.id);
            for (let i = 801; i <= 813; i++) {
                this['box_' + i].visible = canLightIdArr.indexOf(i) > -1;
            }
            //全抽完了
            let drawTimes = this._drawArr.length - canLightIdArr.length;
            if (canLightIdArr.length == 0) {
                this.btnDraw.visible = false;
                this.imgCount.visible = false;
            }
            else {
                this.btnDraw.visible = true;
                this._needCoinInfo = xls.get(xls.rouletteDrawCost).get(drawTimes + 1);
                this.imgNeedId.skin = clientCore.ItemsInfo.getItemIconUrl(this._needCoinInfo.cost.v1);
                let nowPrice = parseInt(this.txtNeedNum.value);
                if (nowPrice == 0 || nowPrice == this._needCoinInfo.cost.v2) {
                    nowPrice = this._needCoinInfo.cost.v2;
                    this.imgCount.visible = false;
                    this.txtNeedNum.value = nowPrice.toString();
                    this.txtOri.visible = false;
                }
                else {
                    this.imgCount.visible = true;
                    this.txtOri.visible = true;
                }
                this.txtOri.value = this._needCoinInfo.cost.v2.toString();
                let count = Math.floor(nowPrice / this._needCoinInfo.cost.v2 * 10);
                console.log(this._needCoinInfo.cost.v2);
                this.imgCount.skin = `moonAndVow/${count}折.png`;
            }
            //右下角额外奖励：6件领第一档，全齐了第二档
            let sex = clientCore.LocalInfo.sex;
            let faceIdArr = sex == 1 ? [4100289, 4100290, 4100291] : [4100292, 4100293, 4100294];
            let haveAllFace = _.compact(_.map(faceIdArr, id => clientCore.LocalInfo.checkHaveCloth(id))).length == faceIdArr.length;//是否已领取
            let allClothId = clientCore.SuitsInfo.getSuitInfo(2100159).clothes;
            let haveClothNum = _.filter(allClothId, id => clientCore.LocalInfo.checkHaveCloth(id)).length;
            //领取过第一档奖励
            if (!haveAllFace) {
                this.imgProgress.skin = `moonAndVow/imgPro_${sex}.png`;
                this.btnGetRwd.skin = haveClothNum < 6 ? 'moonAndVow/集齐奖励.png' : 'moonAndVow/集齐奖励1.png'; //6件才能领
                this.btnGetRwd.disabled = haveClothNum < 6;
                this.txtProgress.text = haveClothNum + '/6';
            }
            else {
                this.imgProgress.skin = `moonAndVow/imgPro.png`;
                this.btnGetRwd.skin = !clientCore.SuitsInfo.getSuitInfo(2100159).allGet ? 'moonAndVow/集齐奖励.png' : 'moonAndVow/集齐奖励1.png';
                this.btnGetRwd.disabled = !clientCore.SuitsInfo.getSuitInfo(2100159).allGet;
                this.txtProgress.text = haveClothNum + '/' + allClothId.length;
                //第二档领了隐藏按钮
                if (clientCore.BgShowManager.instance.checkHaveBgShow(1000004)) {
                    this.btnGetRwd.visible = false;
                }
            }
        }

        private onDetail() {
            let ruleArr = [
                `活动时间：4月16日开服～4月22日23：59`,
                '消耗{神叶或灵豆}可{随机击碎}一块石碑，击碎石碑后可获得{对应的服装部件}',
                '每击碎一块石碑，消耗的神叶或灵豆{数量会逐渐提高}，每次击碎一块石碑都有机会使下一次解读{获得折扣}',
                '击碎6块石碑后，可获得{欧若拉的誓约美瞳}',
                '击碎所有石碑后，可获得{暗夜星辰背景秀}',
                '观看月亮的传说剧情，可以获得{神叶奖励}，剧情将根据{制定日期开启}',
            ];
            clientCore.Logger.sendLog('2020年4月16日活动', '【付费】月与誓约的传说', `点击活动说明按钮`);
            alert.showRulePanel(
                _.map(ruleArr, s => util.StringUtils.getColorText3(s, '#66472c', '#f25c58')),
                _.map(ruleArr, s => s.replace(/{/g, '').replace(/}/g, ''))
            );
        }

        private onSuit() {
            clientCore.ModuleManager.open('rewardDetail.PreviewModule', 2100159);
        }

        private async onDraw() {
            //神叶不足
            let needCoinId = this._needCoinInfo.cost.v1;
            let needNum = parseInt(this.txtNeedNum.value);
            let beanNum = clientCore.ItemsInfo.getItemNum(BEAN_ID);
            let leafNum = clientCore.ItemsInfo.getItemNum(LEAF_ID);
            //如果是灵豆
            let oriCount = '';
            if (needCoinId == BEAN_ID) {
                if (beanNum >= needNum) {
                    alert.showSmall(`确定要花费${needNum}个灵豆解读一次吗？${oriCount}`, { callBack: { caller: this, funArr: [this.sureDraw] } });
                }
                else {
                    alert.showSmall('灵豆不足，是否补充？', { callBack: { caller: this, funArr: [this.goBuyBean] } })
                }
            }
            if (needCoinId == LEAF_ID) {
                if (leafNum >= needNum) {
                    alert.showSmall(`确定要花费${needNum}个神叶解读一次吗？${oriCount}`, { callBack: { caller: this, funArr: [this.sureDraw] } });
                }
                else {
                    alert.leafNotEnoughShowRecharge(new Laya.Handler(this, () => {
                        alert.AlertLeafEnough.showAlert(needNum - leafNum);
                    }));
                }
            }
        }

        private onListRender(cell: ui.sunAndLove.render.SunBookRenderUI, idx: number) {
            let data = cell.dataSource as xls.eventFeature;
            cell.imgBook.skin = `moonAndVow/传说${idx + 1}.png`;
            cell.imgIcon.skin = clientCore.ItemsInfo.getItemIconUrl(data.reward[0].v1);
            cell.imgReaded.visible = this._rewardState[idx];
            let time = util.TimeUtil.formatTimeStrToSec(data.openTime);
            let date = util.TimeUtil.formatSecToDate(time);
            cell.txtDate.text = `${date.getMonth() + 1}月${date.getDate()}日开启`;
            cell.txtDate.visible = clientCore.ServerManager.curServerTime < (date.getTime() / 1000);
            cell.imgLock.visible = cell.txtDate.visible;
            cell.boxBubble.visible = !this._rewardState[idx];
        }

        private _tmpIdx: number;
        private onListMouse(e: Laya.Event, idx: number) {
            if (e.type == Laya.Event.CLICK) {
                let cell = this.list.getCell(idx);
                if (!cell['txtDate'].visible) {
                    this._tmpIdx = idx;
                    let aniId = xls.get(xls.eventFeature).get(idx + 1)?.movie.toString();
                    if (aniId)
                        clientCore.AnimateMovieManager.showAnimateMovie(aniId, this, this.onAniOver);
                    else
                        this.onAniOver();
                }
            }
        }

        private onAniOver() {
            if (!this._rewardState[this._tmpIdx])
                net.sendAndWait(new pb.cs_legend_of_moon_and_oath_story_reward({ id: this._tmpIdx + 1 })).then((data: pb.sc_legend_of_moon_and_oath_story_reward) => {
                    alert.showReward(clientCore.GoodsInfo.createArray(data.item));
                    this._rewardState[this._tmpIdx] = true;
                    this.list.startIndex = this.list.startIndex;
                    clientCore.Logger.sendLog('2020年4月16日活动', '【付费】月与誓约的传说', `观看剧情${this._tmpIdx + 1}`);
                })
        }


        private sureDraw() {
            net.sendAndWait(new pb.cs_common_activity_draw({ moduleId: 2, times: 1 })).then(async (data: pb.sc_common_activity_draw) => {
                let id = data.item[0]?.id;
                if (id && _.findIndex(this._drawArr, (o) => { return o.id == id }) > -1) {
                    this.mouseEnabled = false;
                    await this.playDrawAni(id);
                    await this.playBrokenAni(id);
                    this.mouseEnabled = true;
                    let o = xls.get(xls.godTree).get(id);
                    let rwdId = clientCore.LocalInfo.sex == 1 ? o.item.v1 : o.itemMale.v1;
                    alert.showReward([{ itemID: rwdId, itemNum: 1 }]);
                    this.reqCurrPrice();
                }
            })
        }

        private goBuyBean() {
            clientCore.ToolTip.gotoMod(50);
        }

        private async playDrawAni(targetId: number) {
            let canLightIdArr = [];
            for (let i = 801; i <= 813; i++) {
                if (this['box_' + i].visible) {
                    canLightIdArr.push(i);
                }
            }
            //如果只剩一个了就别转了
            if (canLightIdArr.length == 1)
                return;
            //先快速转N格
            let arr = [];
            let len = canLightIdArr.length;
            for (let i = 0; i < 20; i++) {
                arr.push(canLightIdArr[i % len]);
            }
            arr = _.shuffle(arr);
            for (let j = 0; j < arr.length; j++) {
                this.setOneLight(arr[j]);
                await util.TimeUtil.awaitTime(70);
            }
            //减速转向目标
            canLightIdArr = _.shuffle(canLightIdArr)
            canLightIdArr.push(targetId);
            let maxDelay = 400;
            let minDelay = 70;
            let diffTime = (maxDelay - minDelay) / (canLightIdArr.length - 1);
            for (let i = 0; i < canLightIdArr.length; i++) {
                let id = canLightIdArr[i];
                this.setOneLight(id);
                await util.TimeUtil.awaitTime(minDelay + i * diffTime);
            }
        }

        private playBrokenAni(id: number) {
            let bone = clientCore.BoneMgr.ins.play('res/animate/moonAndVow/broken.sk', 0, false, this.boxCon);
            let targetBox = this['box_' + id];
            targetBox.visible = false;
            bone.pos(targetBox.x, targetBox.y);
            return new Promise((ok) => {
                bone.once(Laya.Event.COMPLETE, this, ok);
            })
        }

        private setOneLight(id: number) {
            if (id >= 801 && id <= 813) {
                for (let i = 801; i <= 813; i++) {
                    let box = this['box_' + i];
                    box.getChildAt(2).visible = i == id;
                    if (i == id)
                        box.parent.addChild(box);
                }
            }
        }

        private _bgShowPanel: ui.moonAndVow.panel.MoonBgShowPanelUI;
        private onGetProgressRwd() {
            //预览 
            if (this.btnGetRwd.skin == 'moonAndVow/集齐奖励.png') {
                this.showBgPreview();
            }
            else {
                net.sendAndWait(new pb.cs_legend_of_moon_and_oath_collect_reward()).then((data: pb.sc_legend_of_moon_and_oath_collect_reward) => {
                    util.RedPoint.reqRedPointRefresh(8201);
                    this.updateDrawView();
                    if (data && data.item && data.item.length > 0)
                        alert.showReward(clientCore.GoodsInfo.createArray(data.item), '', { callBack: { caller: this, funArr: [this.updateDrawView] } });
                })
            }
        }

        private showBgPreview() {
            this._bgShowPanel = this._bgShowPanel || new ui.moonAndVow.panel.MoonBgShowPanelUI();
            this._bgShowPanel.sideClose = true;
            this._bgShowPanel.mouseThrough = true;
            clientCore.DialogMgr.ins.open(this._bgShowPanel);
        }

        private showTips(id: number, e: Laya.Event) {
            let godTree = xls.get(xls.godTree).get(id);
            if (godTree) {
                let rwdId = clientCore.LocalInfo.sex == 1 ? godTree.item.v1 : godTree.itemMale.v1;
                clientCore.ToolTip.showTips(e.currentTarget, { id: rwdId });
            }
        }

        private onProb() {
            clientCore.ModuleManager.open('probability.ProbabilityModule', 4);
        }

        addEventListeners() {
            BC.addEvent(this, this.btnDraw, Laya.Event.CLICK, this, this.onDraw);
            BC.addEvent(this, this.btnDetail, Laya.Event.CLICK, this, this.onDetail);
            BC.addEvent(this, this.btnSuit, Laya.Event.CLICK, this, this.onSuit);
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnGetRwd, Laya.Event.CLICK, this, this.onGetProgressRwd);
            BC.addEvent(this, this.imgPrev, Laya.Event.CLICK, this, this.showBgPreview);
            BC.addEvent(this, this.btnProb, Laya.Event.CLICK, this, this.onProb);
            for (let i = 801; i <= 813; i++) {
                BC.addEvent(this, this['box_' + i], Laya.Event.CLICK, this, this.showTips, [i]);
            }
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            // clientCore.BoneMgr.ins.cleanTempLet('res/animate/moonAndVow/broken.sk');
            this._bgShowPanel?.destroy();
            clientCore.UIManager.releaseCoinBox();
            super.destroy();
        }
    }
}