import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Verifica se estamos rodando na web
const isWeb = Platform.OS === 'web';

export const storage = {
  // Função genérica para SALVAR
  setItem: async (key, value) => {
    if (isWeb) {
      // Na web, usa AsyncStorage
      await AsyncStorage.setItem(key, value);
    } else {
      // No celular, usa SecureStore
      await SecureStore.setItemAsync(key, value);
    }
  },

  // Função genérica para LER
  getItem: async (key) => {
    if (isWeb) {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  // Função genérica para DELETAR
  deleteItem: async (key) => {
    if (isWeb) {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};