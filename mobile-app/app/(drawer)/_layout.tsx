import React, { useState } from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router'
import { Menu } from 'lucide-react-native'
import FullScreenMenu from '../../components/FullScreenMenu'

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuButton}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Menu size={26} color='#FF69B4' />
    </TouchableOpacity>
  )
}

export default function DrawerLayout() {
  const [menuVisible, setMenuVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#FF69B4',
          headerTitle: () => null,
          headerLeft: () => <MenuButton onPress={() => setMenuVisible(true)} />,
          headerRight: () => <Image source={require('../../assets/ciftopia-logo.png')} style={styles.logo} />
        }}
      >
        <Stack.Screen name='dashboard' options={{ title: 'Ciftopia' }} />
        <Stack.Screen name='daily-question' options={{ title: 'Günün Sorusu' }} />
        <Stack.Screen name='bucket-list' options={{ title: 'Hayallerimiz' }} />
        <Stack.Screen name='important-dates' options={{ title: 'Özel Günler' }} />
        <Stack.Screen name='memories' options={{ title: 'Anılarımız' }} />
        <Stack.Screen name='gallery' options={{ title: 'Aşk Galerisi' }} />
        <Stack.Screen 
          name='gallery/[id]' 
          options={{ 
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
          }} 
        />
        <Stack.Screen name='poems' options={{ title: 'Şiir Defteri' }} />
        <Stack.Screen name='notes' options={{ title: 'Aşk Notları' }} />
        <Stack.Screen name='time-capsule' options={{ title: 'Zaman Kapsülü' }} />
        <Stack.Screen name='activities' options={{ title: 'Güncellemeler' }} />
        <Stack.Screen name='quiz' options={{ title: 'Aşk Quizi' }} />
        <Stack.Screen name='mood-calendar' options={{ title: 'Ruh Hali Takvimi' }} />
        <Stack.Screen name='space-explorer' options={{ title: 'Uzay Keşfi', headerShown: false }} />
        <Stack.Screen name='store' options={{ headerShown: false }} />
        <Stack.Screen name='settings' options={{ title: 'Ayarlar' }} />
        <Stack.Screen name='poems-tips' options={{ headerShown: false }} />
        <Stack.Screen name='poems-romantic' options={{ headerShown: false }} />
      </Stack>

      <FullScreenMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  menuButton: {
    padding: 4,
    marginLeft: 16
  },
  logo: {
    marginRight: 16,
    width: 50,
    height: 50
  }
})
