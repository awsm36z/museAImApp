
# MuseAIm React Native App

The **MuseAIm** project is a **React Native app** designed to provide an interactive platform for museum visitors. The app integrates **real-time chat capabilities** with an **animated character interface** to create a dynamic and engaging user experience.

## 🎨 Animated Characters
The app includes customizable animated characters using sprite sheets or individual PNG frames. These characters bring life to the interface and respond to user interactions.

### 🔧 Features
- **Idle animation loop** for static screens
- **Talking animation loop** synced with real-time speech outputs
- **Customizable character poses** (e.g., idle, talk, think, etc.)

## 📂 File Structure
```
MuseAImReactNative/
├── assets/
│   └── characters/
│       └── MaleAdventurer/
│           ├── idle/
│           │   ├── frame1.png
│           │   ├── frame2.png
│           │   └── frame3.png
│           └── talk/
│               ├── frame1.png
│               ├── frame2.png
│               └── frame3.png
├── src/
│   └── screens/
│       └── ChatScreen.tsx
└── App.js
```

## 🚀 Getting Started

### 1. Clone the Repository
```
git clone https://github.com/YOUR_USERNAME/MuseAImReactNative.git
cd MuseAImReactNative
```

### 2. Install Dependencies
```
npm install
```

### 3. Run the Project
```
npx react-native run-android
# or
npx react-native run-ios
```

## 🖼️ Customizing Characters
To customize the animated characters, add new PNG frames to the `assets/characters` folder and update the animation logic in `ChatScreen.tsx`.

## 🔧 Built With
- **React Native** – Mobile app framework
- **Animated API** – For smooth animations
- **OpenAI API** – For real-time chat responses

## 📄 License
This project is licensed under the MIT License. Feel free to use it in your own projects!
