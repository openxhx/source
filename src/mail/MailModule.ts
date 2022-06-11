
namespace mail {

    enum ViewType {
        MAIL = 1, //邮件
        LETTER //邀请函
    }

    /**
     * 邮件模块
     */
    export class MailModule extends ui.mail.MailModuleUI {

        private _currentView: ViewType;
        private _sCommand: MailSCommand;
        /** 邮件具体内容*/
        private _mailValue: panel.MailValuePanel;
        /** 一键删除邀请函*/
        private _letterPanel: panel.LetterPanel;
        /** 当前选择*/
        private _mailSelect: number = -1;

        private _invitePanel: panel.InvitePanel;

        constructor() {
            super();

            this._sCommand = MailSCommand.ins;
            //邮件初始化
            this.mailList.vScrollBarSkin = "";
            this.mailList.scrollBar.elasticBackTime = 200;
            this.mailList.scrollBar.elasticDistance = 200;
            this.mailList.renderHandler = Laya.Handler.create(this, this.mailRender, null, false);
            this.mailList.selectHandler = Laya.Handler.create(this, this.mailSelect, null, false);
            //邀请函初始化
            this.letterList.vScrollBarSkin = "";
            this.letterList.scrollBar.elasticBackTime = 200;
            this.letterList.scrollBar.elasticDistance = 200;
            this.letterList.renderHandler = Laya.Handler.create(this, this.letterRender, null, false);
            this.letterList.mouseHandler = Laya.Handler.create(this, this.letterMouse, null, false);
        }

        public init(data?: any): void {
            super.init(data);
            util.RedPoint.updateSub([4501]); //去除红点
            this.addPreLoad(this._sCommand.getMailInfo());
        }

        public addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.btnTotalDelete, Laya.Event.CLICK, this, this.onTotalDelete);
            BC.addEvent(this, this.btnTotalGet, Laya.Event.CLICK, this, this.onTotalGet);
            BC.addEvent(this, this.tab1, Laya.Event.CLICK, this, this.onTab, [ViewType.MAIL]);
            BC.addEvent(this, this.tab2, Laya.Event.CLICK, this, this.onTab, [ViewType.LETTER]);

