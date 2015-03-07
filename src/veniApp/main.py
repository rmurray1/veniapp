from kivy.app import App
from kivy.lang import Builder
from kivy.metrics import sp
from kivy.properties import NumericProperty
from kivy.properties import ObjectProperty
from kivy.properties import StringProperty
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.screenmanager import Screen
from kivy.uix.screenmanager import ScreenManager
from kivy.uix.screenmanager import SlideTransition
import os

# Create both screens. Please note the root.manager.current: this is how
# you can control the ScreenManager from kv. Each screen has by default a
# property manager that gives you the instance of the ScreenManager used.

# Declare both screens


__version__ = '1.0.0'

slides = ["Register", "Welcome", "Login"]
for slide in slides:
    kv_file = "{}.kv".format(slide.lower())
    Builder.load_file(os.path.join("slides", kv_file))


class RegisterScreen(Screen):
    pass


class WelcomeScreen(Screen):
    pass


class LoginScreen(Screen):
    pass


class veni(BoxLayout):
    def __init__(self, **kwargs):
        super(veni, self).__init__(**kwargs)
        self.orientation = 'vertical'
        self.content = ScreenManager()
        self.content.add_widget(RegisterScreen(name='Register'))
        self.content.add_widget(WelcomeScreen(name='Welcome'))
        self.content.add_widget(LoginScreen(name="Login"))
        self.content.current = 'Welcome'
        self.add_widget(self.content)
        self.slide_menu = SlideMenu(root=self)
        self.add_widget(self.slide_menu)

    def get_current_slide(self):
        return self.content.current

    def set_current_slide(self, jump_to):
        if slides.index(jump_to) >= slides.index(self.get_current_slide()):
            self.set_transition('left')
        else:
            self.set_transition('right')
        self.content.current = jump_to
        self.slide_menu.ids.slide_spinner.text = ""

    def set_transition(self, direction):
        self.content.transition = SlideTransition(direction=direction)


Builder.load_file("slidemenu.kv")


class SlideMenu(BoxLayout):
    slide_spinner = ObjectProperty(None)

    def __init__(self, root, **kwargs):
        super(SlideMenu, self).__init__(**kwargs)
        self.root = root
        self.slide_spinner.values = slides

    def go_slide(self, spinner):
        if spinner.text in slides:
            self.root.set_current_slide(spinner.text)

    def go_prev(self):
        cur_index = slides.index(self.root.get_current_slide())
        prev_index = cur_index if cur_index == 0 else cur_index-1
        self.root.set_current_slide(slides[prev_index])

    def go_next(self):
        cur_index = slides.index(self.root.get_current_slide())
        next_index = cur_index if cur_index == len(slides)-1 else cur_index+1
        self.root.set_current_slide(slides[next_index])


class veniApp(App):
    font_size_regular = sp(20)
    font_size_large = font_size_regular * 2
    font_size_xlarge = font_size_regular * 3

    def build(self):
        return veni()

if __name__ == '__main__':
    veniApp().run()