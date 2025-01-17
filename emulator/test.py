import base64
import re
from time import sleep
from tkinter import Image
import cv2
import numpy as np
import easyocr
from PIL import Image, ImageFile
import win32gui
import win32con
import ctypes

from classes.backend_api import get_macro_data
from classes.blue_stack_controller import BlueStackController

# User32 DLL 및 Kernel32 DLL 로드
user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

# 사용할 언어 설정
reader = easyocr.Reader(['ko', 'en'])  

bc = BlueStackController()

def get_image_location(image_path: str, image_path2: str) -> float:
    """
    스크린샷을 찍은 후 이미지 경로에 있는 이미지와 0.96이상 닮은게 있는지 검색하여 좌표 반환
    """
    # 스크린샷을 찍습니다.
    f = open(image_path2, 'rb')
    screenshot_data = f.read()
    # numpy 배열로 변환
    np_arr = np.frombuffer(screenshot_data, np.uint8)
    # OpenCV에서 읽을 수 있는 이미지로 변환
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    image2 = cv2.imread(image_path)
    # 템플릿 매칭 수행
    result = cv2.matchTemplate(img, image2, cv2.TM_CCOEFF_NORMED)
    threshold = 0.96
    locations = np.where(result >= threshold)
    locations = list(zip(*locations[::-1]))
    # 없다면 None 반환
    if len(locations) == 0:
        return None
    # 중복 좌표 제거
    filtered_locations = []
    for loc in locations:
        if not any(abs(loc[0] - x[0]) <= 1 for x in filtered_locations):
            filtered_locations.append(loc)
    locations = filtered_locations
    for loc in locations:
        print(f"X: {loc[0]}, Y: {loc[1]}")
    return locations

def get_ocr_text(image: ImageFile.ImageFile, x: int, y: int, widht: int, height: int) -> str :
    """
    imageFile로부터 x,y,widht,height의 영역을 OCR로 텍스트 추출
    1. ImageFile을 crop
    2. crop한 Image를 numpy배열로 변환
    2. 전처리 과정
    3. OCR 텍스트 추출
    """
    crop = image.crop((x, y, x + widht, y + height))
    crop.save("cropped_image.png")
    # Convert crop to numpy array
    np_crop = np.array(crop)

    # EasyOCR로 텍스트 읽기
    result = reader.readtext(np_crop)
    if len(result) == 0:
        return ""
    text_results = result[0][1]
    print(text_results)
    return text_results

def force_close_window(hWnd):
    # 윈도우의 프로세스 ID를 얻기 위해 필요한 변수
    lpdwProcessId = ctypes.c_ulong()
    # 윈도우의 프로세스 ID를 가져옴
    user32.GetWindowThreadProcessId(hWnd, ctypes.byref(lpdwProcessId))
    # 프로세스 핸들을 얻기 위해 OpenProcess 호출
    hProcess = kernel32.OpenProcess(1, False, lpdwProcessId)
    # 프로세스를 강제로 종료
    kernel32.TerminateProcess(hProcess, 0)
    # 프로세스 핸들 닫기
    kernel32.CloseHandle(hProcess)

# macro_data = get_macro_data("egg1")
# print(macro_data['subscribe'])

# 이미지로부터 비슷한 이미지 좌표 찾아내는 코드
# locations = get_image_location("images/event_dot.png", "입성2.png")
# print(len(locations))

# 이미지로부터 OCR 추출이 가능한지 확인하는 테스트
image_path = "screenshot.png"
image = Image.open(image_path)
# Preprocessing
text = get_ocr_text(image, 762, 515, 88, 33)
print(text)

# #-50 +33 에서 
# for location in locations:
#     image_path = "gatcha.png"
#     # 이미지 파일 열기
#     image = Image.open(image_path)
#     text = get_ocr_text(image, location[0] - 50, location[1] + 33, 60, 20)
#     # break
#     print(text)

# print(locations)