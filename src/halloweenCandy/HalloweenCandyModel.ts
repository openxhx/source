namespace halloweenCandy {
    export class HalloweenCandyModel {
        private static _model: HalloweenCandyModel;
        private constructor() { };
        public static get instance(): HalloweenCandyModel {
            if (!this._model) {
                this._model = new HalloweenCandyModel();
            }
            return this._model;
        }

        public serverInfo:pb.sc_halloween_candy_megagame_info;
    }
}