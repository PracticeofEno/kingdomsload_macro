from PIL import Image
import io

left = 480
top = 689
width = 17
height = 8

image = Image.open("시련_잠김.png")
right = left + width
bottom = top + height
print(f"Cropping area: left={left}, top={top}, right={right}, bottom={bottom}")
cropped_image = image.crop((left, top, right, bottom))
cropped_image.save("cropped_image.png")
