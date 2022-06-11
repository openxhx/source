namespace christmasInteract {
    export class ChrismasJockPanel extends ui.christmasInteract.ChristmasJockPanelUI {

        init() {
            this.sideClose = false;
        }

        private onClick() {
            net.send(new pb.cs_christmas_greetings_snowman());
            this.destroy();
        }

        addEventListeners() {
            BC.addEvent(this, this, Laya.Event.CLICK, this, this.onClick);
        }

        removeEventListeners() {
            BC.removeEvent(this);
        }
    }
}