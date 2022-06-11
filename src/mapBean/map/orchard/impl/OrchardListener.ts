namespace mapBean {
    export class OrchardListener {
        onEnter: Function;
        onStart: Function;
        onFinish: Function;
        onExit: Function;
        onUpdate: Function;
        dispose(): void {
            this.onEnter = this.onStart = this.onExit = null;
        }
    }
}