

namespace rank {

    export class RankItem extends ui.rank.render.RankItemUI {
        constructor() { super(); }

        setData(info: clientCore.RankInfo): void {
            this.setLabel(info.cls.rankId);
            let ranking: number = info.msg.ranking;
            let showImg: boolean = ranking <= 3;
            this.imgRank.visible = showImg;
            this.txRank.visible = !showImg;
            this.txValue.changeText("" + info.msg.score);
            this.setColor(["#FF6C00", "#C839C7", "#4EA9F6"][ranking - 1] || "#4d3118");

            if (info.msg instanceof pb.RankInfo) {
                this.txNick.changeText(info.msg.userBase.nick);
                this.txFamily.changeText(info.msg.userBase.familyName || "暂无家族");
            } else if (info.msg instanceof pb.FamilyRankInfo) {
                this.txFamily.changeText(info.msg.familyName);
            }

            if (showImg) {
                this.imgRank.skin = `rank/NO${ranking}.png`;
            } else {
                this.txRank.changeText("" + ranking);
            }
        }

        setMyData(info: clientCore.RankInfo, userInfo: pb.IUserBase, score: number): void {
            this.setLabel(info.cls.rankId);
            this.setColor("#A17043");
            this.imgRank.visible = false;
            this.imgRank.visible = true;
            this.txValue.changeText("" + score);
            this.txNick.changeText(userInfo.nick);
            this.txFamily.changeText(userInfo.familyName || "暂无家族");
            let showImg: boolean = info.msg && info.msg.ranking > 0 && info.msg.ranking <= 3;
            this.imgRank.visible = showImg;
            this.txRank.visible = !showImg;
            if (!info.msg || info.msg.ranking == 0) {
                this.txRank.changeText("未上榜");
            } else {
                showImg ? this.imgRank.skin = `rank/NO${info.msg.ranking}.png` : this.txRank.changeText(info.msg.ranking + "");
            }
        }

        private setColor(color: string): void {
            this.txFamily.color = this.txNick.color = this.txValue.color = this.txRank.color = color;
        }

        private setLabel(rankId: number): void {
            let isFamily: boolean = rankId == 3;
            this.txNick.visible = !isFamily;
            let nodes: Laya.Sprite[] = [this.imgRank, this.txRank, this.txFamily, this.txValue];
            let pos: number[] = isFamily ? [65, 70, 205, 426] : [27, 32, 290, 467];
            for (let i: number = 0; i < 4; i++) { nodes[i].x = pos[i]; }
        }
    }
}