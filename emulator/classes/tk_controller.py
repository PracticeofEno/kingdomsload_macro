import base64
import re
from time import sleep
from PIL import Image, ImageChops, ImageFile
import io
import cv2
import numpy as np
import easyocr
import ctypes
import win32gui
from appium import webdriver
from appium.options.android import UiAutomator2Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput

from classes.backend_api import callback_execute_time, get_macro_data

class TKController:
    def __init__(self, device_name, user_id) -> None:
        capabilities = dict(
            platformName='Android',
            automationName='uiautomator2',
            deviceName=device_name,
            udid=device_name,
            appPackage='com.qookkagame.sgzzlb.gp.kr',
            appActivity='com.ejoy2dx.s3client.S3Activity',
            language='ko',
            locale='KR',
            newCommandTimeout=3600*24,
            noReset=True
        )
        appium_server_url = 'http://localhost:4723'
        self.driver = webdriver.Remote(appium_server_url, options=UiAutomator2Options().load_capabilities(capabilities))
        self.actions = ActionChains(self.driver)
        self.reader = easyocr.Reader(['ko', 'en'])  # 사용할 언어 설정
        # User32 DLL 및 Kernel32 DLL 로드
        self.user32 = ctypes.windll.user32
        self.kernel32 = ctypes.windll.kernel32
        self.user_id = user_id
        self.nickname = ""
        self.image: Image = None
        self.action_bool = True
        # self.click(677,292)
    
    def force_close_window(self, hWnd):
        # 윈도우의 프로세스 ID를 얻기 위해 필요한 변수
        lpdwProcessId = ctypes.c_ulong()
        # 윈도우의 프로세스 ID를 가져옴
        self.user32.GetWindowThreadProcessId(hWnd, ctypes.byref(lpdwProcessId))
        # 프로세스 핸들을 얻기 위해 OpenProcess 호출
        hProcess = self.kernel32.OpenProcess(1, False, lpdwProcessId)
        # 프로세스를 강제로 종료
        self.kernel32.TerminateProcess(hProcess, 0)
        # 프로세스 핸들 닫기
        self.kernel32.CloseHandle(hProcess)

    def quit(self):
        self.driver.quit()
        handle = win32gui.FindWindow(None, self.user_id)
        if handle != 0:
            self.force_close_window(handle)

    def waiting_machine_load(self) -> bool:
        """첫 화면에 삼국지 전략판이 보일때까지 대기하는 함수, 보이면 클릭함"""
        count = 0
        while self.action_bool:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            text = self.get_ocr_text(self.image, 617, 336, 121, 35)
            print("로딩 화면 중 ocr 결과: ", text)
            if "삼국지" in text:
                sleep(3)
                self.click(675,590)
                sleep(3)
                return True
            count += 1
            sleep(3)
            if count == 30:
                break
        return False

    def wating_load(self):
        """
        처음 10초는 블루스택 로딩시간 대기 
        1. 일단 해당 창을 최소화시킴
        로그인창이 로딩될때까지 대기하는 함수
        3초마다 스크린샷을 찍으며 ["터치로 게임입장"] 에서의 터치부분의 하얀색 값을 캐치하는 형태로 구현
        """
        sleep(10)
        # 최소화 코드
        # win32gui.ShowWindow(win32gui.FindWindow(None, self.user_id), 6)
        ocr_text = ""
        while self.action_bool:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            # OCR 텍스트 추출
            ocr_text = self.get_ocr_text(self.image, 720, 735, 180, 60)
            login_text = self.get_ocr_text(self.image, 762, 515, 88, 33)
            if login_text == "로그인":
                self.click(811, 529)
                sleep(3)
            # 아래쪽 출정하기 위치 클릭
            if ocr_text == "출정하기":
                self.click(791,761)
                sleep(3)
                break
            self.click(791,761)
            sleep(3)
        print("wating_load - ", "출정하기 클릭 완료")
    
    def waiting_nickanme_show(self):
        """
        닉네임이 보일때까지 대기하는 함수
        1. 데일리 창이 떳다면 제거
        2. 닉네임이 보일때까지 대기
        """
        # nickname 좌표 105, 72 부터 200,30
        while self.action_bool:
            self.remove_daily_show()
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            text = self.get_ocr_text(self.image, 105,72, 200, 30)
            general_button_text = self.get_ocr_text(self.image, 590, 847, 62, 36)
            print("waiting_nickanme_show 닉네임 - ", text)
            if text != "" and general_button_text == "장수":
                self.nickname = text
                break
            sleep(3)
        sleep(3)
        self.remove_daily_show()

    def waiting_nickanme_show_recall(self):
        """
        닉네임이 보일때까지 귀환 클릭하는 함수
        1. 데일리 창이 떳다면 제거
        2. 닉네임이 보일때까지 대기
        """
        # nickname 좌표 105, 72 부터 200,30
        while self.action_bool:
            self.remove_daily_show()
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            text = self.get_ocr_text(self.image, 105,72, 200, 30)
            print("waiting_nickanme_show_recall 닉네임 - ", text)
            if text == self.nickname:
                break
            else:
                print(self.nickname, text)
                self.click(1514, 42)
                sleep(2)

    def remove_daily_show(self):
        """일일 확인창 이 떳다면 제거"""
        if self.check_daily_show() is True:
            self.click(803, 599)

    def check_daily_show(self) -> bool:
        """
        일일 첫 로그인시 확인창 뜨는지 확인하는 함수
        떠있으면 True, 아니면 False
        """
        self.take_screenshot()
        if self.check_another_device(self.image) is True:
            return
        text = self.get_ocr_text(self.image, 768, 581, 70, 35)
        if text == "확인":
            return True
        return False

    def get_subscribe(self):
        """
        두 좌표(542,628), (900,628) 에 대하여 "수령" 이라면 "수령 완료"가 나올때까지 클릭
        """
        while self.action_bool:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            text1 = self.get_ocr_text(self.image, 542, 628, 167, 35)
            text2 = self.get_ocr_text(self.image, 900, 628, 167, 35)
            if text1 == "수령 완료" and text2 == "수령 완료":
                break
            if text1 == "수령":
                self.click(542 + 83, 628 + 17)
                sleep(1)
            if text2 == "수령":
                self.click(900 + 83, 628 + 17)
                sleep(1)

    def is_same_image(self, image1: Image, image2: Image) -> bool:
        """
        두 이미지를 np.array로 변환하여 비교 후 같으면 True, 다르면 False 반환
        """
        np_image1 = np.array(image1)
        np_image2 = np.array(image2)
        return np.array_equal(np_image1, np_image2)
    
    def get_image_location(self, image_path: str) -> list:
        """
        스크린샷을 찍은 후 이미지 경로에 있는 이미지와 0.96이상 닮은게 있는지 검색하여 좌표 반환
        """
        # 스크린샷을 찍습니다.
        screenshot = self.driver.get_screenshot_as_base64()
        screenshot_data = base64.b64decode(screenshot)
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

    def take_screenshot(self):
        try:
            screenshot = self.driver.get_screenshot_as_png()
            self.image = Image.open(io.BytesIO(screenshot))
        except:
            print("스크린샷 appium 에러!")
            handle = win32gui.FindWindow(None, self.user_id)
            if handle <= 0:
                raise Exception("스크린샷 에러가 났는데 윈도우 핸들이 없는 경우")
            return None

    def click(self, x: int, y: int, interval: float = 0.1) -> None:
        """
        x,y 좌표에 클릭
        interval이 없다면 기본값 0.1초
        """
        self.actions.w3c_actions = ActionBuilder(self.driver, mouse=PointerInput(interaction.POINTER_TOUCH, 'touch'))
        self.actions.w3c_actions.pointer_action.move_to_location(x, y)
        self.actions.w3c_actions.pointer_action.pointer_down()
        self.actions.w3c_actions.pointer_action.pause(interval)
        self.actions.w3c_actions.pointer_action.release()
        self.actions.perform()

    def get_ocr_text(self, image: ImageFile.ImageFile, x: int, y: int, widht: int, height: int) -> str :
        """
        imageFile로부터 x,y,widht,height의 영역을 OCR로 텍스트 추출
        1. ImageFile을 crop
        2. crop한 Image를 numpy배열로 변환
        2. 전처리 과정
        3. OCR 텍스트 추출
        """
        crop = image.crop((x, y, x + widht, y + height))
        # crop.save("cropped_image.png")
        # Convert crop to numpy array
        np_crop = np.array(crop)
        
        # EasyOCR로 텍스트 읽기
        result = self.reader.readtext(np_crop)
        if len(result) == 0:
            return ""
        text_results = result[0][1]
        print(text_results)
        return text_results
    
    def do_subscribe(self):
        """
        월정액 체크 후 받을 수 있으며 받는 기능
        1. reddot 이벤트 중에 월정액이 있는지 검사 -> 있다면 클릭
        2. 두 좌표(542,628), (900,628) 에 대하여 "수령" 이라면 "수령 완료"가 나올때까지 클릭
        3. 빨간점 클릭해서 나오기
        """
        event_dot_locations = self.get_image_location("images/event_dot.png")
        if event_dot_locations is None:
            print("구독 - event_dot 없음")
            return
        finded_location = None
        for event_dot in event_dot_locations:
            if event_dot[1] == 119:
                self.take_screenshot()
                if self.check_another_device(self.image) is True:
                    return
                text = self.get_ocr_text(self.image, event_dot[0] - 50, event_dot[1] + 33, 60, 20)
                if "월정액" in text:
                    finded_location = event_dot
                    break
        if finded_location is None:
            print("구독 - 월정액 없음")
            return
        self.click(finded_location[0], finded_location[1])
        self.get_subscribe()
        sleep(3)
        self.click(finded_location[0], finded_location[1])
        sleep(2)

    def do_tax_collection(self):
        """
        세금 징수할 게 있다면 징수하는 기능
        1. 세금 징수의 event_dot 위치가 고정적이라는 가정하에 event_dot내에서 특정좌표(1150,1012)가 있는지 검사
        2. 있다면 해당 좌표 클릭 후 event_dot 찾아서 클릭 후
        3. 세금징수 좌표 (491,432) 클릭
        4. 귀환 버튼 좌표 (935,25) 두번 클릭
        """
        event_dot_locations = self.get_image_location("images/event_dot.png")
        if event_dot_locations is None:
            print("세금 징수 - event_dot 없음")
            return
        def check_event_dot(x: int, y: int):
            for loc in event_dot_locations:
                if loc[0] == x and loc[1] == y:
                    return loc
            return None
        # 정청 이벤트 좌표 958,844
        loc = check_event_dot(958,844)
        if loc is None:
            print("세금 징수 - 특정 좌표 없음")
            return
        self.click(loc[0], loc[1])
        sleep(2)
        
        event_dot = self.get_image_location("images/event_dot.png")
        if event_dot is None:
            print("세금 징수 - event_dot 없음")
            self.click(1147, 50)
            return
        if len(event_dot) > 1:
            print("세금 징수 - event_dot 1개 이상")
            # return
        event_dot = event_dot[0]
        # 세금징수 좌표 491,432
        self.click(1147, 471)
        sleep(2)

        # 세금징수 돈 모양 좌표 796, 695
        self.click(796, 695)
        sleep(2)
        # 귀환 좌표 1514, 43
        self.click(1513,43)
        sleep(1)
        self.click(1513,43)
        sleep(1)

    def do_exploration(self):
        """
        탐방하는 기능, OCR이 실패하는 경우는 생각하지 않는것을 가정
        1. 고정된 좌표셋을 이용하여 지표-> 주성위치 -> 입성위치 를 순서대로 클릭
        1-1. (1870,194), (1750, 250), (996, 506)
        2. 빨간 레드닷의 특정 좌표가 있는지 검사 (115, 310)
        3. 탐방 루틴 (탐방 클릭 -> OCR이 될때까지 클릭 클릭 -> OCR이 된다면 탐방 끝났는지 체크 후 계속 or 귀환)
        """
        # 지표
        self.click(1509,141)
        sleep(3)
        # 주성
        self.click(1409,201)
        sleep(5)
        # 입성
        self.click(805,401)
        sleep(4)

        event_dot_locations = self.get_image_location("images/event_dot.png")
        if event_dot_locations is None:
            print("탐방 - event_dot 없음")
            return
        def check_event_dot(x: int, y: int):
            for loc in event_dot_locations:
                if loc[0] == x and loc[1] == y:
                    return loc
            return None
        # 탐방 이벤트 좌표
        loc = check_event_dot(143,235)
        if loc is None:
            print("탐방 - 특정 좌표 없음")
            return
        self.click(loc[0], loc[1])
        sleep(2)

        self.take_screenshot()
        text = self.get_ocr_text(self.image, 25, 16, 80, 42)
        if text != "담방":
            print("탐방 - 좌상단 탐방 글자 감지 실패")
            self.waiting_nickanme_show_recall()
            return
        
        loop_count = 0
        while self.action_bool:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            # 잔여 횟수 : x/x 위치
            text = self.get_ocr_text(self.image, 1284, 684, 192, 37)
            if "잔여" in text:
                numbers = re.findall(r'\d+', text)  # 숫자만 추출
                remaining_count, total_count = numbers[:2]
                try:
                    remaining_count = int(remaining_count)
                    if remaining_count == 0:
                        break
                except:
                    pass
            self.click(1392, 815)
            sleep(0.5)
            if self.check_general_full() is True:
                # 전법 점수 전환 클릭
                self.click(944,625)
                sleep(3)
                # 진급 한 장수 체크
                self.click(939, 190)
                sleep(2)
                # 2성이하 클릭
                self.click(1369, 190)
                sleep(2)
                # 3성이하 클릭
                self.click(1371, 351)
                sleep(2)
                # 왼쪽에서 2칸 클릭
                self.click(781, 303)
                sleep(2)
                # 왼쪽에서 2칸 클릭
                self.click(917, 303)
                sleep(2)
                # 전법전환 클릭
                self.click(637, 676)
                sleep(2)
                # 귀환 클릭
                self.click(1510, 42)
                sleep(2)
            loop_count += 1
            if loop_count > 220:
                break
        self.waiting_nickanme_show_recall()

    def do_recruit(self):
        # 일단 뽑기창 들어감
        loop = True
        while loop:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            text = self.get_ocr_text(self.image, 25, 16, 80, 42)
            print("모집창 감지중: ", text)
            if text == "모집":
                loop = False
            self.click(1146,817)
            sleep(2)
        loop = True
        count = 0
        # 무뽑 반뽑 이 감지안되고 없어질때까지 뽑기 진행.
        while loop:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            general_text = self.get_ocr_text(self.image, 1409, 96, 50, 30)
            recruit_text = self.get_ocr_text(self.image, 27, 17, 76, 43)
            if recruit_text == "모집":
                if general_text == "장수":
                    # 뽑기 버튼 우상단의 무료, 반값의 무,반을 캐치하는 좌표
                    text = self.get_ocr_text(self.image, 840, 675, 30, 27)
                    if text == "무":
                        self.click(743,712)
                        free = False
                        sleep(2)
                    elif text == "반":
                        self.click(743,712)
                        half = False
                        sleep(2)
                    elif text == "":
                        time_text = self.get_ocr_text(self.image, 54, 176, 100, 20)
                        time_text = time_text.replace(".", "").replace("*", "").replace(":", "")
                        if len(time_text) != 6:
                            # 장수가 다 차서 안되는건지 확인
                            if self.check_general_full() is True:
                                # 전법 점수 전환 클릭
                                self.click(944,625)
                                sleep(3)
                                # 진급 한 장수 체크
                                self.click(939, 190)
                                sleep(2)
                                # 2성이하 클릭
                                self.click(1369, 190)
                                sleep(2)
                                # 3성이하 클릭
                                self.click(1371, 351)
                                sleep(2)
                                # 왼쪽에서 2칸 클릭
                                self.click(781, 303)
                                sleep(2)
                                # 왼쪽에서 2칸 클릭
                                self.click(917, 303)
                                sleep(2)
                                # 전법전환 클릭
                                self.click(637, 676)
                                sleep(2)
                                # 귀환 클릭
                                self.click(1510, 42)
                                sleep(2)
                            print("시간이 이상함")
                            continue
                        try:
                            hour = int(time_text[:2])
                            minute = int(time_text[2:4])
                            second = int(time_text[4:])
                        except:
                            print("시간 OCR 정수변환 실패")
                            continue
                        print(f"{hour}:{minute}:{second}")
                        callback_execute_time(self.user_id, hour, minute, second)
                        loop = False
                        sleep(2)
                else:
                    # 모집인데 장수가 없다면 뽑기 창임
                    self.click(1512,42)
                    count += 1
                    sleep(2)
            else:
                self.click(362,719)
                sleep(2)

        self.waiting_nickanme_show_recall()

    def check_general_full(self) -> bool:
        """
        장수가 다 찼을때 나오는 알림이 떳는지 확인
        특정 좌표의 ocr 결과가 "장수"라면 떳다고 판단
        """
        self.take_screenshot()
        text = self.get_ocr_text(self.image, 626, 610, 67, 36)
        if text == "장수":
            return True
        return False

    def do_service(self):
        """"""
        macro_data = get_macro_data(self.user_id)
        tf_recruit = macro_data["recruit"]
        tf_trial = macro_data["trial"]
        tf_subscribe = macro_data["subscribe"]
        tf_tax_collection = macro_data["tax"]
        tf_exploration = macro_data["exploration"]
        if tf_subscribe:
            print("=== 구독 함수 시작 ===")
            self.do_subscribe()
        if tf_tax_collection:
            print("=== 세금 징수 함수 시작 ===")
            self.do_tax_collection()
        if tf_recruit:
            print("=== 모집 함수 시작 ===")
            self.do_recruit()
        if tf_trial:
            print("=== 시련 함수 시작 ===")
            self.do_trial()
        if tf_exploration:
            print("=== 탐방 함수 시작 ===")
            self.do_exploration()

    def do_trial(self):
        """
        시련 진행하는 함수
        """
        event_dot_locations = self.get_image_location("images/event_dot.png")
        if event_dot_locations is None:
            print("Event_dot 없음")
            return
        def check_event_dot(x: int, y: int):
            for loc in event_dot_locations:
                if loc[0] == x and loc[1] == y:
                    return loc
            return None
        # 더보기 이벤트 좌표 1062,844
        loc = check_event_dot(1062,844)
        if loc is None:
            print("더보기 - Reddot 감지 실패")
            return
        self.click(loc[0], loc[1])
        sleep(2)

        event_dot_locations = self.get_image_location("images/event_dot.png")
        if event_dot_locations is None:
            print("Event_dot 없음")
            return
        loc = check_event_dot(958,714)
        if loc is None:
            print("시련 - Reddot 감지 실패")
            return
        self.click(loc[0], loc[1])
        sleep(2)

        self.take_screenshot()
        text = self.get_ocr_text(self.image, 25, 16, 80, 42)
        if text != "시련":
            print("좌상단 시련 글자 감지 실패")
            return
        trail_lock_locations = self.get_image_location("images/trial_lock.png")
        if trail_lock_locations is None:
            trail_lock_locations = []
        lock_number = len(trail_lock_locations)
        click_x = 1428 - 312 * (lock_number)
        click_y = 692
        # 악몽에서 잠긴 수만큼 x좌표 이동한 후 클릭
        self.click(click_x, click_y)
        sleep(2)
        
        # 확인창 클릭
        self.click(668,632)
        sleep(2)

        loop_count = 0
        while self.action_bool:
            self.take_screenshot()
            if self.check_another_device(self.image) is True:
                return
            text = self.get_ocr_text(self.image, 1361, 748, 85, 48)
            # 이 위치에 전보보기가 나오면 시련 끝난거임
            if text == "성공":
                break
            loop_count += 1
            if loop_count == 300:
                break
            self.click(1405,742)
            sleep(1)
        self.waiting_nickanme_show_recall()

    def check_another_device(self, image: Image):
        # Preprocessing
        text = self.get_ocr_text(image, 606, 427, 152, 30)
        if "다른 기기" in text:
            print("다른 기기에서 접속하였습니다")
            return True
        return False

    def test(self):
        event_dot_locations = self.get_image_location("images/event_dot.png")
        if event_dot_locations is None:
            print("event_dot 못찾음")
            return
        print(event_dot_locations)


