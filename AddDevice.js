import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React,{useState, useEffect} from 'react'
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Device from 'expo-device';
import { Entypo } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddDevice({navigation}) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [allowed, setAllowed] = useState(null);
    const [link, setLink] = useState('');

    const [clicked, setClicked] = useState(false);
    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
                const jsonValue = await AsyncStorage.getItem('@devices')
               let devices = jsonValue != null ? JSON.parse(jsonValue) : null
            if (devices != null) { 
                navigation.navigate('Home')
            }
            setScanned(false)
            setAllowed(null)
            setLink('');
            setClicked(false)
        })();
    }, []);

    const handleBarCodeScanned =async ({ type, data }) => {
        setScanned(true);
        setClicked(false);
        setLink(data);
        fetch(data+'/request', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: Device.deviceName
            })
        }).then((response) => response.json())
            .then((json) => {
                setAllowed(json.allowed);
                if (json.allowed) {
                    setTimeout(async() => {
                        const jsonValue = await AsyncStorage.getItem('@devices')
                        let devices = jsonValue != null ? JSON.parse(jsonValue) : null;
                        console.log(devices)
                        if (devices != null && !devices.includes(data)) {
                            await AsyncStorage.setItem('@devices', devices.push(data));
                        }
                        else if(devices == null){
                            await AsyncStorage.setItem('@devices', JSON.stringify([data]));
                        }
                        navigation.navigate('Home');
                    }, 1500);
                }
                else {
                    setTimeout(() => {
                        setScanned(false)
                        setAllowed(null)
                        setLink('');
                        setClicked(false)
                    }, 1500);
                }
            })
    };

   
    return (
      
        <View style={styles.container}>
            {
                 !scanned &&<View>
                <Text style={styles.title}>Add your PC by scanning
                    the QR Code</Text>
                <View style={styles.button} onTouchEnd={() => { setClicked(true) }}>
                    <Text style={styles.btntitle}>+</Text>
                </View>{clicked &&
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />}
            </View>
            }
            {
                scanned && <View style={{alignItems: 'center'}}>
                    <Text style={styles.title}>Requesting Permission to Add Your PC</Text>
                    {allowed == false &&

                        <Entypo name="cross" size={40} color="red" />
                    }
                    {allowed &&

                        <Entypo name="check" size={40} color="green" />
                    }
                    {allowed == null && 
                        <ActivityIndicator size="large" />
                    }
                </View>
            }
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#211134'
    },
    title: {
        fontSize: 30,
        color: 'white',
        textAlign: 'center',
        width: '100%',
        marginTop: '50%'
    },
    btntitle: {
        fontSize: 30,
        color: 'white',
        textAlign: 'center',
        width: '100%',
    },
    button: {
        height: 80,
        width: 80,
        backgroundColor: '#257BE1',
        justifyContent: 'center',
        borderRadius: 80,
        marginLeft: '40%',
        marginTop: '30%',
    }
})