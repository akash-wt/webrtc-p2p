Sender                         Signaling Server                    Receiver
------                         ----------------                    --------
getUserMedia() -> MediaStream
createOffer() -> SDP Offer  -->  Offer ----------------------> setRemoteDescription(Offer)
setLocalDescription(Offer)

                                Answer <---------------------- createAnswer() -> SDP Answer
                                Ice Candidates <-------------> Ice Candidates

Add Tracks -> Stream ---------------------------------------> ontrack -> Display Video
