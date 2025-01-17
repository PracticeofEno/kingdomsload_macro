import cv2
import numpy as np
from matplotlib import pyplot as plt

# 이미지 불러오기
image_path = 'screenshot.png'
image2_path = 'cropped_image.png'

# 이미지 로드
image = cv2.imread(image_path)
image2 = cv2.imread(image2_path)

# 이미지 크기 가져오기
h, w = image2.shape[:2]

# 이미지 매칭
result = cv2.matchTemplate(image, image2, cv2.TM_CCOEFF_NORMED)

# 매칭 결과에서 유사도가 0.96 이상인 좌표 찾기
threshold = 0.96
locations = np.where(result >= threshold)
locations = list(zip(*locations[::-1]))

# 중복 좌표 제거
filtered_locations = []
for loc in locations:
    if not any(abs(loc[0] - x[0]) <= 1 for x in filtered_locations):
        filtered_locations.append(loc)
locations = filtered_locations

for loc in locations:
    print(f"X: {loc[0]}, Y: {loc[1]}")

# 이미지에 사각형 표시
for loc in locations:
    top_left = loc
    bottom_right = (top_left[0] + w, top_left[1] + h)
    cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 2)
# 이미지 출력
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.show()