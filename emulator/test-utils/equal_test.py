from PIL import Image
import numpy as np

def images_are_equal(image_path1, image_path2, crop_box=None):
    # 이미지 열기
    image1 = Image.open(image_path1)
    image2 = Image.open(image_path2)

    # 이미지1만 crop
    if crop_box:
        image1 = image1.crop(crop_box)
        image1.save("images/tmp.png")
    
    # 이미지 데이터를 numpy 배열로 변환
    np_image1 = np.array(image1)
    np_image2 = np.array(image2)
    
    # 배열이 정확히 일치하는지 확인
    return np.array_equal(np_image1, np_image2)

# 예제 경로
image_path1 = 'image1.png'
image_path2 = 'images/login_id_input.png'

# crop할 영역 설정 (left, upper, right, lower)
crop_box = (104, 766, 124, 786)

# 결과 출력
if images_are_equal(image_path1, image_path2, crop_box):
    print("두 이미지는 정확히 일치합니다.")
else:
    print("두 이미지는 일치하지 않습니다.")
