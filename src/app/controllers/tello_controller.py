import json
import sys
from controllers.controller import routes, Controller
from workers.workers import IWorker
from services.ws import WebSocketManager
from djitellopy import Tello
from services.tfmodels import ITFModel

class TelloController(Controller):
    def __init__(self, tello: Tello, tfmodel: ITFModel):
        super().__init__()
        self.tello=tello
        self.tfmodel=tfmodel

    @routes.get("/api/tello")
    async def list_projects(self, request):
        projects=self.project_manager.list_projects()
        return self.json(projects)

    @routes.post("/api/tello")
    async def command(self, request):
        comm = await request.json()
        print(comm, sys.stderr)
        c=comm['command']
        v=comm['value']
        result={'success':'ok'}
        if c == 'up':
            self.tello.move_up(v)
        elif c == 'down':
            self.tello.move_down(v)
        elif c == 'left':
            self.tello.move_left(v)
        elif c == 'right':
            self.tello.move_right(v)
        elif c == 'cw':
            self.tello.rotate_clockwise(v)
        elif c == 'ccw':
            self.tello.rotate_counter_clockwise(v)
        elif c == 'forward':
            self.tello.move_forward(v)
        elif c == 'back':
            self.tello.move_back(v)
        elif c == 'takeoff':
            self.tello.takeoff()
        elif c == 'land':
            self.tello.land()
        elif c == 'follow':
            self.tfmodel.class_to_follow=v
        elif c == 'draw_detections':
            self.tfmodel.draw_detections=v
        elif c == 'battery':
            battery=self.tello.query_battery()
            result['battery']=str(battery)

        return self.json(result)
