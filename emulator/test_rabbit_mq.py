#!/usr/bin/env python
import ctypes
import pika
from classes.backend_api import callback_create_instance, callback_failed_bluestacks_connect
from classes.blue_stack_controller import BlueStackController
from classes.tk_controller import TKController
from classes.utils import WorkMessage
import win32gui
import json
import threading

# 블루스택 조작용 객체 생성
bluestack = BlueStackController()
resource_ip = "1.1.1.1"

# rabbit-mq 연결
rabbit_mq_host = 'localhost'
connection = pika.BlockingConnection(
    pika.ConnectionParameters(
        host=rabbit_mq_host,
        port=5672, 
        credentials=pika.PlainCredentials('eno', 'eno')
    )
)
channel = connection.channel()

channel.queue_declare(queue='bluestack_task', durable=True)
print(' [*] Waiting for messages. To exit press CTRL+C')
failed_count = 0
tk_controller: TKController

def start_thread(adb_port_number, user_id):
    # adb connect 서브쉘 실행
    bluestack.adb_connect(adb_port_number)
    tk_executed = False
    # appium 연결
    try:
        tk_controller = bluestack.tki_controller_connect(adb_port_number, user_id)
        # 연결 성공했다면 아래 값이 True로 변경
        tf_executed = True
        tk_controller.wating_load()
        tk_controller.waiting_nickanme_show()
        tk_controller.do_service()
        tk_controller.quit()
    except Exception as e:
        # 연결에 실패하면 다시 큐에 담게 하기 위함
        print(f"start thread 쪽에서 에러 발생함", str(e))
        print(f"tk_excuted = ", tk_executed)
        # 실패한 경우 appium 연결을 끊기 위함, 연결이 되고 tf_excuted가 True일때만 실행
        # 실패한 경우 블루스택을 종료시키기 위함
        handle = win32gui.FindWindow(None, user_id)
        if handle != 0:
            lpdwProcessId = ctypes.c_ulong()
            ctypes.windll.user32.GetWindowThreadProcessId(handle, ctypes.byref(lpdwProcessId))
            hProcess = ctypes.windll.kernel32.OpenProcess(1, False, lpdwProcessId)
            ctypes.windll.kernel32.TerminateProcess(hProcess, 0)
            ctypes.windll.kernel32.CloseHandle(hProcess)
        #백엔드에 콜백 날려줌
        callback_failed_bluestacks_connect(user_id)
        return



def callback(ch, method, properties, body):
    global failed_count
    global tk_controller
    data: WorkMessage = json.loads(body.decode('utf-8'), object_hook=lambda d: WorkMessage(**d))
    data.adb_port_number = str(data.adb_port_number)
    # 실행할 지 여부. 아이피가 같을때 True가 됨
    executable = data.resource_ip == resource_ip
    # 자신이 실행할 수 있는 인스턴스인지 확인해야함
    # 해당 데이터의 resource_ip가 자신의 아이피라면 실행 아니라면 패스 넘기기
    if not executable:
        print("요청된 리소스가 아닙니다")
        failed_count += 1
        if failed_count >= 10:
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        return
    else:
        bluestack.run_process()
    if data.kinds == "create_instance":
        print("create_instance")
        bluestack.create_instance(data.user_id)
        adb_port_number = bluestack.get_last_adb_port_number()
        callback_create_instance(data, adb_port_number)
    elif data.kinds == "start_instance":
        print("start_instance")
        bluestack.start_instance(data.user_id)
        # start_instance -> 나머진 쓰레드에서 실행함
        load_thread = threading.Thread(target=start_thread, args=(data.adb_port_number, data.user_id), daemon=True)
        load_thread.start()
    elif data.kinds == "connect":
        print("test")
        print(data.adb_port_number)
        bluestack.adb_connect(data.adb_port_number)
        tk_controller = bluestack.tki_controller_connect(data.adb_port_number, data.user_id)
    elif data.kinds == "test":
        print("test2")
        image = tk_controller.take_screenshot()
        # text = tk_controller.get_ocr_text(image, 1284, 684, 192, 37)
        # print(text)
        tk_controller.image.save("screenshot.png")
        # tk_controller.test()
    print(f" [x] Received {data.kinds}, {data.user_id}")
    bluestack.stop_process()
    ch.basic_ack(delivery_tag=method.delivery_tag)

# prefetch_count=1: 한번에 하나의 메시지만 받도록 설정
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='bluestack_task', on_message_callback=callback, auto_ack=False)

channel.start_consuming()
