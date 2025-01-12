import { useEffect, useState, useRef } from "react";

export default function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "sender" }));
        };
        setSocket(socket);

        return () => {
            socket.close();
        };
    }, []);

    async function startSendingVideo() {
        if (!socket) return;

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({ type: "createOffer", sdp: offer }));
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(
                    JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
                );
            }
        };

        socket.onmessage = async (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            if (data.type === "createAnswer") {
                await pc.setRemoteDescription(data.sdp);
            } else if (data.type === "iceCandidate") {
                try {
                    await pc.addIceCandidate(data.candidate);
                } catch (e) {
                    console.error("Error adding ICE Candidate on sender page", e);
                }
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, frameRate: 60 },
                audio: true,
            });

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            if (videoRef2.current) {
                videoRef2.current.srcObject = stream;
            }
        } catch (e) {
            console.error("Error accessing media devices:", e);
        }
    }

    return (
        <div>
            <div>
                <div>Sender</div>
                <button onClick={startSendingVideo}>Send video</button>
            </div>
            <video
                autoPlay
                ref={videoRef2}
                 controls 
                style={{ width: "100%", height: "auto" }}
            ></video>
        </div>
    );
}
