namespace library {
    /**
     * 消息体
     */
    export class LibrarySCommand {

        public static ins: LibrarySCommand;

        private _model: LibraryModel;

        constructor() {
            LibrarySCommand.ins = this;
            this._model = LibraryModel.ins;
        }

        /** 获取重建信息*/
        public getLibraryInfo(handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_rebuilding_the_library_info()).then((data: pb.sc_get_rebuilding_the_library_info) => {
                this._model.formatLibrary(data);
                handler && handler.run();
            });
        }

        /**
         * 购买礼包
         * @param giftId 
         */
        public buyGift(giftId: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_rebuilding_the_library_buy_gift({ giftId: giftId })).then((msg: pb.cs_rebuilding_the_library_buy_gift) => {
                handler && handler.run();
            })
        }

        /**
         * 获取奖励
         * @param id 
         */
        public getReward(id: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_get_rebuilding_the_library_material_reward({ id: id })).then((msg: pb.sc_get_rebuilding_the_library_material_reward) => {
                msg.item && alert.showReward(clientCore.GoodsInfo.createArray([msg.item]));
                this._model.setLibraryInfo(1, id);
                handler && handler.run();
            })
        }

        public exchange(pos: number, exchangeId: number, handler: Laya.Handler): void {
            net.sendAndWait(new pb.cs_rebuilding_the_library_exchange({ pos: pos, exchangeId: exchangeId })).then((msg: pb.sc_rebuilding_the_library_exchange) => {
                alert.showReward(clientCore.GoodsInfo.createArray(msg.item));
                this._model.setLibraryInfo(2, pos);
                handler && handler.run();
            });
        }

        public dispose(): void {
            LibrarySCommand.ins = null;
            this._model = null;
        }

    }
}