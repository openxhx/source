namespace diningCarRule {
    export class DiningCarRuleModule extends ui.diningCarRule.DiningCarRuleUI {
        private step: number = 1;
        private root: number;
        constructor() {
            super();
        }

        init(data: number) {
            this.root = data;
            this.step = 1;
            this.setStep();
        }

        private setStep() {
            this.img1.visible = this.step == 1;
            this.img2.visible = this.step == 2;
            this.img3.visible = this.step == 3;
            this.btnStart.visible = this.root == 1 && this.step == 3;
            this.btnNext.visible = this.step < 3;
            this.btnLast.visible = this.step > 1;
        }

        private changeStep(flag: number) {
            this.step += flag;
            this.setStep();
        }

        private startGame() {
            this.destroy();
            EventManager.event("DINING_CAR_SELL_START");
        }

        private closePanel() {
            this.destroy();
            EventManager.event("DINING_CAR_RULE_CLOSE");
        }

        addEventListeners() {
            BC.addEvent(this, this.btnX, Laya.Event.CLICK, this, this.closePanel);
            BC.addEvent(this, this.btnNext, Laya.Event.CLICK, this, this.changeStep, [1]);
            BC.addEvent(this, this.btnStart, Laya.Event.CLICK, this, this.startGame);
            BC.addEvent(this, this.btnLast, Laya.Event.CLICK, this, this.changeStep, [-1]);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }

        destroy() {
            super.destroy();
        }
    }
}