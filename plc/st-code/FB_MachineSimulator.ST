FUNCTION_BLOCK FB_MachineSImulator
VAR_INPUT
	ResetCmd: BOOL;
END_VAR

VAR_OUTPUT
	Data: MachineData;
END_VAR

VAR
	state 			: INT 	:= 0;
	startCounter 	: INT 	:= 0;
	t 				: REAL	:= 25.0;
	v 				: REAL	:= 0.2;

	prevReset		: BOOL	:= FALSE;
	
	seed			: DINT 	:= 15565;
	noise 			: REAL	:= 0.0;
	
	m : DINT;
END_VAR

VAR CONSTANT
		
	TEMP_LIMIT 		: REAL	:= 80.0;
	TEMP_RAMP_UP	: REAL	:= 0.8;
	TEMP_RAMP_DOWN	: REAL	:= 1.5;	
	VIB_BASE		: REAL	:= 0.4;
	VIB_LOAD		: REAL	:= 1.2;
	
END_VAR

seed := seed *324376546 +12345;
m := seed MOD 1000;
IF m < 0 THEN
	m := -m ;
END_IF
noise := DINT_TO_REAL(m) / 1000.0 -0.5;

IF(ResetCmd = TRUE) AND (prevReset = FALSE) THEN 
	state := 0;
	startCounter := 0;
	t := 25.0;
	v := 0.2;	
END_IF
prevReset := ResetCmd;

CASE state OF 
	0: //Idle
		Data.Status := 0;
		Data.Error := FALSE;
		
		IF t > 25.0 THEN 
			t := t - 0.3;
		END_IF
		v := 0.2 + 0.05*noise;

		startCounter := startCounter + 1;
		IF startCounter >= 20 THEN 
			startCounter := 0;
			state := 1;
		END_IF  
	
	1: // starting
		Data.Status := 1 ;
		Data.Error := FALSE;
		
		t := t + (TEMP_RAMP_UP * 0.5 ) + 0.1 * noise;
		v := VIB_BASE * 0.2 +0.1 * noise;
		
		startCounter := startCounter + 1;
		IF startCounter >= 30 THEN 
			startCounter := 0;
			state := 2;
		END_IF
	
	2: // running
		Data.Status := 2 ;
		Data.Error := FALSE; 
		
		t := t + TEMP_RAMP_UP + 0.2 * noise;
	 	v := VIB_BASE + VIB_LOAD + 0.3 * noise;
		
		IF t > TEMP_LIMIT THEN
			state := 3;
		END_IF
		
	
	3: // error 
		Data.Status := 3;
		Data.Error := TRUE;
		
		IF t > 30.0 THEN
			t := t - TEMP_RAMP_DOWN + 0.1 * noise;
		END_IF
		v := 0.1 + 0.05 * noise;
	ELSE
		state:=0;
END_CASE


Data.Temperature := t;
Data.Vibration   := v;
Data.Status      := state;
Data.Error       := (state = 3);
