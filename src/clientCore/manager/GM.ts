namespace clientCore {

    export class GM extends ui.GMUI {

        constructor() { super(); }


        show(): void {
            DialogMgr.ins.open(this);
            this.inputUid.text = clientCore.LocalInfo.uid + "";
            this.inputValue.text = this.inputTitle.text = this.inputType.text = "1";
        }

        hide(): void {
            DialogMgr.ins.close(this);
        }

        addEventListeners(): void {
            BC.addEvent(this, this.btnClose, Laya.Event.CLICK, this, this.hide);
            BC.addEvent(this, this.btnMail, Laya.Event.CLICK, this, this.sendMail);
            BC.addEvent(this, this.btnPray, Laya.Event.CLICK, this, this.playSkill);
            BC.addEvent(this, this.btnEffect, Laya.Event.CLICK, this, this.playEffect);
            BC.addEvent(this, this.btnSound, Laya.Event.CLICK, this, this.playSound);
            BC.addEvent(this, this.btnAddPerson, Laya.Event.CLICK, this, this.addMapPerson);
            BC.addEvent(this, this.btnAge, Laya.Event.CLICK, this, this.setAge);
            BC.addEvent(this, this.btnBoss, Laya.Event.CLICK, this, this.onBoss);
            BC.addEvent(this, this.btnDamage, Laya.Event.CLICK, this, this.onDamage);
            BC.addEvent(this, this.btnRole, Laya.Event.CLICK, this, this.onRole);
        }

        removeEventListeners(): void {
            BC.removeEvent(this);
        }

        destroy(): void{
            this.sk?.destroy(true);
            this.sk = null;
            super.destroy();
        }

        private static $ID: number = 0;
        private addMapPerson(): void {
            let userInfo: pb.UserBase = new pb.UserBase();
            userInfo.userid = GM.$ID++;
            userInfo.curClothes = clientCore.LocalInfo.wearingClothIdArr;
            userInfo.nick = "啦啦啦";
            userInfo.sex = clientCore.LocalInfo.sex;
            userInfo.x = clientCore.PeopleManager.getInstance().player.x;
            userInfo.y = clientCore.PeopleManager.getInstance().player.y;
            clientCore.PeopleManager.getInstance().addMapPeople([userInfo]);
        }

        /** 发送邮件*/
        private sendMail(): void {
            if (this.inputUid.text == "" || this.inputValue.text == "" || this.inputType.text == "" || this.inputTitle.text == "") return;

            let array: string[] = this.inputReward.text.split(";");
            let value: string = '';
            let len: number = array.length;
            for (let i: number = 0; i < len; i++) {
                let arr: string[] = array[i].split("/");
                let name: string = arr[0];
                if (!Number(name)) {
                    let id: number = ItemsInfo.getIdByName(name);
                    if (!id) continue;
                    name = id.toString();
                };
                value += `{"itemId":${name},"itemCnt":${arr[1]}}` + (i == len - 1 ? '' : ',');
            }
            let mail = new pb.cs_send_mail();
            mail.recvid = parseInt(this.inputUid.text);
            mail.send = LocalInfo.uid;
            mail.type = parseInt(this.inputType.text);
            mail.title = this.inputTitle.text;
            mail.content = this.inputValue.text;
            if (this.inputReward.text)
                mail.rewardInfo = `{"items":[${value}]}`;
            net.send(mail)
        }

        private async playSkill(): Promise<void> {
            let skillId: number = Number(this.inputPray.text);
            await xls.load(xls.SkillBase);
            await clientCore.SceneManager.ins.register();
            let skill: xls.SkillBase = xls.get(xls.SkillBase).get(skillId);
            if (!skill) {
                alert.showFWords("不存在技能ID为：" + skillId);
                return;
            }

            let scene: any = window["scene"];
            let url: string = pathConfig.getSkillEffect(skill.castEffect);
            let render: scene.animation.BoneRender = scene.animation.AnimationFactory.playEffect(url, Laya.Handler.create(this, () => {
                alert.showFWords("complete");
                url = pathConfig.getSkillEffect(skill.effectIdx);
                let render: scene.animation.BoneRender = scene.animation.AnimationFactory.playEffect(url, Laya.Handler.create(this, () => {
                    alert.showFWords("hit");
                }), "hit");
                render.pos(Laya.stage.width / 2, Laya.stage.height / 2);
                Laya.stage.addChild(render);
            }), "complete");
            render.pos(Laya.stage.width / 2, Laya.stage.height / 2);
            Laya.stage.addChild(render);
        }

        private async playEffect(): Promise<void> {
            let effectID: string = this.inputEffect.text;
            await clientCore.SceneManager.ins.register();
            let scene: any = window["scene"];
            let url: string = pathConfig.getSkillEffect(effectID);
            let render: scene.animation.BoneRender = scene.animation.AnimationFactory.getBoneEffect(url, false);
            render.pos(Laya.stage.width / 2, Laya.stage.height / 2);
            Laya.stage.addChild(render);
        }

        private playSound(): void {
            let id: number = Number(this.inputSound.text);
            if (!id) return;
            // core.SoundManager.instance.playBattleSound(pathConfig.getBattleSound(id));
        }

        private setAge(): void {
            if (this.inputAge.text != "") {
                clientCore.LocalInfo.age = channel.ChannelConfig.age = parseInt(this.inputAge.text);
            }
        }

        private onBoss(): void {
            net.send(new pb.cs_set_world_boss_time({ prepareTime: this.itWait.text, beginTime: this.itStart.text, endTime: this.itClose.text }));
        }

        private onDamage(): void {
            net.sendAndWait(new pb.cs_send_damage_for_world_boss({ damage: Number(this.itDamage.text) })).then((msg: pb.sc_send_damage_for_world_boss) => {
                // EventManager.event(globalEvent.BOSS_BLOOD_REFRESH, msg.remainBlood);
            });
        }

        private sk: Laya.Skeleton;
        private onRole(): void{
            this.sk?.destroy(true);
            this.sk = null;
            let roleId: number = parseInt(this.itRole.text);
            let path: string = pathConfig.getRoleBattleSk(roleId);
            this.sk = new Laya.Skeleton();
            let index: number = 0;
            this.sk.load(path,new Laya.Handler(this,()=>{
                this.sk.play(index,false);
                this.sk.on(Laya.Event.LABEL,this,(data:Laya.EventData)=>{
                    alert.showFWords(data.name);
                })
                this.sk.on(Laya.Event.STOPPED,this,()=>{
                    this.sk.play(++index%this.sk.getAnimNum(),false);
                });
            }));
            this.sk.pos(Laya.stage.width / 3, Laya.stage.height / 2);
            Laya.stage.addChild(this.sk);
        }

        private static _ins: GM;
        public static show(): void {
            this._ins = this._ins || new GM();
            this._ins.show();
        }
    }
}