import logging
import cv2
import sys
import io
import json
import numpy as np
from av import VideoFrame
from aiortc import VideoStreamTrack
from services.tfmodels import ITFModel
from djitellopy import Tello
from qdi import IFactory
from PIL import Image
from time import sleep
from services.ws import WebSocketManager

class Camera:
    def __init__(self, tello: Tello):
        self.tello = tello
        #self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        #self.cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    def read(self):
        self.frame = self.tello.get_frame_read()
        #self.frame = np.array(Image.fromarray(self.frame))
        return 1, self.frame.frame

    def capture_image(self):

        frame = self.tello.get_frame_read()
        fo = io.BytesIO()
        fo.write(frame.frame)
        fo.seek(0)
        return fo
        #return fo.getvalue()


class VideoTracker:
    def __init__(self, camera: Camera, factory: IFactory, socket_manager: WebSocketManager):
        self.camera=camera
        self.factory=factory
        self.socket_manager=socket_manager

    def prepare(self):
        return VideoImageTrack(self.camera, self.factory, self.socket_manager)


class VideoImageTrack(VideoStreamTrack):
    def __init__(self, camera: Camera, factory: IFactory, socket_manager: WebSocketManager):
        super().__init__()
        self.camera=camera
        self.factory=factory
        self.socket_manager=socket_manager

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        return_value, image = self.camera.read()

        try:
            tfmodel=self.factory.create(ITFModel)
            image, detected_classes, direction=tfmodel.predict(image)
            #print(detected_classes)
            #print(direction)
            detected_classes=json.dumps(detected_classes)
            await self.socket_manager.send(detected_classes)
        except NotImplementedError:
            pass
        except Exception as ex:
            print(ex)

        frame = VideoFrame.from_ndarray(image, format="bgr24")
        frame.pts = pts
        frame.time_base = time_base
        return frame
