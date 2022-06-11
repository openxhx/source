namespace roleChain2 {
    export interface IBaseRolePanel {
        show(roleId: number);
        dispose(): void;
        extraBox?: Laya.Box;
    }
}