namespace clientCore {
    /**
     * 实体管理者
     */
    export class AvatarManager {

        private _map: util.HashMap<Avatar> = new util.HashMap<Avatar>();

        constructor() { }

        add(key: number, value: Avatar): void {
            this._map.add(key, value);
        }

        remove(key: number): void {
            this._map.remove(key);
        }

        update(): void {
            let array: Avatar[] = this._map.getValues();
            _.forEach(array, (element) => { element.update(); })
        }

        clear(): void {
            let array: Avatar[] = this._map.getValues();
            _.forEach(array, (element) => { element.dispose(); });
            this._map.clear();
        }

        createBoss(data: xls.bossRaid, dieT?: number): BossXM {
            let boss: BossXM = new BossXM();
            boss.init(data);
            boss.dieT = dieT || 0;
            boss.addLayer();
            return boss;
        }

        /** 创建春节主活动的福袋*/
        createFu(data: string): FuAvatar{
            let fu: FuAvatar = new FuAvatar();
            fu.init(data);
            fu.addLayer();
            return fu;
        }

        /** 创建春节主活动的NPC*/
        createNpc(data: number): NpcAvatar{
            let npc: NpcAvatar = new NpcAvatar();
            npc.init(data);
            npc.addLayer();
            return npc;
        }

        createNian(): NianAvatar{
            let nian: NianAvatar = new NianAvatar();
            nian.init(null);
            nian.addLayer();
            return nian;
        }

        private static _ins: AvatarManager;
        public static get ins(): AvatarManager {
            return this._ins || (this._ins = new AvatarManager());
        }
    }
}