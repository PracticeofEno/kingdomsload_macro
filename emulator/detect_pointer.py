import tkinter as tk
from PIL import Image, ImageTk

# 이미지 로드 (예: test.jpg 파일을 사용)
image_path = 'screenshot.png'
image = Image.open(image_path)

# 이미지 크기 조정
base_width = round(1600)
w_percent = (base_width / float(image.size[0]))
h_size = int((float(image.size[1]) * float(w_percent)))
image = image.resize((base_width, h_size), Image.LANCZOS)

# Tkinter 윈도우 생성
window = tk.Tk()
window.title("이미지에서 좌표 확인하기")

# 이미지를 Tkinter 라벨로 변환
image_tk = ImageTk.PhotoImage(image)
label = tk.Label(window, image=image_tk)
label.pack()

# 마우스 클릭 이벤트 처리
def get_mouse_position(event):
    x, y = event.x, event.y
    print(f"마우스 클릭 위치: ({x}, {y})")

# 마우스 클릭 이벤트 바인딩
label.bind('<Button-1>', get_mouse_position)

# Tkinter 루프 시작
window.mainloop()
