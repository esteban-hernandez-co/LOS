//Avoid warning message for AsyncStorage and setTimer
import { LogBox, Platform } from 'react-native'
LogBox.ignoreLogs([
    `AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage`,
])
LogBox.ignoreLogs(['Linking requires a build-time setting'])

LogBox.ignoreLogs(['Setting a timer'])

import { StatusBar } from 'expo-status-bar'
//Navigation component
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
//React native paper
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
//Screens
import HomeScreen from './screens/HomeScreen'
import LoginScreen from './screens/LoginScreen'
import SplashScreen from './screens/SplashScreen'
import RegisterScreen from './screens/RegisterScreen'
import RegisterGoogleScreen from './screens/RegisterGoogleScreen'
//React
import React, { useState, useEffect } from 'react'
//firebase
import { firebaseConfig } from './FirebaseConfig'
import { initializeApp } from 'firebase/app'
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithCredential,
} from 'firebase/auth'
import { initializeFirestore, setDoc, doc, getDoc } from 'firebase/firestore'
//Google signin
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
//Facebook signin
import * as Facebook from 'expo-auth-session/providers/facebook'
import { ResponseType } from 'expo-auth-session'

WebBrowser.maybeCompleteAuthSession()

//Signout module
import Signout from './components/Signout'
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'

//Const Stack for the screen navigation
const Stack = createNativeStackNavigator()
//Firebase initialization
const app = initializeApp(firebaseConfig)
const db = initializeFirestore(app, { useFetchStreams: false })
const FBauth = getAuth()

//General theme
const theme = {
    ...DefaultTheme,
    roundness: 6,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3498db',
        accent: '#f1c40f',
    },
}