            //以下EventManager
            BC.addEvent(this, EventManager, globalEvent.NEW_MAIN_NOTIFY, this, this.mailNotify);
        }

        public removeEventListeners(): void {
            BC.removeEvent(this);
        }

        public initOver(): void {
            let ins: clientCore.MailManager = clientCore.MailManager.ins;
            this.mailList.array = _.remove(this.sortMail(ins.getMails(1)), (element) => {
                let timeOut: boolean = clientCore.MailManager.ins.getTimeOut(element) <= 0;
                timeOut && clientCore.MailManager.ins.removeMail(1, element.seq);
                return !timeOut;
            });
            this.letterList.array = this.sortMail(ins.getMails(2));
            this.onTab(ViewType.MAIL);
        }

        public destroy(): void {
            this._invitePanel = this._letterPanel = this._mailValue = this._sCommand = null;
            super.destroy();
        }

        private onTab(type: ViewType): void {
            if (this._currentView == type) return;
            this._currentView = type;
            if (this._currentView == ViewType.LETTER)
                util.RedPoint.updateSub([4503]);
            if (this._currentView == ViewType.MAIL)
                util.RedPoint.updateSub([4502]); //去除红点
            for (let i: number = 1; i < 3; i++) {
                this["tab" + i].skin = i == type ? "mail/yeqian5.png" : "mail/yeqian6.png";
            }
            this.mailList.visible = type == ViewType.MAIL;
            this.letterList.visible = type == ViewType.LETTER;
            let list: Laya.List = type == ViewType.MAIL ? this.mailList : this.letterList;
            this.txCount.changeText(`${list.length}/100`);
            this.btnTotalGet.visible = this.mailList.visible;
            this.btnTotalDelete.x = this.mailList.visible ? 718 : 565;
            this.imgNoMail.visible = list.length == 0;
        }

        private mailRender(item: ui.mail.item.MainItemUI, index: number): void {
            let info: pb.IMailInfo = this.mailList.array[index];
            item.txTitle.changeText(info.title);

            let hasReward: boolean = info.rewardInfo.length != 0;
            item.imgBox.visible = hasReward;
            item.imgState.skin = info.readState == 0 ? "mail/weidu.png" : "mail/yidu.png";
            hasReward && (item.imgBox.skin = info.getReward == 0 ? "mail/box1.png" : "mail/box1-1.png");
            item.imgBG.skin = this._mailSelect == index ? "mail/di2.png" : "mail/di1.png";
            let timeOut: number = clientCore.MailManager.ins.getTimeOut(info);
            let nearT: boolean = timeOut < util.TimeUtil.DAYTIME;
            item.txTime.color = nearT ? '#ff0000' : '#805329';
            item.txTime.changeText(nearT ? '即将过期' : this.calculateMailTime(info.getTime));
        }

        private mailSelect(index: number): void {
            if (index == -1) return;
            this.mailList.selectedIndex = -1;
            let info: pb.IMailInfo = this.mailList.array[index];
            if (clientCore.MailManager.ins.getTimeOut(info) < 0) {
                this.timeOut(info.seq, index);
                return;
            }
            // 展示内容
            this._mailSelect = index;
            this.showMail(info, index);
        }

        public sortMail(array: pb.IMailInfo[]): pb.IMailInfo[] {
            array.sort((a, b) => {
                if (a.getTime > b.getTime) {
                    return -1
                }
                return 1;
            })
            return array;
        }

        private calculateMailTime(time: number): string {
            let passTime: number = Math.max(clientCore.ServerManager.curServerTime - time, 0);
            let m: number = Math.floor(passTime / 60);
            let h: number = Math.floor(passTime / 3600);
            let d: number = Math.floor(passTime / 86400);
            if (m <= 0) {
                return passTime + "秒前";
            }
            if (h <= 0) {
                return m + "分前";
            }
            if (d <= 0) {
                return h + "小时前";
            }
            return d + "天前";
        }

        private letterRender(item: ui.mail.item.LetterItemUI, index: number): void {
            let info: pb.IMailInfo = this.letterList.array[index];
            try {
                let weddinfInfo = JSON.parse(info.content)?.data as pb.IWeddingInfo;
                let senderInfo = _.find(weddinfInfo.cps, o => o.userid == info.send);
                item.txTitle.changeText(senderInfo.nick + '的' + info.title);
                item.imgHead.skin = clientCore.ItemsInfo.getItemIconUrl(senderInfo.headImage);
                (item.getChildByName("lock") as Laya.Image).skin = info.readState == 1 ? "mail/yidu.png" : "mail/weidu.png";
            }
            catch {

            }
        }

        private letterMouse(e: Laya.Event, index: number): void {
            if (e.type != Laya.Event.CLICK) return;
            let info: pb.IMailInfo = this.letterList.array[index];
            this.showLetter(info, index);
        }

        /** 收到邮件通知*/
        private mailNotify(msg: pb.IMailInfo): void {
            msg.type == 1 ? this.mailList.addItemAt(msg, 0) : this.letterList.addItemAt(msg, 0);
            if (this.mailList.visible)
                this.imgNoMail.visible = this.mailList.length == 0;
            if (this.letterList.visible)
                this.imgNoMail.visible = this.letterList.length == 0;
        }

        /** 一键删除*/
        private onTotalDelete(): void {
            if (this._currentView == ViewType.LETTER) {
                this._letterPanel = this._letterPanel || new panel.LetterPanel();
                this._letterPanel.show(Laya.Handler.create(this, () => {
                    this._sCommand.deleteMail(2, Laya.Handler.create(this, (array: number[]) => {
                        _.forEach(array, (element: number) => {
                            clientCore.MailManager.ins.removeMail(2, element);
                        })
                        this.letterList.array = this.sortMail(clientCore.MailManager.ins.getMails(2));
                        this.txCount.changeText(`${this.letterList.array.length}/100`);
                        this.imgNoMail.visible = this.letterList.length == 0
                    }))
                }))
            } else {
                if (this.mailList.length > 0)
                    this._sCommand.deleteMail(1, Laya.Handler.create(this, (array: number[]) => {
                        _.forEach(array, (element: number) => {
                            clientCore.MailManager.ins.removeMail(1, element);
                        })
                        this.mailList.array = this.sortMail(clientCore.MailManager.ins.getMails(1));
                        this.txCount.changeText(`${this.mailList.array.length}/100`);
                        this.imgNoMail.visible = this.mailList.length == 0;
                    }))
            }
        }

        /** 一键获取*/
        private async onTotalGet(): Promise<void> {
            let array: pb.IMailInfo[] = this.mailList.array;
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let element: pb.IMailInfo = array[i];
                if (element.getReward == 0 && element.rewardInfo.length != 0) {
                    await this.showMail(element, i);
                }
            }
        }

        /**
         * 展示邮件
         * @param info 
         * @param index 
         */
        private showMail(info: pb.IMailInfo, index: number): Promise<void> {
            // 邮件未读
            if (info.readState == 0) {
                info.readState = 1;
                this.mailList.changeItem(index, info);
                this._sCommand.readMail(info.seq);
            }
            // 显示弹窗
            return new Promise((suc) => {
                this._mailValue = this._mailValue || new panel.MailValuePanel();
                this._mailValue.show(info, Laya.Handler.create(this, () => {
                    if (clientCore.MailManager.ins.getTimeOut(info) < 0) {
                        this.timeOut(info.seq, index);
                        suc();
                    } else {
                        this._sCommand.getReward(info.seq, Laya.Handler.create(this, () => {
                            info.getReward = 1;
                            this.mailList.changeItem(index, info);
                            suc();
                        }))
                    }
                }))
            })
        }

        private showLetter(info: pb.IMailInfo, idx: number) {
            if (info.readState == 0) {
                info.readState = 1;
                this.letterList.changeItem(idx, info);
                this._sCommand.readMail(info.seq);
            }
            this._invitePanel = this._invitePanel || new panel.InvitePanel();
            let weddinfInfo;
            try {
                weddinfInfo = JSON.parse(info.content)?.data;
            } catch (error) {

            }
            if (weddinfInfo)
                this._invitePanel.show(weddinfInfo, info.seq);
            this._invitePanel.on(Laya.Event.CHANGED, this, () => {
                this.letterList.array = this.sortMail(clientCore.MailManager.ins.getMails(2));
                this.txCount.changeText(`${this.letterList.array.length}/100`);
                this.imgNoMail.visible = this.letterList.length == 0
            })
        }

        private timeOut(req: number, index: number): void {
            alert.showFWords('邮件过期了~');
            clientCore.MailManager.ins.removeMail(1, req);
            this.mailList.deleteItem(index);
            this.imgNoMail.visible = this.mailList.length <= 0;
        }
    }
}