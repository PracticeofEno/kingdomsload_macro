from typing import Union
from fastapi import FastAPI
from fastapi import Request
from PIL import Image, ImageChops
from classes.tk_controller import TKController
from classes.blue_stack_controller import BlueStackController
from starlette.concurrency import run_in_threadpool
import threading
import io
import win32gui
import win32con
from pydantic import BaseModel

class CreateRequest(BaseModel):
    instance_id: str

# game = TKController("127.0.0.1:5565")
bluestack = BlueStackController()
# 삼국지 전략판 클릭
# game.click(90, 1200)
# game.wating_load()
app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

# @app.post("/login")
# async def google_login(request: Request):
#     item = await request.json()
#     item_dict = dict(item)
#     print(item_dict["email"], item_dict["password"])

#     def login_google_account_thread(email, password):
#         game.login_google_account(email, password)

#     email = item_dict["email"]
#     password = item_dict["password"]
#     thread = threading.Thread(target=login_google_account_thread, args=(email, password))
#     thread.start()
#     return 'Google Login Success!'

# @app.post('/screenshot')
# async def take_screenshot(request: Request):
#     screenshot = game.driver.get_screenshot_as_png()
#     image = Image.open(io.BytesIO(screenshot))
#     image.save("screenshot.png")
    
#     return 'Screenshot taken!'


@app.post("/test")
def test(request: CreateRequest):
    bluestack.create_instance(request.instance_id)
    bluestack.start_instance(request.instance_id)
    return {"Hello": "World"}

# @app.get("/test2")
# async def test2():
#     screen = game.take_screenshot()
#     copper_text =  game.get_ocr_text(screen, 1070, 25, 150, 50)
#     print(copper_text)
#     # thread = threading.Thread(target=game.do_service)
#     # thread.start()
#     return {"Hello": "World"}