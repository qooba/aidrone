import qdi
import cv2
from typing import Callable
from functools import lru_cache
from services.video import VideoTracker, Camera
from services.tfmodels import ITFModel, TFModel
from services.ws import WebSocketManager
from controllers.controller import IController
from controllers.video_controller import VideoController
from controllers.tello_controller import TelloController
from workers.workers import IWorker, TFModelWorker
from djitellopy import Tello

class Bootstapper:

    def bootstrap(self):
        c = Bootstapper.container()
        c.register_instance(qdi.IContainer, c)
        c.register_instance(qdi.IFactory, qdi.Factory(c))

        # services
        c.register_singleton(Camera)
        c.register_singleton(VideoTracker)
        c.register_singleton(WebSocketManager)

        c.register_instance(ITFModel, TFModel())
        #c.register_singleton(ITFModel, TFModel)

        tello = Tello()
        tello.connect(False)
        tello.streamon()

        c.register_instance(Tello, tello)

        #c.register_instance(ITFModel, ITFModel())

        # controllers
        c.register(IController, VideoController, "video")
        c.register(IController, TelloController, "tello")

        # workers
        c.register_singleton(IWorker, TFModelWorker, 'tfmodel')

        return c



    @staticmethod
    @lru_cache()
    def container():
        return qdi.Container()
