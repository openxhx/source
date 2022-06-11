namespace actingTrainee {

    export class RankItem extends ui.actingTrainee.render.RankRenderUI {
        constructor() { super(); }

        setData(info: clientCore.RankInfo): void {
            let ranking: number = info.msg.ranking;
            let showImg: boolean = ranking <= 3;
            this.imgRank.visible = showImg;
            this.labRank.visible = !showImg;
            this.labValue.changeText("" + info.msg.score);

            if (info.msg instanceof pb.RankInfo) {
                this.labName.changeText(info.msg.userBase.nick);
                this.labFname.changeText(info.msg.userBase.familyName || "暂无家族");
                this.imgSelect.visible = false;
            }

            if (showImg) {
                this.imgRank.skin = `actingTrainee/top${ranking}.png`;
            } else {
                this.labRank.changeText("" + ranking);
            }
            this.setColor(["#FF6C00", "#C839C7", "#4EA9F6"][ranking - 1] || "#4d3118");
        }

        private setColor(color: string): void {
            this.labRank.color = this.labName.color = this.labFname.color = this.labValue.color = color;
        }
    }
}