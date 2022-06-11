namespace operaDrama {
    const TITLE = ['A', 'B', 'C', 'D'];

    export class OperaRecallPanel extends ui.operaDrama.panel.OperaRecallPanelUI {
        private _stageArr: ui.operaDrama.render.OperaTitleRenderUI[] = [];
        constructor() {
            super();
            this.boxDetail.visible = false;
            this.panel.hScrollBarSkin = null;
            for (let i = 0; i < 3; i++) {
                BC.addEvent(this, this['imgHead_' + i], Laya.Event.CLICK, this, this.onHeadClick, [i + 1]);
            }
            BC.addEvent(this, this.panel.hScrollBar, Laya.Event.CHANGE, this, this.onScrollChange);
        }

        show() {
            clientCore.Logger.sendLog('2020年9月30日活动', '【主活动】中秋话剧面板和剧情', '打开剧情回顾面板');
            this.boxDetail.visible = false;
            let roleId = _.find([1, 2, 3], id => clientCore.OperaManager.instance.checkHaveEndByRoleId(id));
            if (!_.isUndefined(roleId)) {
                this.onHeadClick(roleId);
            }
            for (let i = 0; i < 3; i++) {
                let haveEnd = clientCore.OperaManager.instance.checkHaveEndByRoleId(i + 1);
                this['imgHead_' + i].disabled = !haveEnd;
                this['imgLock_' + i].visible = !haveEnd;
            }
        }

        private onScrollChange() {
            let scroll = this.panel.hScrollBar;
            this.imgLeft.visible = scroll.value > 0;
            this.imgRight.visible = scroll.value < scroll.max;
        }

        private onHeadClick(roleId: number) {
            this.panel.hScrollBar.stopScroll();
            this.panel.scrollTo(0);
            this.updateViewByHead(roleId);
            for (let i = 0; i < 3; i++) {
                this['imgHead_' + i].skin = `operaDrama/head${i + 1}${(i == roleId - 1) ? 'select' : ''}.png`;
            }
        }

        private clearAllStage() {
            this._stageArr.forEach((o) => { o.destroy() });
            this._stageArr = [];
        }

        private updateViewByHead(roleId: number) {
            this.clearAllStage();
            if (roleId == 3) {
                this.createPlotRender(407, 0, false);
            }
            else {
                let before = roleId == 1 ? [1, 2, 3, 5] : [1, 2, 4, 5];//初始共同线id
                let range = roleId == 1 ? [100, 200] : [200, 300];//分支线范围
                let middle = _.map(_.filter(xls.get(xls.dramaRoute).getValues(), o => _.inRange(o.id, range[0], range[1])), o => o.id);
                let nodeIdArr = before.concat(middle);
                let x = 0;
                for (let i = 0; i < nodeIdArr.length; i++) {
                    let routeId = nodeIdArr[i];
                    let routeInfo = xls.get(xls.dramaRoute).get(routeId);
                    //过滤
                    if (routeInfo.event.v1 != 1 && routeInfo.event.v1 != 2) {
                        continue;
                    }
                    let plots = routeInfo.content;
                    //特殊处理选择阵营节点
                    if (clientCore.OperaManager.instance.checkIsChooseSideRouteId(routeId)) {
                        plots = [plots[clientCore.OperaManager.instance.side - 1]];
                    }
                    for (let j = 0; j < plots.length; j++) {
                        let render = this.createPlotRender(routeId, j, plots.length > 1);
                        render.x = x;
                    }
                    x += 200;
                }
                //创建结局
                let endings = clientCore.OperaManager.instance.getEndingIdByRoleId(roleId);
                for (let i = 0; i < endings.length; i++) {
                    const endId = endings[i];
                    let render = this.createPlotRender(endId, i, false);
                    render.x = x;
                }
            }
            this.onScrollChange();
        }

        private createPlotRender(id: number, chooseIdx: number, showtitle: boolean) {
            let render = new ui.operaDrama.render.OperaTitleRenderUI();
            render.imgSelect.visible = false;
            render.imgLock.visible = showtitle ? !clientCore.OperaManager.instance.checkChooseDone(id, chooseIdx + 1) : !clientCore.OperaManager.instance.checkRouteJumped(id);
            let info = xls.get(xls.dramaRoute).get(id);
            render.txt.text = info.title + (showtitle ? TITLE[chooseIdx] : '');
            render.y = chooseIdx * 70;
            this._stageArr.push(render);
            this.panel.addChild(render);
            render.dataSource = info.title + '_' + info.content[Math.min(info.content.length - 1, chooseIdx)];
            if (!render.imgLock.visible) {
                BC.addEvent(this, render, Laya.Event.CLICK, this, this.setSelect, [this._stageArr.length - 1]);
            }
            return render;
        }

        private setSelect(idx: number) {
            if (idx < 0) {
                this.panel.visible = true;
                this.boxDetail.visible = false;
            }
            else {
                BC.addOnceEvent(this, this, Laya.Event.MOUSE_DOWN, this, this.hideDetail);
                this.panel.visible = false;
                this.boxDetail.visible = true;
                let str = this._stageArr[idx].dataSource;
                this.txtTitle.text = str.split('_')[0];
                this.txtContent.text = str.split('_')[1];
                for (let i = 0; i < this._stageArr.length; i++) {
                    this._stageArr[i].imgSelect.visible = i == idx;
                    this._stageArr[i].txt.color = i != idx ? '#546e8b' : '#ffffff';
                }
            }
        }

        private hideDetail() {
            if (this.boxDetail.visible) {
                this.setSelect(-1);
            }
        }

        destroy() {
            this.clearAllStage()
            super.destroy();
            BC.removeEvent(this);
        }
    }
}