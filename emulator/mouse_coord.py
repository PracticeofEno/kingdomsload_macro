import win32gui
import win32con
import win32api
import win32con

# window_name = "BlueStacks Multi Instance Manager"
# hwnd = win32gui.FindWindow(None, window_name)
# window_text = win32gui.GetWindowText(hwnd)
# win32gui.SetWindowPos(hwnd, None, 0, 0, 0, 0, win32con.SWP_NOSIZE)

# Get the current cursor position
x, y = win32api.GetCursorPos()
print(f"x: {x}, y: {y}")