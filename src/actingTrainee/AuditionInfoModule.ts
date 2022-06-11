namespace actingTrainee {
    /**
     * 2020.9.14
     * 演剧练习生-试镜详情界面
     * actingTrainee.RankModule
     */
    export class AuditionInfoModule extends ui.actingTrainee.AuditionInfoModuleUI {
        private _tab: number = 0;

        init(data?: any) {
            super.init(data);
            this._tab = data.type;
        }

        initOver(): void {
            if (this._tab == 0) {
                this.showView1();
            } else if (this._tab == 1) {
                this.showView2();
            } else if (this._tab == 2) {
                this.showView3();
            }
        }

        private showView1(): void {
            this.imgRole.skin = "unpack/actingTrainee/p1.png";
            this.imgName.skin = "actingTrainee/auditionName1.png";

            this.labTiaojian.text = "演剧排行榜排名第一";
            this.labJieshao.text = "出生于云舟下层，后被何波吉亚伯爵看中收为养子，带到上层抚养。 \n拥有较强的共情能力和与生俱来的军事天赋，深知下层人民生活的艰苦。";
            this.labAihao.text = "喜欢美食，对烹饪很有讲究";

            this.imgRole1.visible = true;
            this.imgSelect1.visible = true;
            this.imgRole2.visible = false;
            this.imgSelect2.visible = false;
            this.imgRole3.visible = false;
            this.imgSelect3.visible = false;
        }

        private showView2(): void {
            this.imgRole.skin = "unpack/actingTrainee/p2.png";
            this.imgName.skin = "actingTrainee/auditionName2.png";

            this.labTiaojian.text = "演剧排行榜排名第二";
            this.labJieshao.text = "因为儿时家族发生的事情而变得性格偏执，随着年龄生长逐渐变得病娇。\n脸上总挂着温柔笑意，战斗力爆表。只有妹妹柯尼才能调动他的情绪。";
            this.labAihao.text = "击剑、训练";

            this.imgRole1.visible = false;
            this.imgSelect1.visible = false;
            this.imgRole2.visible = true;
            this.imgSelect2.visible = true;
            this.imgRole3.visible = false;
            this.imgSelect3.visible = false;
        }

        private showView3(): void {
            this.imgRole.skin = "unpack/actingTrainee/p3.png";
            this.imgName.skin = "actingTrainee/auditionName3.png";

            this.labTiaojian.text = "演剧排行榜排名第三";
            this.labJieshao.text = "何波吉亚家族唯一的女儿，性格高傲沉静，愿意为了家族奉献一切。\n与温室长大的娇花不同，更像是拥有尖刺的蔷薇。";
            this.labAihao.text = "研究天穹鸟的传说";

            this.imgRole1.visible = false;
            this.imgSelect1.visible = false;
            this.imgRole2.visible = false;
            this.imgSelect2.visible = false;
            this.imgRole3.visible = true;
            this.imgSelect3.visible = true;
        }

        addEventListeners() {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.destroy);
            BC.addEvent(this, this.boxRole1, Laya.Event.CLICK, this, this.showView1);
            BC.addEvent(this, this.boxRole2, Laya.Event.CLICK, this, this.showView2);
            BC.addEvent(this, this.boxRole3, Laya.Event.CLICK, this, this.showView3);
        }

        removeEventListeners() {
            super.removeEventListeners();
            BC.removeEvent(this);
        }

        destroy(): void {
            super.destroy();
        }
    }
}