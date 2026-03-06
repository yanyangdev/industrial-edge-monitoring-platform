TYPE MachineData :
STRUCT
	Temperature: REAL;
	Vibration: REAL; // mm/s (simulated)
	Status: INT; // 0=Idle, 1 = Starting, 2 = Running, 3=Error
	Error: BOOL; 
END_STRUCT
END_TYPE
