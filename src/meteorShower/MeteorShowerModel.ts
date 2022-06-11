namespace meteorShower{
    export class MeteorShowerModel implements clientCore.BaseModel{
        public msg: pb.sc_get_meteor_shower;
        public ranks: clientCore.RankInfo[];
        public myRank: clientCore.RankInfo;
        dispose(): void{
            if(this.ranks) this.ranks.length = 0;
            this.myRank = this.ranks = null;
        }
    }
}