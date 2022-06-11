namespace operaDrama {
    const NAME = [
        '罗切斯莫德·柯尼',
        '何波吉亚·阿诺德',
        '罗切斯莫德·诺兰',
        '何波吉亚·萨尔玛'
    ];
    const CONTENT = [
        '介绍\n罗切斯莫德家族尊贵的大小姐，自小备受宠爱，生活在父亲可以塑造的温馨环境中。\n获得了始祖天穹鸟心脏的认可，即将继任云巅之舟大祭司一职。\n\n爱好\n手工制品，品尝小吃',
        '介绍\n出生于云舟下层，后被何波吉亚伯爵看中收为养子，带到上层抚养。\n拥有较强的共情能力和与生俱来的军事天赋，深知下层人民生活的艰苦。\n\n爱好\n喜欢美食，对烹饪很有讲究',
        '介绍\n因为儿时家族发生的事情而变得性格偏执，随着年龄生长逐渐变得病娇。\n脸上总挂着温柔笑意，战斗力爆表。只有妹妹柯尼才能调动他的情绪。\n\n爱好\n击剑、训练',
        '介绍\n何波吉亚家族唯一的女儿，性格高傲沉静，愿意为了家族奉献一切。\n与温室长大的娇花不同，更像是拥有尖刺的蔷薇。\n\n爱好\n研究天穹鸟的传说'
    ]

    export class OperaIntroPanel extends ui.operaDrama.panel.OperaIntroPanelUI {
        private _colorFilter: Laya.ColorFilter;
        constructor() {
            super();
            this.listTab.dataSource = [0, 1, 2, 3];
            this.listTab.selectEnable = true;
            this.listTab.renderHandler = new Laya.Handler(this, this.onListRender);
            this.listTab.selectHandler = new Laya.Handler(this, this.onListSelect);
            this._colorFilter = new Laya.ColorFilter();
            this._colorFilter.setColor('#ffffff');
            this.listTab.selectedIndex = 0;
        }

        show() {
            clientCore.Logger.sendLog('2020年9月30日活动','【主活动】中秋话剧面板和剧情','打开人物介绍面板');
        }

        private onListRender(cell: Laya.Box, idx: number) {
            if (!this._closed) {
                let imgName = cell.getChildByName('imgName') as Laya.Image;
                imgName.skin = `operaDrama/name_${idx}.png`;
                imgName.filters = this.listTab.selectedIndex == idx ? [this._colorFilter] : [];
                cell.getChildByName('imgBg')['skin'] = this.listTab.selectedIndex == idx ? 'operaDrama/tabselect.png' : 'operaDrama/tabno.png';
            }
        }

        private onListSelect(idx: number) {
            this.txtName.text = NAME[idx];
            this.txtContent.text = CONTENT[idx];
            this.imgRole.skin = `res/otherLoad/operaDrama/role${idx}.png`;
        }

        destroy() {
            super.destroy();
            this._colorFilter = null;
        }
    }
}