namespace activity {
    export class ActivityBasePanel<T> {
        public ui: T;
        private _preLoadList: Promise<any>[] = [];
        constructor(uiCls: { new(): T }) {
            this.ui = new uiCls();
            this.init();
            this.addEvent();
        }

        protected init() {

        }

        get preLoadLen() {
            return this._preLoadList.length;
        }

        protected addPreLoad(pro: Promise<any>) {
            this._preLoadList.push(pro);
        }


        public waitPreLoad() {
            return Promise.all(this._preLoadList);
        }
        public preLoadOver() {

        }

        protected addEvent() {

        }

        protected removeEvent() {

        }

        destory() {
            this.removeEvent();
            this.ui = null;
        }
    }
}