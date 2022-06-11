namespace seventhMoonNight {
    export class SeventhMoonNightControl implements clientCore.BaseControl {
        //获取面板
        public getPanelInfo(): Promise<pb.sc_qixi_lover_night_info> {
            return net.sendAndWait(new pb.cs_qixi_lover_night_info()).then((msg: pb.sc_qixi_lover_night_info) => {
                return Promise.resolve(msg);
            });
        }

        //制作花灯
        public makeFlowerLight(index: number): Promise<pb.sc_qixi_lover_night_make_hua> {
            return net.sendAndWait(new pb.cs_qixi_lover_night_make_hua({index: index})).then((msg: pb.sc_qixi_lover_night_make_hua) => {
                return Promise.resolve(msg);
            });
        }

        //玩花灯放材料
        public useMaterialsPlayFlowerLight(index: number): Promise<pb.sc_qixi_lover_night_release_material> {
            return net.sendAndWait(new pb.cs_qixi_lover_night_release_material({
                index: index
            })).then((msg: pb.sc_qixi_lover_night_release_material) => {
                return Promise.resolve(msg);
            });
        }

        //游戏完成领取奖励
        public getGameSuccReward(flag: number, hua: number): Promise<pb.sc_qixi_lover_night_hua_reward> {
            return net.sendAndWait(new pb.cs_qixi_lover_night_hua_reward({
                flag: flag,
                hua: hua
            })).then((msg: pb.sc_qixi_lover_night_hua_reward) => {
                return Promise.resolve(msg);
            });
        }

        //集齐诗句奖励
        public getPoemsReward(index: number): Promise<pb.sc_qixi_lover_night_poems_reward> {
            return net.sendAndWait(new pb.cs_qixi_lover_night_poems_reward({
                index: index
            })).then((msg: pb.sc_qixi_lover_night_poems_reward) => {
                return Promise.resolve(msg);
            });
        }
    }
}