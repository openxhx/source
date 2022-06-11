namespace earthPercious{
    export class EarthPerciousControl implements clientCore.BaseControl{

        
        getInfo(): Promise<void>{
            return net.sendAndWait(new pb.cs_treasure_of_planet_panel()).then((msg: pb.sc_treasure_of_planet_panel)=>{
                clientCore.EarthPerciousMgr.initMsg(msg);
            });
        }
    }
}