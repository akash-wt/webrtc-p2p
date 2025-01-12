import { useEffect, useRef } from "react";


export default function Receiver() {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        let socket = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "receiver" }));
        }
        pc.onicecandidate = (event) => {
            console.log('ice candidate on receiver', event);
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }))
            }
        };

        pc.ontrack = (event) => {
            const [stream] = event.streams;
            if (videoRef.current)
                videoRef.current.srcObject = stream; 
        };


        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "createOffer") {
                await pc.setRemoteDescription(message.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({ type: "createAnswer", sdp: answer }))
            } else if (message.type === "iceCandidate") {
                await pc.addIceCandidate(message.candidate);
            }

        }
        return () => {
            socket.close();
            pc.close();
        };

    }, [])


    return (
        <div>
            <div>Receiver</div>
            <video autoPlay playsInline controls ref={videoRef} style={{ width: "100%", height: "auto" }} ></video>

        </div>)
}