export default function App() {
    const [auth, setAuth] = useState(false)
    const [user, setUser] = useState()
    const [userGoogle, setUserGoogle] = useState()
    const [signupError, setSignupError] = useState()
    const [signinError, setSigninError] = useState()
    const [forgotPasswordError, setForgotPasswordError] = useState()
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState()
    

    const [requestGoogle, responseGoogle, promptAsyncGoogle] =
        Google.useIdTokenAuthRequest({
            androidClientId: process.env.ANDROID_ID,
            androidStandaloneAppId: process.env.ANDROID_ID,
            iosStandaloneAppId: process.env.IOS_ID,
            iosClientId: process.env.IOS_ID,
            expoClientId: process.env.WEB_ID,
        })

    const [requestFacebook, responseFacebook, promptAsyncFacebook] =
        Facebook.useAuthRequest({
            responseType: ResponseType.Token,
            clientId: '2806562206313924',
        })

    //Listener for authentication state
    useEffect(() => {
        onAuthStateChanged(FBauth, async (userAuth) => {
            if (userAuth) {
                const docRef = doc(db, 'Users', userAuth.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    if (user === undefined) {
                        setUser(docSnap.data())
                        // console.log('User found and saved')
                        setAuth(true)
                    }
                } else {
                    setAuth(true)
                    // console.log('No such document!')
                }
            } else {
                setAuth(false)
                setUser(null)
            }
        })
    }, [onAuthStateChanged])
    // UseEffect to listen the google auth response to the signin
    useEffect(() => {
        if (responseGoogle?.type === 'success') {
            const { id_token } = responseGoogle.params

            const credential = GoogleAuthProvider.credential(id_token)
            signInWithCredential(FBauth, credential)
                .then(() => {
                    // console.log('User signed in with Google!')
                    // console.log('User Google:', FBauth.currentUser)
                    setUserGoogle(FBauth.currentUser)
                })
                .catch((error) => {
                    const errorCode = error.code
                    const errorMessage = error.message
                    const email = error.email
                    console.log(errorCode, errorMessage, email)
                    const credential =
                        GoogleAuthProvider.credentialFromError(error)
                })
        }
    }, [responseGoogle])
    // UseEffect to listen the facebook auth response to the signin
    useEffect(() => {
        if (responseFacebook?.type === 'success') {
            const { access_token } = responseFacebook.params

            const credential = FacebookAuthProvider.credential(access_token)
            // Sign in with the credential from the Facebook user.
            signInWithCredential(FBauth, credential)
                .then(() => {
                    // console.log('User signed in with Facebook!')
                    // console.log('User Facebook:', FBauth.currentUser)
                    setUserGoogle(FBauth.currentUser)
                })
                .catch((error) => {
                    const errorCode = error.code
                    const errorMessage = error.message
                    const email = error.email
                    console.log(errorCode, errorMessage, email)
                    const credential =
                        FacebookAuthProvider.credentialFromError(error)
                })
        }
    }, [responseFacebook])

    //Function to signup with email
    const SignupHandler = (
        email,
        password,
        firstName,
        lastName,
        dob,
        phoneNumber
    ) => {
        setSignupError(null)
        createUserWithEmailAndPassword(FBauth, email, password)
            .then(() => {
                setDoc(doc(db, 'Users', FBauth.currentUser.uid), {
                    email: email,
                    firstname: firstName,
                    lastname: lastName,
                    dob: dob,
                    phoneNumber: phoneNumber,
                    admin: false,
                    guardian: false,
                    elderly: false,
                })

                setUser(FBauth.currentUser.user)
                setAuth(true)
            })
            .catch((error) => {
                setSignupError(error.code)
                setTimeout(() => {
                    setSignupError('')
                }, 3000)
            })
    }

    //Function to signup with Google
    const SignupGoogleHandler = (
        email,
        firstName,
        lastName,
        dob,
        phoneNumber
    ) => {
        setDoc(doc(db, 'Users', FBauth.currentUser.uid), {
            email: email,
            firstname: firstName,
            lastname: lastName,
            dob: dob,
            phoneNumber: phoneNumber,
            admin: false,
            guardian: false,
            elderly: false,
        })
    }

    //Function to signin with email
    const SigninHandler = (email, password) => {
        signInWithEmailAndPassword(FBauth, email, password)
            .then(() => {
                setUser(FBauth.currentUser.user)
                setAuth(true)
            })
            .catch((error) => {
                const message = error.code.includes('/')
                    ? error.code.split('/')[1].replace(/-/g, ' ')
                    : error.code
                setSigninError(message)
                setTimeout(() => {
                    setSigninError('')
                }, 3000)
            })
    }

    //Function to signout
    const SignoutHandler = () => {
        signOut(FBauth)
            .then(() => {
                setAuth(false)
                setUser(null)
            })
            .catch((error) => console.log(error.code))
    }

    //Function to reset password
    const resetPassword = (email) => {
        sendPasswordResetEmail(FBauth, email)
            .then(() => {
                setForgotPasswordSuccess('Email sent!')
                setTimeout(() => {
                    setForgotPasswordSuccess('')
                }, 3000)
            })
            .catch((error) => {
                console.log(error.code)
                setForgotPasswordError(error.code)
                setTimeout(() => {
                    setForgotPasswordError('')
                }, 3000)
            })
    }

    //Function to login/signup with Google
    const googleLogin = () => {
        promptAsyncGoogle()
    }
    //Function to login/signup with Facebook
    const facebookLogin = () => {
        promptAsyncFacebook()
    }

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator>
                    {/* Splash screen */}
                    <Stack.Screen
                        name="Splash"
                        options={{ headerShown: false }}
                    >
                        {(props) => <SplashScreen {...props} auth={auth} />}
                    </Stack.Screen>
                    {/* Login screen */}
                    <Stack.Screen name="Login" options={{ headerShown: false }}>
                        {(props) => (
                            <LoginScreen
                                {...props}
                                auth={auth}
                                user={user}
                                error={signinError}
                                handler={SigninHandler}
                                googleLogin={googleLogin}
                                facebookLogin={facebookLogin}
                            />
                        )}
                    </Stack.Screen>
                    {/* Register screen */}
                    <Stack.Screen
                        name="Register"
                        options={{
                            headerTitle: 'Create Account',
                            headerTitleStyle: {
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#1A73E9',
                            },
                        }}
                    >
                        {(props) => (
                            <RegisterScreen
                                {...props}
                                user={user}
                                error={signupError}
                                handler={SignupHandler}
                            />
                        )}
                    </Stack.Screen>
                    {/* Register Google screen */}
                    <Stack.Screen
                        name="RegisterGoogle"
                        options={{ headerShown: false }}
                    >
                        {(props) => (
                            <RegisterGoogleScreen
                                {...props}
                                auth={auth}
                                user={userGoogle}
                                error={signupError}
                                handler={SignupGoogleHandler}
                                signoutHandler={SignoutHandler}
                            />
                        )}
                    </Stack.Screen>
                    {/* ForgotPassword screen */}
                    <Stack.Screen
                        name="ForgotPassword"
                        options={{
                            headerTitle: 'Forgot Password',
                            headerTitleStyle: {
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#1A73E9',
                            },
                        }}
                    >
                        {(props) => (
                            <ForgotPasswordScreen
                                {...props}
                                user={user}
                                error={forgotPasswordError}
                                success={forgotPasswordSuccess}
                                handler={resetPassword}
                            />
                        )}
                    </Stack.Screen>
                    {/* Home screen */}
                    <Stack.Screen
                        name="Home"
                        options={{
                            headerShown: true,
                            headerTitle: 'Home',
                            headerRight: (props) => (
                                <Signout
                                    {...props}
                                    handler={SignoutHandler}
                                    user={user}
                                />
                            ),
                        }}
                    >
                        {(props) => (
                            <HomeScreen {...props} auth={auth} user={user} />
                        )}
                    </Stack.Screen>
                </Stack.Navigator>
                <StatusBar style="auto" />
            </NavigationContainer>
        </PaperProvider>
    )
}
