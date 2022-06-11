namespace godMirror {
    /** 分解到各个层级上 */
    export function sortLayer(cell: ui.godMirror.render.GodMirrorShowTopRenderUI, layer: { bg: Laya.Sprite, person: Laya.Sprite, up: Laya.Sprite }) {
        let parent = layer.bg;
        let w = cell.width / 2
        let h = cell.height;

        let bg = cell.imgBg;
        let bgPos = cell.localToGlobal(new Laya.Point(bg.x, bg.y), false, parent);
        bg.pos(bgPos.x - w, bgPos.y - h, true);
        layer.bg.addChild(bg);

        let person = cell.mcCon;
        let personPos = cell.localToGlobal(new Laya.Point(person.x, person.y), false, parent);
        person.pos(personPos.x - w, personPos.y - h, true);
        layer.person.addChild(person);

        let btn = cell.boxBtn;
        let btnPos = cell.localToGlobal(new Laya.Point(btn.x, btn.y), false, parent);
        btn.pos(btnPos.x - w, btnPos.y - h, true);
        layer.up.addChild(btn);

        let up = cell.boxUp;
        let upPos = cell.localToGlobal(new Laya.Point(up.x, up.y), false, parent);
        up.pos(upPos.x - w, upPos.y - h, true);
        layer.up.addChild(up);
    }

    /**
     * 设置UI
     */
    export function setGodMirrorRender(cell: ui.godMirror.render.GodMirrorShowTopRenderUI, data: pb.IMirrorRankInfo, idx: number = 0) {
        if (!data) {
            cell.mcCon.visible = false;
            cell.boxUp.visible = false;
            cell.btnLeft.disabled = cell.btnRight.disabled = true;
            cell.scale(1, 1);
            if (idx >= 0)
                cell.imgBg.skin = `unpack/godMirror/${idx + 1}.png`;
            else
                cell.imgBg.skin = `unpack/godMirror/3.png`;
            let s = [1, 0.9, 0.8][idx];
            cell.scale(s, s);
            cell.btnRight.skin = 'godMirror/dian_zan.png';
            return;
        }
        cell.mcCon.visible = true;
        cell.boxUp.visible = true;
        //基础信息
        cell.txtNick.text = data.nick;
        cell.txtId.text = data.userid.toString();
        cell.txtHot.text = '热度:' + data.hot.toString();
        cell.txtRank.text = data.ranking.toString();
        cell.txtRank.visible = data.ranking > 3;
        cell.imgRank.visible = data.ranking <= 3;
        cell.imgRank.skin = `godMirror/rank${Math.min(3, data.ranking)}.png`;
        cell.imgBg.skin = `unpack/godMirror/${Math.min(3, data.ranking)}.png`;
        let s = [1, 1, 0.9, 0.8, 1][Math.min(4, data.ranking)];
        cell.scale(s, s);
        //人物衣服
        if (cell.mcCon.numChildren == 0) {
            let female = new clientCore.Person(1);
            let male = new clientCore.Person(2);
            female.scale(0.4, 0.4);
            male.scale(0.4, 0.4);
            cell.mcCon.addChild(female);
            cell.mcCon.addChild(male);
        }
        let female = cell.mcCon.getChildAt(0) as clientCore.Person;
        let male = cell.mcCon.getChildAt(1) as clientCore.Person;
        let sex = data.sexy;
        female.visible = sex == 1;
        male.visible = sex == 2;
        sex == 1 ? female.replaceByIdArr(data.image) : male.replaceByIdArr(data.image);
        //按钮状态
        cell.btnLeft.disabled = data.userid != clientCore.LocalInfo.uid;
        cell.btnRight.disabled = false;
        //有红包
        if (data.redPacket > 0 && data.redPacketFlag == 0) {
            cell.btnRight.skin = 'godMirror/hong_bao.png';
        }
        else {
            cell.btnRight.skin = data.isLiked ? 'godMirror/t_p_yizan.png' : 'godMirror/dian_zan.png';
        }
    }

    export function destoryRender(cell: ui.godMirror.render.GodMirrorShowTopRenderUI) {
        if (cell.mcCon.numChildren > 0) {
            for (let i = 0; i < cell.mcCon.numChildren; i++) {
                cell.mcCon.getChildAt(0)?.destroy();
            }
            cell.mcCon.removeChildren();
        }
    }
}