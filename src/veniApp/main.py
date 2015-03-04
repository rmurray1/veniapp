from kivy.app import App
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen

# Create both screens. Please note the root.manager.current: this is how
# you can control the ScreenManager from kv. Each screen has by default a
# property manager that gives you the instance of the ScreenManager used.

# Declare both screens
class RegisterScreen(Screen):
    pass

class WelcomeScreen(Screen):
    pass

class LoginScreen(Screen):
    pass

class veniApp(App):

    def build(self):
        sm = ScreenManager()
        sm.add_widget(RegisterScreen(name='register'))
        sm.add_widget(WelcomeScreen(name='welcome'))
        sm.add_widget(LoginScreen(name='login'))
        sm.current = 'welcome'
        return sm

if __name__ == '__main__':
    veniApp().run()