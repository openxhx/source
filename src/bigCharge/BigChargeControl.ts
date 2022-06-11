namespace bigCharge{
    export class BigChargeControl{
        private static _control:BigChargeControl;
        private constructor(){};
        public static get instance():BigChargeControl{
            if(!this._control){
                this._control = new BigChargeControl();
            }
            return this._control;
        }

        /** */
    }
}