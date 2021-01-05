from aiohttp import web
import asyncio
import sys
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaPlayer
from services.video import VideoTracker, Camera
import json
from controllers.controller import routes, Controller

class VideoController(Controller):
    def __init__(self, video_tracker: VideoTracker, camera: Camera):
        super().__init__()
        self.video_tracker=video_tracker
        self.camera=camera
        self.pcs = set()

    async def offer(self, request):
        params = await request.json()
        offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

        pc = RTCPeerConnection()
        self.pcs.add(pc)

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            print("ICE connection state is %s" % pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                self.pcs.discard(pc)

        await pc.setRemoteDescription(offer)
        pc.addTrack(self.video_tracker.prepare())

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return web.Response(
            content_type="application/json",
            text=json.dumps(
                {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
            ),
        )


    async def on_shutdown(self, app):
        coros = [pc.close() for pc in self.pcs]
        await asyncio.gather(*coros)
        self.pcs.clear()

