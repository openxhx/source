namespace clientCore {
    export interface IMiniGameResult {
        stageId: number;
        isWin: boolean;
        score: number,
        type: number,
        gametype?: number; //针对一些特殊的
        txtTitle?: string
        txtValue?: string;
        rewardInfo?: pb.IItemInfo[]
    }

    export class MiniGameResultMgr {

        /**打开小游戏结算面板，返回值
         *  0关闭
         *  1重来
         *  -1 错误
         */
        static openResultPanel(data: IMiniGameResult): Promise<number> {
            return new Promise((ok)=>{
                net.sendAndWait(new pb.cs_mini_game_over({ type: data.type, score: data.score, stageId: data.stageId })).then(async(msg: pb.sc_mini_game_over) => {
                    data.isWin = msg.outcome == 1;
                    data.rewardInfo = msg.rewardInfo;
                    let mod: core.BaseModule = await ModuleManager.open('miniGameResult.MiniGameResultModule', data);
                    mod.once('exit', this, ok, [0]);
                    mod.once('again', this, ok, [1]);
                }).catch(() => {
                    ok(-1);
                })
            })
        }
    }
}