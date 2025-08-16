declare module '@react-native-async-storage/async-storage' {
  type Key = string
  type Value = string
  type MaybeValue = string | null
  type KeyValuePair = [Key, MaybeValue]
  type KeyValuePairSet = [Key, Value]

  const AsyncStorage: {
    getItem(key: Key): Promise<MaybeValue>
    setItem(key: Key, value: Value): Promise<void>
    removeItem(key: Key): Promise<void>
    clear(): Promise<void>
    getAllKeys(): Promise<Key[]>
    multiGet(keys: Key[]): Promise<KeyValuePair[]>
    multiSet(keyValuePairs: KeyValuePairSet[]): Promise<void>
    multiRemove(keys: Key[]): Promise<void>
  }

  export default AsyncStorage
}