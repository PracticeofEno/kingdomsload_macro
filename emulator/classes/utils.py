# RabbitMQ를 통해 전달받을 데이터 형식 정의
class WorkMessage:
    def __init__(self, kinds: str ="unknown", user_id:str ="", resource_ip:str ="", adb_port_number: str =""):
        self.kinds = kinds
        self.user_id = user_id
        self.resource_ip = resource_ip
        self.adb_port_number = adb_port_number