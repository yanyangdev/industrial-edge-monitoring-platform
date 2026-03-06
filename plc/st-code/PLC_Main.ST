PROGRAM PLC_Main
VAR
	Sim : FB_MachineSImulator;
END_VAR

Sim(ResetCmd := GVL_Machine.gResetCmd);


GVL_Machine.gMachineData := Sim.Data;