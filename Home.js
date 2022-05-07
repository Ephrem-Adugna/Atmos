import { StyleSheet, Text, View, Image, Keyboard, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Clipboard from 'expo-clipboard';

export default function Home({navigation}) {
  const [text, setText] = React.useState('');
  const [opened, setOpened] = React.useState(false);
  return (
    <View style={styles.container} onTouchEnd={() => { if (opened) { Keyboard.dismiss() }}}>
   
      <Text style={styles.title}>Send A Message To
        Your PC</Text>
      <TouchableOpacity onPress={async() => {
        let sendtext = await Clipboard.getStringAsync();
        const jsonValue = await AsyncStorage.getItem('@devices')
        let devices = jsonValue != null ? JSON.parse(jsonValue) : null;
        fetch(devices[0] + '/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: sendtext,
            from: Device.deviceName
          })
        })
      }}>
      <Image  style={{height: 150, width: 150}} source={require('./Paste.png')}></Image>
      
        </TouchableOpacity><Text style={{
        fontSize: 30,
        color: 'white',
        textAlign: 'center',
        width: '100%',
        marginTop: 10
      }}>Send Copied Item</Text>
      <ScrollView style={{ height: 200, width: '90%' }}>
        <TextInput placeholder='Write a Message' value={text} onTouchEnd={()=>{setOpened(!opened)}} onChange={(e)=>{setText(e.nativeEvent.text)}} multiline={true} style={styles.input}></TextInput>
        <TouchableOpacity onPress={async() => {
          const jsonValue = await AsyncStorage.getItem('@devices')
          let devices = jsonValue != null ? JSON.parse(jsonValue) : null;
          fetch(devices[0] + '/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              item: text,
              from: Device.deviceName
            })
          })}} disabled={text.length == 0} style={styles.send}><Text style={{
          color: 'white',
            fontSize: 25, fontWeight: 'bold'
          }}>SEND</Text></TouchableOpacity>
        <TouchableOpacity onPress={async () => {
          AsyncStorage.removeItem('@devices');
          navigation.navigate('AddDevice');
        }}  style={styles.send}><Text style={{
          color: 'white',
          fontSize: 25, fontWeight: 'bold'
        }}>RELINK PC</Text></TouchableOpacity>
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
    backgroundColor: '#211134',
    justifyContent: 'center',
        alignItems: 'center'
  },
  send: {
    width: '90%',
    height: 50,
    backgroundColor: '#257BE1',
    marginLeft: 20,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5
  },
  input: {
    backgroundColor: 'white',
    width: '90%',
    height: 200,
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 20,
    zIndex:10,
  },
  title: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    width: '100%',
    marginBottom: '10%',
   marginTop: 100
  },
})