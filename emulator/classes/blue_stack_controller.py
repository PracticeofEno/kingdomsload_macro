import ctypes
import subprocess
import threading
from time import sleep
import win32gui
import win32con
import win32api
from PIL import ImageGrab
import pyperclip

from classes.tk_controller import TKController
import asyncio

class BlueStackController:
    def __init__(self):
        self.bluestacks_number = 5
        self.is_running = False
        pass

    def get_last_adb_port_number(self) -> int:
        """
        **관리자 권한으로 실행이 필요한 부분**
        블루스택의 마지막 adb 포트 번호를 가져옴
        """
        file_path = "C:/ProgramData/BlueStacks_nxt/bluestacks.conf"
        
        parsed_lines = []
        with open(file_path, "r") as file:
            for line in file:
                if "adb_port" in line and "status" not in line and "Pie64_" in line:
                    parsed_lines.append(line.strip())
        print(parsed_lines)
        if len(parsed_lines) == 0:
            return 5555
        sorted_data = sorted(parsed_lines, key=lambda x: int(x.split("Pie64_")[-1].split('.')[0]))
        # 결과 출
        for item in sorted_data:
            print(item)
        last_line: str = sorted_data[-1]
        last_line = last_line.replace("\"","")
        port = last_line.split("=")[1]
        return int(port)

    def click_event(self, hwnd, x, y):
        # 클릭 이벤트 전송
        win32api.SendMessage(hwnd, win32con.WM_LBUTTONDOWN, win32con.MK_LBUTTON, win32api.MAKELONG(x, y))
        win32api.SendMessage(hwnd, win32con.WM_LBUTTONUP, 0, win32api.MAKELONG(x, y))
        sleep(1)

    def move_to_window(self, x, y) -> int:
        """
        BlueStacks Multi Instance Manager 창을 찾아서 0,0 위치로 이동
        해당 작업을 하면서 윈도우가 활성화 되는듯. setForegroundWindow의 효과?
        이 작업을 하지 않으면 새 인스턴스 창에 클릭이벤트가 잘 전달되지 않았음.
        """
        # 멀티인스턴스 매니저를 찾아서 상위창으로 올ㄹ미
        window_name1 = "BlueStacks Multi Instance Manager"
        hwnd1 = 0
        while hwnd1 == 0:
            self.run_process()
            sleep(1)
            hwnd1 = win32gui.FindWindow(None, window_name1)
            print(f"First window handle: {hwnd1}")
            win32gui.SetWindowPos(hwnd1, None, x, y, 0, 0, win32con.SWP_NOSIZE)
            # 알트키를 입력해주면 ForegroundWindow가 에러가 안난다는 스택오버플로우 답글
            # https://stackoverflow.com/questions/63648053/pywintypes-error-0-setforegroundwindow-no-error-message-is-available
            win32api.keybd_event(win32con.VK_MENU, 0, 0, 0)  # Press Alt key
            win32api.keybd_event(win32con.VK_MENU, 0, win32con.KEYEVENTF_KEYUP, 0)  # Release Alt key
            print("waiting for window...")
        return hwnd1
    
    def click_create_instance(self):
        """인스턴스 생성 클릭"""
        window_name1 = "BlueStacks Multi Instance Manager"
        hwnd1 = win32gui.FindWindow(None, window_name1)
        x1, y1 = 77, 527
        self.click_event(hwnd1, x1, y1)
    
    def instance_create_click(self, hwnd1):
        """
        블루스택 멀티인스턴스 매니저 창을 이용하여 인스턴스 생성
        """
        window_name2 = "HD-MultiInstanceManager"
        child_window = win32gui.FindWindow(None, window_name2)

        if child_window:
            print(f"Second window handle: {child_window}")
            window_name2 = "BlueStacks Multi Instance Manager"  # "HD-MultiInstanceManager" 가 아니라 팝업창의 정확한 이름으로 변경 필요
            win32gui.SetForegroundWindow(hwnd1)
            copy_x = 200
            copy_y = 140
            self.click_event(child_window, copy_x, copy_y)
            sleep(1)

        window_name2 = "HD-MultiInstanceManager"  # "HD-MultiInstanceManager" 가 아니라 팝업창의 정확한 이름으로 변경 필요
        child_window = win32gui.FindWindow(None, window_name2)
        print(f"Thrid window handle: {child_window}")
        if child_window:
            win32gui.SetForegroundWindow(hwnd1)
            # cpu_x = 253
            # cpy_y = 95
            # self.click_event(hwnd2, cpu_x, cpy_y)
            # sleep(0.5)

            # low_x = 370
            # low_y = 162
            # self.click_event(hwnd2, low_x, low_y)
            # sleep(0.5)

            mem_x = 286
            mem_y = 130
            self.click_event(child_window, mem_x, mem_y)
            sleep(0.5)

            normal_x = 387
            normal_y = 201
            self.click_event(child_window, normal_x, normal_y)
            sleep(0.5)

            resolution_x = 246
            resolution_y = 165
            self.click_event(child_window, resolution_x, resolution_y)
            sleep(0.5)

            garo_x = 243
            garo_y = 183
            self.click_event(child_window, garo_x, garo_y)
            sleep(0.5)

            create_x = 432
            create_y = 291
            self.click_event(child_window, create_x, create_y)
            sleep(0.5)

            print("waiting for create...")
            window_name2 = "HD-MultiInstanceManager"  # "HD-MultiInstanceManager" 가 아니라 팝업창의 정확한 이름으로 변경 필요
            child_window = win32gui.FindWindow(None, window_name2)
            while True:
                prev_hwnd2 = child_window
                child_window = win32gui.FindWindow(None, window_name2)
                print(child_window, prev_hwnd2)
                if child_window != prev_hwnd2:
                    break
                sleep(3)
            print("create complete")
        else:
            print("Second window not found")
        sleep(1)

    def instance_search_click(self, hwnd1):
        """멀티 인스턴스 매니저 창의 검색 UI 클릭"""
        
        # win32gui.ShowWindow(hwnd1, win32con.SW_NORMAL)
        # win32gui.SetForegroundWindow(hwnd1)
        garo_x = 590
        garo_y = 67
        self.click_event(hwnd1, garo_x, garo_y)
        sleep(1)
    
    def rename_first_instance(self, hwnd1, user_id: str):
        """블루스택 멀티인스턴스 매니저에서 검색된 첫번째 요소의 이름 바꿈"""
        x = 254
        y = 110
        win32gui.SendMessage(hwnd1, win32con.WM_MOUSEFIRST, 0, win32api.MAKELONG(x, y))
        win32gui.SendMessage(hwnd1, win32con.WM_MOUSEHOVER , 0, win32api.MAKELONG(x, y))
        win32api.SetCursorPos((x, y))
        sleep(1)
        self.click_event(hwnd1, x, y)
        sleep(1)
        pyperclip.copy(user_id)
        self.copy_and_paste(hwnd1, user_id)
        self.click_event(hwnd1, x, y)
        sleep(1)
        

    def copy_and_paste(self, hWnd, text):
        """윈도우 메세지를 이용하여 검색창을 지우고 새 텍스트를 입력"""
        # pyperclip.copy("BlueStacks App Player " + str(self.bluestacks_number))
        pyperclip.copy(text)
        for _ in range(25):
            win32api.SendMessage(hWnd, win32con.WM_KEYDOWN, win32con.VK_BACK, 0)
            win32api.SendMessage(hWnd, win32con.WM_KEYUP, win32con.VK_BACK, 0)
            win32api.SendMessage(hWnd, win32con.WM_KEYDOWN, win32con.VK_DELETE, 0)
            win32api.SendMessage(hWnd, win32con.WM_KEYUP, win32con.VK_DELETE, 0)
        for char in text:
            win32api.SendMessage(hWnd, win32con.WM_CHAR, ord(char), 0)
        sleep(2)

    def create_instance(self, user_id: str):
        """
        사파적 코딩
        전제조건 - 블루스택 멀티인스턴스 매니저가 실행상태
        0. 블루스택 멀티인스턴스 매니저 실행 후 윈도우 위치 0,0으로 옮김
        1. 멀티 인스턴스 관리자 윈도우를 찾아서 해당 윈도우에 클릭이벤트 전송
        2. 생성 관리자 윈도우를 찾아서 CPU 1코어, 메모리 보통, 해상도 1600x900으로 설정하고 생성
        3. 생성이 완료될때까지 대기(완료 탐지는 창 핸들값이 변할때까지로 탐지)
        4. 생성이 완료되면 검색창에 윈도우 클릭이벤트를 보낸후 클립보드를 이용하여 Numbering 검색
        5. 마우스 커서를 이름 수정 위치로 이동후 클릭이벤트를 보내고 클립보드를 이용하여 사용자이름 붙여넣기
        """
        hwnd1 = self.move_to_window(0, 0)
        if hwnd1 == -1:
            print("윈도우를 찾지 못했습니다")
            return
        self.click_create_instance()
        # 잠시 대기 후 두 번째 창
        sleep(2)
        self.instance_create_click(hwnd1)

        # 블루스택에서 인스턴스 이름 검색 클릭
        self.instance_search_click(hwnd1)
        
        # 검색창에 생성된 인스턴스를 찾기위한 텍스트 복붙
        self.copy_and_paste(hwnd1, "BlueStacks App Player ")

        # 검색된 첫번째 인스턴스 이름 수정
        self.rename_first_instance(hwnd1, user_id)

        # 검색창을 클릭 후 검색했던 내용 지우기
        self.instance_search_click(hwnd1)
        self.copy_and_paste(hwnd1, "")
        sleep(1)

    def start_instance(self, user_id: str):
        """
        사파적 코딩
        전제조건 - 블루스택 멀티인스턴스 매니저가 실행상태
        """
        hwnd1 = self.move_to_window(0, 0)

        # 블루스택에서 인스턴스 이름 검색 클릭
        self.instance_search_click(hwnd1)
        # 검색창에 생성된 인스턴스를 찾기위한 텍스트 복붙
        self.copy_and_paste(hwnd1, user_id)
        # 실행 클릭
        self.click_event(hwnd1, 437, 111)
        sleep(5)

        self.instance_search_click(hwnd1)
        self.copy_and_paste(hwnd1, "")
        sleep(1)
    
    def adb_connect(self, adb_port_number: str):
        print(type(adb_port_number))
        device_id = "127.0.0.1" + ":" + adb_port_number
        cmd = "adb connect " + device_id
        print(f"cmd = {cmd}")
        while True:
            result = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            output, error = result.communicate()
            output = output.decode()
            error = error.decode()
            print(error)
            print(not ("cannot" in output), not error)
            if not ("cannot" in output) and not error:
                break
            sleep(1)
        print(output)

    def tki_controller_connect(self, adb_port_number: str, user_id: str):
        device_id = "127.0.0.1" + ":" + adb_port_number
        tk_controller = TKController(device_name=device_id, user_id=user_id)
        return tk_controller

    def run_process(self):
        if self.is_running is False:
            subprocess.Popen("C:\\Program Files\\BlueStacks_nxt\\HD-MultiInstanceManager.exe", shell=True)
            self.is_running = True
        sleep(1)

    def stop_process(self):
        if self.is_running is True:
            hwnd = win32gui.FindWindow(None, "BlueStacks Multi Instance Manager")
            print(hwnd)
            def force_close_window(hWnd):
                # 윈도우의 프로세스 ID를 얻기 위해 필요한 변수
                lpdwProcessId = ctypes.c_ulong()
                # 윈도우의 프로세스 ID를 가져옴
                ctypes.windll.user32.GetWindowThreadProcessId(hWnd, ctypes.byref(lpdwProcessId))
                # 프로세스 핸들을 얻기 위해 OpenProcess 호출
                hProcess = ctypes.windll.kernel32.OpenProcess(1, False, lpdwProcessId)
                # 프로세스를 강제로 종료
                ctypes.windll.kernel32.TerminateProcess(hProcess, 0)
                # 프로세스 핸들 닫기
                ctypes.windll.kernel32.CloseHandle(hProcess)
            force_close_window(hwnd)
            self.is_running = False
