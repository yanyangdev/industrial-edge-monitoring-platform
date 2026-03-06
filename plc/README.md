# PLC Simulation – Industrial Machine Model

This directory contains the PLC simulation used in the **Industrial Edge Data Acquisition & Monitoring Platform**.

The PLC program simulates an industrial machine and exposes structured machine data via **OPC UA** for external systems such as the **Node Edge Service**.

The simulation represents the **OT (Operational Technology) layer** in the overall system architecture.

---

# Overview

The PLC program is implemented using **Structured Text (ST)** in **CODESYS SoftPLC**.

Its main purpose is to simulate realistic machine telemetry including:

- Temperature
- Vibration
- Machine State
- Error Condition

The data is published through the **CODESYS OPC UA Server** and consumed by the **Node Edge Service**.

---

# Machine Data Model

The PLC exposes a structured data object called `MachineData`.

```text
MachineData
 ├ Temperature : REAL
 ├ Vibration   : REAL
 ├ Status      : INT
 └ Error       : BOOL
```

Description:

| Field       | Description                                       |
| ----------- | ------------------------------------------------- |
| Temperature | Simulated machine temperature                     |
| Vibration   | Simulated vibration level                         |
| Status      | Machine state (Idle / Starting / Running / Error) |
| Error       | Indicates whether the machine is in a fault state |

# Machine State Machine

The PLC implements a simple but realistic machine state machine.

```
0 = Idle
1 = Starting
2 = Running
3 = Error
```

State transitions:

```
Idle
  │ StartCmd
  ▼
Starting
  │ Startup timer complete
  ▼
Running
  │ Temperature > 80
  ▼
Error
  │ Reset command
  ▼
Idle
```

------

# Simulation Logic

The PLC program generates simulated sensor values to mimic a running industrial machine

### Temperature

Temperature gradually increases while the machine is running.

Example behavior:

```
Running → Temperature increases
Idle → Temperature slowly decreases
```

If temperature exceeds threshold:

```
Temperature > 80 → Error State
```

------

### Vibration

Vibration is simulated as a small fluctuating value during operation.

```
Running → random vibration variation
Idle → low vibration
```

------

# Task Configuration

The PLC program runs in a cyclic task.

Recommended configuration:

| Parameter  | Value  |
| ---------- | ------ |
| Cycle Time | 100 ms |

This update rate ensures the OPC UA client receives timely telemetry updates.

# OPC UA Integration

The PLC variables are exposed through **CODESYS OPC UA Server**.

OPC UA Endpoint example:

```
opc.tcp://<OT_IP>:4840
```

Where:

```
OT_IP = IP address of the OT node running the CODESYS SoftPLC
```

The following variables are mapped:

```
MachineData.Temperature
MachineData.Vibration
MachineData.Status
MachineData.Error
```

These nodes are consumed by the **Node Edge Service**.



## OPC UA Server Configuration

Configuration of the OPC UA Server, certificates, and security settings follows the official CODESYS documentation.

For detailed configuration steps see:

**CODESYS OPC UA Server Documentation**

[https://content.helpme-codesys.com/en/CODESYS%20Communication/_cds_runtime_opc_ua_server.html](https://content.helpme-codesys.com/en/CODESYS Communication/_cds_runtime_opc_ua_server.html?utm_source=chatgpt.com)

During development:

1. Verify endpoint connectivity using **UaExpert**
2. Confirm variable visibility
3. Enable stronger security settings if required

------



# Reset Mechanism

A reset variable is used to clear error conditions.

```
ResetCmd : BOOL
```

Behavior:

```
ResetCmd = TRUE
→ Error cleared
→ Machine returns to Idle
```

------

# File Structure

Example PLC code organization:

```
plc
 ├ README.md
 ├ st-code
 │   ├ MachineData.ST
 │   ├ GVL_Machine.ST
 │   ├ FB_MachineSimulator.ST
 │   └ PLC_Main.ST
 └ project
     └ codesys_project.projectarchive
```

Explanation:

| Folder  | Purpose                                                     |
| ------- | ----------------------------------------------------------- |
| st-code | Exported ST source code for readability and version control |
| project | Complete CODESYS project archive                            |

The ST files are exported from the CODESYS project to make the PLC logic easier to review in Git.

------

# How to Run the PLC Simulation

1. Open the project in **CODESYS Development System V3**
2. Start **CODESYS Control Win**
3. Login to the PLC
4. Start the runtime
5. Verify variables in the Watch window
6. Confirm OPC UA server is enabled

------

# Verification

The PLC simulation can be verified using:

### UaExpert

Connect to:

```
opc.tcp://<OT_IP>:4840
```

Browse nodes:

```
MachineData.Temperature
MachineData.Vibration
MachineData.Status
MachineData.Error
```

Values should update in real time.

------

# Role in Overall Architecture

This PLC simulation represents the **OT layer** in the system architecture:

```
PLC (CODESYS)
      ↓ OPC UA
Node Edge Service
      ↓ MQTT
Backend Service
      ↓
PostgreSQL
      ↓
React Dashboard
```

------

# Notes

This PLC implementation is intended for **development and demonstration purposes only** and simulates industrial machine behavior.

In real production environments:

- PLC logic would interact with physical sensors
- Safety logic would be implemented
- Communication security would be enforced