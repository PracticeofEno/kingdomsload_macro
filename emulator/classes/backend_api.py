import requests
from classes.utils import WorkMessage

def get_macro_data(user_id: str):
    response = requests.get(
        f"http://localhost:3000/users/macro-data/{user_id}",
        headers={'Content-Type': 'application/json'}
    )
    return response.json()


# 아래는 콜백 함수들
def callback_create_instance(work: WorkMessage, adb_port_number: int):
    requests.post(
        'http://localhost:3000/users/callback/create-instance', 
        json={
            "user_id": work.user_id,
            "resource_ip": work.resource_ip,
            "adb_port_number": adb_port_number
        },
        headers={'Content-Type': 'application/json'}
    )

def callback_execute_time(user_id: str, hour: int, minute: int, second: int):
    requests.post(
        'http://localhost:3000/users/callback/execute-time', 
        json={
            "user_id": user_id,
            "hour": hour,
            "minute": minute,
            "second": second
        },
        headers={'Content-Type': 'application/json'}
    )

def callback_failed_bluestacks_connect(user_id: str):
    requests.post(
        f"http://localhost:3000/users/expired-user/{user_id}",
        headers={'Content-Type': 'application/json'}
    )

