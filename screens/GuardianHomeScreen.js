import React, { useEffect, useState, useMemo } from 'react'
import { StyleSheet, Text, View, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, ScrollView, Image } from 'react-native'
import {
    Button,
    IconButton,
    TextInput as TextInputCustom,
} from 'react-native-paper'
import Constants from 'expo-constants'

const GuardianHomeScreen = (props) => {
    const [email, setEmail] = useState('')
    const [filteredData, setFilteredData] = useState([])
    const [elderlyUsers, setElderlyUsers] = useState([])
    const navigation = useNavigation()

    useEffect(() => {
        if (elderlyUsers.length === 0) {
            setElderlyUsers(props.elderlyUsers)
        }
    }, [])

    const handleFilter = () => {
        setFilteredData([])
        elderlyUsers.map((elder) => {
            if (elder.email === email) {
                const newFilter = elderlyUsers.filter((text) => {
                    return text.email
                        .toLowerCase()
                        .includes(email.toLowerCase())
                })
                if (email === '') {
                    setFilteredData([])
                } else {
                    setFilteredData(newFilter)
                }
            }
        })
    }

    const handleAdd = (elderly) => {
        Alert.alert(
            'Elderly added',
            `${elderly.firstname} ${elderly.lastname} has been added to your list`
        )
        setEmail('')
        setFilteredData([])
        props.addElderlyUser(elderly)
    }

    useEffect(() => {
        if (!props.auth) {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
        } else {
            // console.log(props.user)
            if (!props.user.elderly && !props.user.guardian) {
                navigation.reset({ index: 0, routes: [{ name: 'SelectRole' }] })
                //navigation.navigate('SelectRole',{user: props.user})
            } else {
                if (props.user.elderly) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ElderlyHome' }],
                    })
                }
            }
        }
    }, [props.auth])

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Image
                        style={styles.logo}
                        source={require('../assets/los_logo.png')}
                    />
                    <IconButton
                        icon="menu"
                        color="#000"
                        size={40}
                        onPress={() => navigation.openDrawer()}
                    />
                </View>
                <View style={styles.emailArea}>
                    <TextInputCustom
                        placeholder="Enter email"
                        label="Find elderly by email"
                        mode="outlined"
                        autoComplete="email"
                        activeOutlineColor="#0071c2"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        style={styles.emailInput}
                    />
                    <Button
                        mode="contained"
                        labelStyle={styles.buttonSearchLabel}
                        style={styles.buttonSearch}
                        onPress={() => handleFilter(email)}
                    >
                        search
                    </Button>
                    {filteredData.length > 0 && (
                        <>
                            {filteredData.map((elderly) => {
                                return (
                                    <>
                                        <View
                                            key={elderly.id}
                                            style={styles.elderlyList}
                                        >
                                            <Text
                                                style={styles.elderlylistText}
                                            >
                                                {elderly.firstname}{' '}
                                                {elderly.lastname}
                                            </Text>
                                            <Text
                                                style={styles.elderlylistText}
                                            >
                                                {elderly.email}
                                            </Text>
                                        </View>
                                        <View style={styles.addButtonArea}>
                                            <Button
                                                mode="contained"
                                                labelStyle={
                                                    styles.buttonSearchLabel
                                                }
                                                style={[
                                                    styles.buttonSearch,
                                                    styles.buttonCancel,
                                                ]}
                                                onPress={() => {
                                                    setEmail('')
                                                    setFilteredData([])
                                                }}
                                            >
                                                cancel
                                            </Button>
                                            <Button
                                                mode="contained"
                                                labelStyle={[
                                                    styles.buttonSearchLabel,
                                                    styles.buttonAddLabel,
                                                ]}
                                                style={[
                                                    styles.buttonSearch,
                                                    styles.buttonAdd,
                                                ]}
                                                onPress={() => {
                                                    handleAdd(elderly)
                                                }}
                                            >
                                                add
                                            </Button>
                                        </View>
                                    </>
                                )
                            })}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default GuardianHomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',

        // marginTop: Constants.statusBarHeight,
    },
    scrollView: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    logo: {
        width: 151,
        height: 75,
        marginBottom: '5%',
        marginTop: '5%',
    },
    emailArea: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    emailInput: {
        width: '85%',
        paddingLeft: 10,
        marginBottom: 20,
    },
    buttonSearch: {
        backgroundColor: '#ff6b15',
        marginBottom: 20,
    },
    buttonSearchLabel: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 18,
    },
    elderlyList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
        overflow: 'hidden',
        marginBottom: 20,
        borderRadius: 6,
        borderColor: '#c1c1c1',
        borderWidth: 1,
    },
    elderlylistText: {
        padding: 10,
        fontSize: 18,
    },
    addButtonArea: {
        flexDirection: 'row',
        width: '85%',
        justifyContent: 'space-between',
    },
    buttonCancel: {
        backgroundColor: 'red',
    },
    buttonAdd: {
        backgroundColor: '#2D71B6',
    },
    buttonAddLabel: {
        paddingHorizontal: 30,
    },
})
